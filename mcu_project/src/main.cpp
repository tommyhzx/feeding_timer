#include <Arduino.h>
#include "keyboard_module.h"
#include "pixel_display.h"

// ========== 全局对象 ==========

void setup()
{
    Serial.begin(115200);
    delay(1000); // 等待 USB CDC 初始化完成
    Serial.println("=== ESP32-S3 Button + Pixel Display ===");

    // 初始化像素屏模块 (包含RGB LED)
    pixel_init();

    // 初始化按键模块
    keyboard_init();

    Serial.println("System Ready!");
    Serial.println("Press button to increment counter (0-99)...");
}

void loop()
{
    uint32_t now = millis();

    // 计数器模式下不需要更新像素屏动画
    // pixel_update(now);  // 已禁用演示模式

    // 更新按键状态
    keyboard_update(now);

    // GPIO调试信息 - 每1000ms打印一次
    static uint32_t lastDebugTime = 0;
    if (now - lastDebugTime >= 1000)
    {
        lastDebugTime = now;
        bool rowState = digitalRead(7);  // ROW_PIN
        Serial.print("[DEBUG] GPIO7(row) = ");
        Serial.print(rowState ? "HIGH (未按下)" : "LOW (已按下)");
        Serial.print(" | GPIO4(col) = ");
        Serial.print(digitalRead(4));  // COL_PIN
        Serial.println(" | System running");
    }

    // 小延时防止CPU占用过高
    delay(1);
}
