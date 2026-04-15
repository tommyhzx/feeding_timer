#include <Arduino.h>
#include "keyboard_module.h"
#include "pixel_display.h"
#include "wifi_module.h"

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

    // 初始化Wi-Fi模块
    wifi_init();

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

    // 更新Wi-Fi状态（NTP同步、重连等）
    wifi_update(now);

    // 每秒更新一次像素屏显示的分钟数
    static uint32_t lastSecondUpdate = 0;
    static int8_t lastDisplayedMinute = -1;
    if (now - lastSecondUpdate >= 1000)
    {
        lastSecondUpdate = now;
        int hour, minute, second;
        if (wifi_get_ntp_time(&hour, &minute, &second))
        {
            // 当分钟变化时更新像素屏
            if (minute != lastDisplayedMinute)
            {
                lastDisplayedMinute = minute;
                pixel_set_minute(minute);
            }
        }
    }

    // 每60秒显示一次当前时间到串口
    static uint32_t lastTimeDisplay = 0;
    if (now - lastTimeDisplay >= 60000)
    {
        lastTimeDisplay = now;
        int hour, minute, second;
        if (wifi_get_ntp_time(&hour, &minute, &second))
        {
            Serial.print("[时间] ");
            if (hour < 10) Serial.print("0");
            Serial.print(hour);
            Serial.print(":");
            if (minute < 10) Serial.print("0");
            Serial.print(minute);
            Serial.print(":");
            if (second < 10) Serial.print("0");
            Serial.print(second);
            Serial.print(" | Wi-Fi: ");
            Serial.println(wifi_get_status_str());
        }
        else
        {
            Serial.print("[时间] 未同步 | Wi-Fi: ");
            Serial.println(wifi_get_status_str());
        }
    }

    // 小延时防止CPU占用过高
    delay(1);
}
