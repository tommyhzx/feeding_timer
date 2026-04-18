#include <Arduino.h>
#include "keyboard_module.h"
#include "max7219_display.h"
#include "wifi_module.h"

// ========== 全局对象 ==========

void setup()
{
    Serial.begin(115200);
    delay(1000); // 等待 USB CDC 初始化完成
    Serial.println("=== ESP32-S3 Button + MAX7219 Display ===");

    // 初始化MAX7219显示模块
    max7219_init();

    // 初始化按键模块
    keyboard_init();

    // 初始化Wi-Fi模块
    wifi_init();

    Serial.println("System Ready!");
}

void loop()
{
    uint32_t now = millis();

    // 更新按键状态
    keyboard_update(now);

    // 更新Wi-Fi状态（NTP同步、重连等）
    wifi_update(now);

    // 每秒更新一次MAX7219显示的分钟数
    static uint32_t lastSecondUpdate = 0;
    static int8_t lastDisplayedMinute = -1;
    if (now - lastSecondUpdate >= 1000)
    {
        lastSecondUpdate = now;
        int hour, minute, second;
        if (wifi_get_ntp_time(&hour, &minute, &second))
        {
            // 当分钟变化时更新MAX7219显示
            if (minute != lastDisplayedMinute)
            {
                lastDisplayedMinute = minute;
                max7219_set_minute(minute);
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
