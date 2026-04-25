#include <Arduino.h>
#include <keyboard_module.h>
#include <max7219_display.h>
#include <wifi_module.h>
#include <timer.h>

// ========== 按键回调函数 ==========

/**
 * @brief Mode按键按下回调 - 切换模式
 */
void keyboard_on_mode_pressed()
{
    timer_toggle_mode();
}

/**
 * @brief Enter按键短按回调 - 开始/暂停计时器
 */
void keyboard_on_enter_short_press()
{
    timer_toggle_start();
}

/**
 * @brief Enter按键双击回调 - 清零计时器
 */
void keyboard_on_enter_double_click()
{
    timer_reset();
}

// ========== 主程序 ==========

void setup()
{
    Serial.begin(115200);
    delay(1000); // 等待 USB CDC 初始化完成
    Serial.println("=== ESP32-S3 Clock/Timer Device ===");

    // 初始化MAX7219显示模块
    max7219_init();

    // 测试显示
    // Serial.println("Testing display...");
    // max7219_set_intensity(1); // 中等亮度

    // Serial.println("--- Column Test ---");
    // max7219_test_columns(500); // 逐列测试，每列0.5秒

    // Serial.println("--- Row Test ---");
    // max7219_test_rows(500); // 逐行测试，每行0.5秒

    Serial.println("--- Time Display Test ---");
    max7219_set_time(12, 34); // 测试显示 12:34
    delay(3000);
    max7219_set_time(8, 5); // 测试显示 8:05
    delay(3000);
    max7219_set_time(23, 59); // 测试显示 23:59
    delay(3000);

    // 初始化按键模块
    keyboard_init();

    // 初始化Wi-Fi模块
    wifi_init();

    // 初始化计时器模块
    timer_init();

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

    // 更新计时器逻辑
    timer_update(now);

    // 更新显示
    timer_display_update(now);
    // 小延时防止CPU占用过高
    delay(1);
}
