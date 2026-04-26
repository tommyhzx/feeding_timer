#include "keyboard_module.h"
#include "max7219_display.h"
#include <Arduino.h>

// ========== 按键模块状态 ==========

// 按键配置 - 单个矩阵按键
KeyInfo keys[1] = {
    {0, LOW, LOW, 0, 0, 0, 0} // 单个按键（初始状态设为 LOW/释放）
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
    // 配置矩阵按键引脚
    // COL (GPIO7) 设为 OUTPUT，默认 LOW
    pinMode(MODE_COL_PIN, OUTPUT);
    digitalWrite(MODE_COL_PIN, LOW);

    // ROW (GPIO4) 设为 INPUT_PULLDOWN
    pinMode(MODE_ROW_PIN, INPUT_PULLDOWN);

    Serial.print("GPIO ");
    Serial.print(MODE_COL_PIN);
    Serial.print(" (COL) configured as OUTPUT_LOW\n");
    Serial.print("GPIO ");
    Serial.print(MODE_ROW_PIN);
    Serial.print(" (ROW) configured as INPUT_PULLDOWN\n");
    Serial.println("Matrix keyboard initialized (single key on GPIO7/GPIO4)");
}

void keyboard_update(uint32_t now)
{
    // 静态变量用于跟踪长按和短按触发
    static bool pendingShortPress = false;
    static uint32_t shortPressTriggerTime = 0;
    static bool longPressTriggered = false;
    static uint32_t lastDebugPrintTime = 0;

    // 每500ms打印一次当前状态（仅当按键按下时）
    KeyInfo &debugKey = keys[0];
    if (debugKey.currentState == HIGH && now - lastDebugPrintTime > 500)
    {
        Serial.print("Still pressed, duration=");
        Serial.print(now - debugKey.pressStartTime);
        Serial.print("ms, longPressTriggered=");
        Serial.println(longPressTriggered);
        lastDebugPrintTime = now;
    }

    // 矩阵按键扫描
    // 1. 将 COL 设为 HIGH
    digitalWrite(MODE_COL_PIN, HIGH);
    delayMicroseconds(10); // 短暂延时让电平稳定

    // 2. 读取 ROW 状态 (HIGH = 按下, LOW = 释放)
    bool rawState = digitalRead(MODE_ROW_PIN);

    // 3. 将 COL 恢复为 LOW（节省功耗）
    digitalWrite(MODE_COL_PIN, LOW);

    // 使用第一个按键结构体存储状态（只有1个物理按键）
    KeyInfo &key = keys[0];

    // 检测状态变化
    if (rawState != key.currentState)
    {
        key.lastChangeTime = now;
        key.currentState = rawState;
        Serial.print("State change detected: rawState=");
        Serial.print(rawState ? "HIGH (pressed)" : "LOW (released)");
        Serial.print(", time=");
        Serial.println(now);

        // 立即记录按下时间（不等消抖），避免长按检测使用旧时间戳
        if (rawState == HIGH)
        {
            key.pressStartTime = now;
            longPressTriggered = false;
            Serial.print("PressStartTime updated to ");
            Serial.println(now);
        }
    }

    // 等待消抖时间后确认状态
    if ((now - key.lastChangeTime >= DEBOUNCE_MS) &&
        (key.lastStableState != key.currentState))
    {
        key.lastStableState = key.currentState;
        Serial.print("Debounced state: ");
        Serial.print(key.currentState ? "HIGH (pressed)" : "LOW (released)");
        Serial.print(", longPressTriggered=");
        Serial.println(longPressTriggered);

        if (key.currentState == HIGH)
        {
            // 按键按下消抖确认 - 只处理视觉反馈
            // pressStartTime 和 longPressTriggered 已在状态变化时更新
            Serial.println("Button press confirmed (debounce)");

            // MAX7219 视觉反馈 - 增加亮度
            max7219_set_feedback(true);
        }
        else
        {
            // 按键释放
            // MAX7219 视觉反馈 - 恢复正常亮度
            max7219_set_feedback(false);
            Serial.print("Button released, longPressTriggered=");
            Serial.println(longPressTriggered);

            // 如果不是长按触发的释放，则检查短按/双击
            if (!longPressTriggered)
            {
                // 检查是否在双击时间窗口内
                if (now - key.lastReleaseTime < DOUBLE_CLICK_MS)
                {
                    key.clickCount++;

                    // 检测到双击
                    if (key.clickCount >= 2)
                    {
                        Serial.println("Double click detected! -> Reset timer");
                        keyboard_on_enter_double_click();
                        key.clickCount = 0;
                        pendingShortPress = false;
                    }
                    else
                    {
                        pendingShortPress = true;
                        shortPressTriggerTime = now + DOUBLE_CLICK_MS;
                    }
                }
                else
                {
                    key.clickCount = 1;
                    pendingShortPress = true;
                    shortPressTriggerTime = now + DOUBLE_CLICK_MS;
                }

                key.lastReleaseTime = now;
            }
            else
            {
                // 长按后释放，重置状态
                Serial.println("Long press released - resetting longPressTriggered");
                longPressTriggered = false;
                key.clickCount = 0; // 清除点击计数，防止后续误触发
            }
        }
    }

    // 检查长按（在按键持续按下时）
    if (key.currentState == HIGH && !longPressTriggered)
    {
        uint32_t pressDuration = now - key.pressStartTime;
        // 每200ms打印一次持续时间，帮助调试
        if (pressDuration > 0 && pressDuration % 200 < 20)
        {
            Serial.print("Press duration: ");
            Serial.print(pressDuration);
            Serial.println("ms");
        }
        if (pressDuration >= LONG_PRESS_MS)
        {
            Serial.print("Long press detected! duration=");
            Serial.print(pressDuration);
            Serial.print("ms, pressStartTime=");
            Serial.print(key.pressStartTime);
            Serial.print(", now=");
            Serial.println(now);
            Serial.println("-> Toggle mode");
            keyboard_on_mode_pressed();
            longPressTriggered = true;
            pendingShortPress = false;
        }
    }

    // 检查是否需要触发短按回调（只在按键已释放且未长按时触发）
    if (pendingShortPress && now >= shortPressTriggerTime && key.currentState == LOW && !longPressTriggered)
    {
        Serial.println("Short press detected! -> Toggle start/stop");
        keyboard_on_enter_short_press();
        pendingShortPress = false;
        key.clickCount = 0;
    }
    // 超时清除待处理状态
    else if (pendingShortPress && now >= shortPressTriggerTime)
    {
        pendingShortPress = false;
        key.clickCount = 0;
    }
}
