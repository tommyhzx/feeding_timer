#include "keyboard_module.h"
#include "max7219_display.h"
#include <Arduino.h>

// ========== 按键模块状态 ==========

// 按键配置 - 两个独立按键
KeyInfo keys[KEY_COUNT] = {
    {MODE_PIN, HIGH, HIGH, 0, 0, 0, 0},   // MODE 按键
    {ENTER_PIN, HIGH, HIGH, 0, 0, 0, 0},  // ENTER 按键
};

// 按键名称 (用于调试输出)
static const char* keyNames[KEY_COUNT] = {
    "MODE",
    "ENTER"
};

// ========== 弱定义回调函数 (可在 main.cpp 中覆盖) ==========

void keyboard_on_mode_pressed() __attribute__((weak));
void keyboard_on_mode_pressed()
{
    // 默认实现：切换显示模式或执行其他功能
    Serial.println("MODE button pressed - default action");
}

void keyboard_on_enter_pressed() __attribute__((weak));
void keyboard_on_enter_pressed()
{
    // 默认实现：触发显示更新
    Serial.println("ENTER button pressed - default action");
}

void keyboard_on_enter_short_press() __attribute__((weak));
void keyboard_on_enter_short_press()
{
    // 默认实现：短按处理
    Serial.println("ENTER button short press - default action");
}

void keyboard_on_enter_double_click() __attribute__((weak));
void keyboard_on_enter_double_click()
{
    // 默认实现：双击处理
    Serial.println("ENTER button double click - default action");
}

// ========== 按键模块实现 ==========

void keyboard_init()
{
    // 配置两个独立按键为 INPUT_PULLUP
    for (uint8_t i = 0; i < KEY_COUNT; i++)
    {
        pinMode(keys[i].gpio, INPUT_PULLUP);
        Serial.print("GPIO ");
        Serial.print(keys[i].gpio);
        Serial.print(" (");
        Serial.print(keyNames[i]);
        Serial.println(") configured as INPUT_PULLUP");
    }
}

void keyboard_update(uint32_t now)
{
    // 静态变量用于跟踪短按触发（只对 ENTER 按键）
    static bool pendingShortPress = false;
    static uint32_t shortPressTriggerTime = 0;

    for (uint8_t i = 0; i < KEY_COUNT; i++)
    {
        KeyInfo &key = keys[i];

        // 读取GPIO状态 (按下时为LOW，释放时为HIGH)
        bool rawState = digitalRead(key.gpio);

        // 检测状态变化
        if (rawState != key.currentState)
        {
            key.lastChangeTime = now;
            key.currentState = rawState;
            Serial.print("[KEY] ");
            Serial.print(keyNames[i]);
            Serial.print(" (GPIO");
            Serial.print(key.gpio);
            Serial.print(") -> ");
            Serial.println(rawState ? "HIGH" : "LOW");
        }

        // 等待消抖时间后确认状态
        if ((now - key.lastChangeTime >= DEBOUNCE_MS) &&
            (key.lastStableState != key.currentState))
        {
            key.lastStableState = key.currentState;

            if (key.currentState == LOW)
            {
                // 按键按下
                Serial.print(keyNames[i]);
                Serial.println(" button pressed");

                // 记录按下时间
                key.pressStartTime = now;

                // MAX7219 视觉反馈 - 增加亮度
                max7219_set_feedback(true);

                // 调用对应的按下回调函数
                switch (i)
                {
                case KEY_MODE:
                    keyboard_on_mode_pressed();
                    break;
                case KEY_ENTER:
                    keyboard_on_enter_pressed();
                    break;
                }
            }
            else
            {
                // 按键释放
                Serial.print(keyNames[i]);
                Serial.println(" button released");

                // MAX7219 视觉反馈 - 恢复正常亮度
                max7219_set_feedback(false);

                // 只对 ENTER 按键进行双击检测
                if (i == KEY_ENTER)
                {
                    // 检查是否在双击时间窗口内
                    if (now - key.lastReleaseTime < DOUBLE_CLICK_MS)
                    {
                        key.clickCount++;
                        Serial.print("ENTER click count: ");
                        Serial.println(key.clickCount);

                        // 检测到双击
                        if (key.clickCount >= 2)
                        {
                            Serial.println("ENTER double click detected!");
                            keyboard_on_enter_double_click();
                            key.clickCount = 0;  // 重置点击计数
                            pendingShortPress = false;  // 取消待触发的短按
                        }
                        else
                        {
                            // 等待可能的双击
                            pendingShortPress = true;
                            shortPressTriggerTime = now + DOUBLE_CLICK_MS;
                        }
                    }
                    else
                    {
                        // 超过双击时间窗口，重置计数
                        key.clickCount = 1;
                        pendingShortPress = true;
                        shortPressTriggerTime = now + DOUBLE_CLICK_MS;
                    }

                    key.lastReleaseTime = now;
                }
            }
        }
    }

    // 检查是否需要触发短按回调（在循环外处理，避免重复触发）
    if (pendingShortPress && now >= shortPressTriggerTime)
    {
        if (keys[KEY_ENTER].clickCount == 1)
        {
            Serial.println("ENTER short press detected!");
            keyboard_on_enter_short_press();
        }
        pendingShortPress = false;
        keys[KEY_ENTER].clickCount = 0;
    }
}
