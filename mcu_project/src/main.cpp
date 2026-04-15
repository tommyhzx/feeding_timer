#include <Arduino.h>
#include <USBHIDKeyboard.h>
#include "keyboard_module.h"
#include "pixel_display.h"

// ========== 全局对象 ==========

USBHIDKeyboard Keyboard;

void setup()
{
    Serial.begin(115200);
    delay(1000); // 等待 USB CDC 初始化完成
    Serial.println("=== ESP32-S3 Keyboard + Pixel Display ===");

    // 初始化USB HID键盘
    Keyboard.begin();
    Serial.println("USB HID Keyboard initialized");

    // 初始化像素屏模块 (包含RGB LED)
    pixel_init();

    // 初始化键盘模块
    keyboard_init();

    Serial.println("System Ready!");
    Serial.println("Press keys to test...");
}

void loop()
{
    uint32_t now = millis();

    // 更新像素屏显示效果
    pixel_update(now);

    // 更新键盘状态
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
