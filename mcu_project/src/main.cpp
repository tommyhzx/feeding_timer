#include <Arduino.h>
#include <keyboard_module.h>
#include <max7219_display.h>
#include <wifi_module.h>

// ========== 应用状态机 ==========

// 应用模式
enum AppMode {
    MODE_CLOCK,      // 时钟模式
    MODE_TIMER       // 计时器模式
};

// 计时器状态
enum TimerState {
    TIMER_IDLE,      // 空闲状态
    TIMER_RUNNING,   // 运行中
    TIMER_PAUSED     // 暂停
};

// 全局状态
AppMode currentMode = MODE_CLOCK;
TimerState timerState = TIMER_IDLE;
uint32_t timerElapsedMs = 0;      // 已计时时长（毫秒）
uint32_t timerLastUpdate = 0;     // 上次更新时间

// 显示更新标志
bool needDisplayUpdate = true;

// ========== 辅助函数 ==========

/**
 * @brief 更新显示内容
 */
void update_display()
{
    needDisplayUpdate = true;
}

// ========== 按键回调函数 ==========

/**
 * @brief Mode按键按下回调 - 切换模式
 */
void keyboard_on_mode_pressed()
{
    if (currentMode == MODE_CLOCK)
    {
        currentMode = MODE_TIMER;
        timerState = TIMER_IDLE;
        timerElapsedMs = 0;
        Serial.println(">>> 切换到计时器模式");
    }
    else
    {
        currentMode = MODE_CLOCK;
        Serial.println(">>> 切换到时钟模式");
    }
    update_display();
}

/**
 * @brief Enter按键短按回调 - 开始/暂停计时器
 */
void keyboard_on_enter_short_press()
{
    if (currentMode == MODE_TIMER)
    {
        if (timerState == TIMER_IDLE || timerState == TIMER_PAUSED)
        {
            timerState = TIMER_RUNNING;
            timerLastUpdate = millis();
            Serial.println(">>> 计时器开始");
        }
        else if (timerState == TIMER_RUNNING)
        {
            timerState = TIMER_PAUSED;
            Serial.println(">>> 计时器暂停");
        }
        update_display();
    }
}

/**
 * @brief Enter按键双击回调 - 清零计时器
 */
void keyboard_on_enter_double_click()
{
    if (currentMode == MODE_TIMER)
    {
        timerState = TIMER_IDLE;
        timerElapsedMs = 0;
        Serial.println(">>> 计时器清零");
        update_display();
    }
}

// ========== 主程序 ==========

void setup()
{
    Serial.begin(115200);
    delay(1000); // 等待 USB CDC 初始化完成
    Serial.println("=== ESP32-S3 Clock/Timer Device ===");

    // 初始化MAX7219显示模块
    max7219_init();

    // 初始化按键模块
    keyboard_init();

    // 初始化Wi-Fi模块
    wifi_init();

    Serial.println("System Ready!");
    Serial.println("默认模式: 时钟模式");
    Serial.println("按 MODE 键切换到计时器模式");
}

void loop()
{
    uint32_t now = millis();

    // 更新按键状态
    keyboard_update(now);

    // 更新Wi-Fi状态（NTP同步、重连等）
    wifi_update(now);

    // ========== 计时器逻辑 ==========
    if (currentMode == MODE_TIMER && timerState == TIMER_RUNNING)
    {
        uint32_t delta = now - timerLastUpdate;
        timerElapsedMs += delta;
        timerLastUpdate = now;
    }

    // ========== 显示更新逻辑 ==========
    static uint32_t lastDisplayUpdate = 0;

    // 每秒更新一次显示（或需要立即更新时）
    if (needDisplayUpdate || (now - lastDisplayUpdate >= 1000))
    {
        lastDisplayUpdate = now;
        needDisplayUpdate = false;

        if (currentMode == MODE_CLOCK)
        {
            // 显示时钟
            int hour, minute, second;
            if (wifi_get_ntp_time(&hour, &minute, &second))
            {
                max7219_set_time(hour, minute);

                // 每分钟输出一次时间到串口
                static uint8_t lastLoggedMinute = 255;
                if (minute != lastLoggedMinute)
                {
                    lastLoggedMinute = minute;
                    Serial.print("[时钟] ");
                    if (hour < 10) Serial.print("0");
                    Serial.print(hour);
                    Serial.print(":");
                    if (minute < 10) Serial.print("0");
                    Serial.print(minute);
                    Serial.print(" | Wi-Fi: ");
                    Serial.println(wifi_get_status_str());
                }
            }
            else
            {
                // 未同步时显示 --
                max7219_set_minute(99);
            }
        }
        else
        {
            // 显示计时器
            uint32_t totalSeconds = timerElapsedMs / 1000;
            uint32_t totalMinutes = totalSeconds / 60;
            uint8_t hours = totalMinutes / 60;
            uint8_t minutes = totalMinutes % 60;

            max7219_set_time(hours, minutes);

            // 每秒输出一次计时器状态到串口
            static uint8_t lastLoggedSecond = 255;
            uint8_t currentSecond = totalSeconds % 60;
            if (currentSecond != lastLoggedSecond)
            {
                lastLoggedSecond = currentSecond;

                Serial.print("[计时器] ");
                if (hours < 10) Serial.print("0");
                Serial.print(hours);
                Serial.print(":");
                if (minutes < 10) Serial.print("0");
                Serial.print(minutes);
                Serial.print(":");
                if (currentSecond < 10) Serial.print("0");
                Serial.print(currentSecond);
                Serial.print(" | 状态: ");

                switch (timerState)
                {
                case TIMER_IDLE:
                    Serial.println("空闲");
                    break;
                case TIMER_RUNNING:
                    Serial.println("运行中");
                    break;
                case TIMER_PAUSED:
                    Serial.println("暂停");
                    break;
                }
            }
        }
    }

    // 小延时防止CPU占用过高
    delay(1);
}
