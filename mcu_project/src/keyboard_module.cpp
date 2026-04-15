#include "keyboard_module.h"
#include "pixel_display.h"
#include <Arduino.h>
#include <USBHIDKeyboard.h>

// ========== 键盘模块状态 ==========

// USB HID Keyboard 对象 (在main.cpp中初始化)
extern USBHIDKeyboard Keyboard;

// 按键配置 - 单个按键测试
KeyInfo keys[1] = {
    {ROW_PIN, KEY_UP_ARROW, HIGH, HIGH, 0, false, 0},
};

// ========== 键盘模块实现 ==========

void keyboard_init()
{
    // 配置矩阵键盘GPIO
    // 列引脚设为输出LOW
    pinMode(COL_PIN, OUTPUT);
    digitalWrite(COL_PIN, LOW);
    Serial.print("GPIO ");
    Serial.print(COL_PIN);
    Serial.println(" configured as OUTPUT_LOW");

    // 行引脚设为输入上拉
    pinMode(ROW_PIN, INPUT_PULLUP);
    Serial.print("GPIO ");
    Serial.print(ROW_PIN);
    Serial.println(" configured as INPUT_PULLUP");
}

void keyboard_update(uint32_t now)
{
    for (auto &key : keys)
    {
        // 读取GPIO状态 (按下时为LOW，释放时为HIGH)
        bool rawState = digitalRead(key.gpio);

        // 检测状态变化
        if (rawState != key.currentState)
        {
            key.lastChangeTime = now;
            key.currentState = rawState;
            Serial.print("[KEY] GPIO");
            Serial.print(key.gpio);
            Serial.print(" -> ");
            Serial.println(rawState ? "HIGH" : "LOW");
        }

        // 等待消抖时间后确认状态
        if ((now - key.lastChangeTime >= DEBOUNCE_MS) &&
            (key.lastStableState != key.currentState))
        {
            key.lastStableState = key.currentState;

            if (key.currentState == LOW)
            {
                // 按键按下 - 发送一次
                Keyboard.press(key.hidCode);
                Serial.println("Key pressed (single)");

                // LED反馈 - 亮蓝色
                pixel_set_feedback(true);
            }
            else
            {
                // 按键释放
                Keyboard.releaseAll();
                Serial.println("Key released");
                key.isRepeating = false;

                // LED反馈 - 熄灭
                pixel_set_feedback(false);
            }
        }

        // 长按重复逻辑
        if (key.lastStableState == LOW)  // 按键当前按下状态
        {
            uint32_t pressDuration = now - key.lastChangeTime;

            // 首次进入重复模式
            if (!key.isRepeating && pressDuration >= LONG_PRESS_MS)
            {
                key.isRepeating = true;
                key.lastRepeatTime = now;
                Serial.println("Entering repeat mode");
            }

            // 重复发送
            if (key.isRepeating && (now - key.lastRepeatTime >= REPEAT_INTERVAL_MS))
            {
                // 先释放再按下，模拟重复按键
                Keyboard.releaseAll();
                delay(5);  // 短暂延时确保释放生效
                Keyboard.press(key.hidCode);

                key.lastRepeatTime = now;
                Serial.println("Key repeat");
            }
        }
    }
}
