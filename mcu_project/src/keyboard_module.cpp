#include "keyboard_module.h"
#include "pixel_display.h"
#include <Arduino.h>

// ========== 按键模块状态 ==========

// 按键配置 - 单个按键
KeyInfo keys[1] = {
    {ROW_PIN, HIGH, HIGH, 0},
};

// ========== 按键模块实现 ==========

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
                // 按键按下 - 计数器+1
                pixel_increment_counter();
                Serial.println("Button pressed - counter incremented");

                // LED反馈 - 亮蓝色
                pixel_set_feedback(true);
            }
            else
            {
                // 按键释放
                Serial.println("Button released");

                // LED反馈 - 熄灭
                pixel_set_feedback(false);
            }
        }
    }
}
