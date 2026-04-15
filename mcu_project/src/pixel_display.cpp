#include "pixel_display.h"
#include <Arduino.h>
#include <Adafruit_NeoPixel.h>

// ========== 像素屏模块状态 ==========

// RGB LED 对象
Adafruit_NeoPixel rgbLED(NUM_RGB_LEDS, RGB_PIN, NEO_GRB + NEO_KHZ800);

// 像素屏对象
Adafruit_NeoPixel pixels(NUM_PIXELS, PIXEL_PIN, NEO_GRB + NEO_KHZ800);

// 像素屏演示模式状态
uint8_t pixelMode = 0;      // 当前模式: 0=彩虹, 1=跑马灯, 2=随机闪烁
uint8_t pixelHue = 0;       // 彩虹色相
uint8_t chaseIndex = 0;     // 跑马灯索引
uint32_t lastPixelUpdate = 0;
uint32_t lastModeSwitch = 0;

// ========== 像素屏模块实现 ==========

void pixel_init()
{
    // 初始化RGB LED
    rgbLED.begin();
    rgbLED.setBrightness(30);
    rgbLED.setPixelColor(0, rgbLED.Color(0, 255, 0)); // 启动成功亮绿灯
    rgbLED.show();
    Serial.println("RGB LED initialized (Green)");

    // 初始化像素屏
    pixels.begin();
    pixels.setBrightness(PIXEL_BRIGHTNESS);
    pixels.clear();
    pixels.show();

    // 启动时显示测试图案 - 红色
    for (int i = 0; i < NUM_PIXELS; i++) {
        pixels.setPixelColor(i, pixels.Color(255, 0, 0));
    }
    pixels.show();
    Serial.println("WS2812B 8x8 Pixel Display initialized (Red test)");
}

void pixel_update(uint32_t now)
{
    // 检查是否到达更新时间
    if (now - lastPixelUpdate < PIXEL_EFFECT_INTERVAL_MS)
    {
        return;
    }
    lastPixelUpdate = now;

    // 模式切换
    if (now - lastModeSwitch >= MODE_SWITCH_INTERVAL_MS)
    {
        lastModeSwitch = now;
        pixelMode = (pixelMode + 1) % 3;
        Serial.print("[PIXEL] Switching to mode: ");
        Serial.println(pixelMode);

        // 清空像素屏
        pixels.clear();
    }

    // 根据当前模式更新像素屏
    switch (pixelMode)
    {
        case 0: // 彩虹渐变填充
        {
            for (int i = 0; i < NUM_PIXELS; i++)
            {
                int pixelHue = (pixelHue + (i * 256 / NUM_PIXELS)) & 0xFF;
                pixels.setPixelColor(i, pixels.ColorHSV(pixelHue * 257, 255, 255));
            }
            pixelHue += 2;
        }
        break;

        case 1: // 跑马灯效果
        {
            // 渐隐效果
            for (int i = 0; i < NUM_PIXELS; i++)
            {
                uint8_t r, g, b;
                uint32_t c = pixels.getPixelColor(i);
                r = (c >> 16) & 0xFF;
                g = (c >> 8) & 0xFF;
                b = c & 0xFF;
                r = r * 0.8; g = g * 0.8; b = b * 0.8;
                pixels.setPixelColor(i, pixels.Color(r, g, b));
            }

            // 设置新像素
            pixels.setPixelColor(chaseIndex, pixels.Color(0, 0, 255)); // 蓝色
            pixels.setPixelColor((chaseIndex + NUM_PIXELS/2) % NUM_PIXELS, pixels.Color(255, 0, 0)); // 红色
            chaseIndex = (chaseIndex + 1) % NUM_PIXELS;
        }
        break;

        case 2: // 随机闪烁
        {
            // 渐隐效果
            for (int i = 0; i < NUM_PIXELS; i++)
            {
                uint8_t r, g, b;
                uint32_t c = pixels.getPixelColor(i);
                r = (c >> 16) & 0xFF;
                g = (c >> 8) & 0xFF;
                b = c & 0xFF;
                r = r * 0.7; g = g * 0.7; b = b * 0.7;
                pixels.setPixelColor(i, pixels.Color(r, g, b));
            }

            // 随机点亮一个像素
            int randPixel = random(NUM_PIXELS);
            uint8_t hue = random(256);
            pixels.setPixelColor(randPixel, pixels.ColorHSV(hue * 257, 255, 255));
        }
        break;
    }

    pixels.show();
}

void pixel_set_feedback(bool pressed)
{
    if (pressed)
    {
        // 按键按下 - 亮蓝色
        rgbLED.setPixelColor(0, rgbLED.Color(0, 0, 255));
    }
    else
    {
        // 按键释放 - 熄灭
        rgbLED.setPixelColor(0, rgbLED.Color(0, 0, 0));
    }
    rgbLED.show();
}
