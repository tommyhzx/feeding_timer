#include "timer.h"
#include <Arduino.h>
#include <max7219_display.h>
#include <wifi_module.h>

// ========== 内部状态 ==========

static AppMode currentMode = MODE_CLOCK;
static TimerState timerState = TIMER_IDLE;
static uint32_t timerElapsedMs = 0;  // 已计时时长（毫秒）
static uint32_t timerLastUpdate = 0; // 上次更新时间
static bool needDisplayUpdate = true;

// ========== 显示更新标志管理 ==========

static void update_display(void)
{
    needDisplayUpdate = true;
}

// ========== 初始化函数 ==========

void timer_init(void)
{
    currentMode = MODE_CLOCK;
    timerState = TIMER_IDLE;
    timerElapsedMs = 0;
    timerLastUpdate = 0;
    needDisplayUpdate = true;
}

// ========== 更新函数 ==========

void timer_update(uint32_t now)
{
    // 更新计时器逻辑
    if (currentMode == MODE_TIMER && timerState == TIMER_RUNNING)
    {
        uint32_t delta = now - timerLastUpdate;
        timerElapsedMs += delta;
        timerLastUpdate = now;
    }
}

void timer_display_update(uint32_t now)
{
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
                max7219_set_time(hour, minute, second);
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
            uint8_t seconds = totalSeconds % 60;

            max7219_set_time(hours, minutes, seconds);
        }
    }
}

// ========== 控制函数 ==========

void timer_toggle_mode(void)
{
    if (currentMode == MODE_CLOCK)
    {
        currentMode = MODE_TIMER;
        // 不重置 timerState 和 timerElapsedMs
        // 让计时器在后台保持运行状态
        Serial.println(">>> 切换到计时器模式");
    }
    else
    {
        currentMode = MODE_CLOCK;
        Serial.println(">>> 切换到时钟模式");
    }
    update_display();
}

bool timer_toggle_start(void)
{
    if (currentMode == MODE_TIMER)
    {
        if (timerState == TIMER_IDLE || timerState == TIMER_PAUSED)
        {
            timerState = TIMER_RUNNING;
            timerLastUpdate = millis();
            Serial.println(">>> 计时器开始");
            update_display();
            return true;
        }
        else if (timerState == TIMER_RUNNING)
        {
            timerState = TIMER_PAUSED;
            Serial.println(">>> 计时器暂停");
            update_display();
            return false;
        }
    }
    return false;
}

void timer_reset(void)
{
    if (currentMode == MODE_TIMER)
    {
        timerState = TIMER_IDLE;
        timerElapsedMs = 0;
        Serial.println(">>> 计时器清零");
        update_display();
    }
}

AppMode timer_get_mode(void)
{
    return currentMode;
}

TimerState timer_get_state(void)
{
    return timerState;
}
