#include "pixel_display.h"
#include <Arduino.h>
#include <Adafruit_NeoPixel.h>

// ========== 像素屏模块状态 ==========

// RGB LED 对象
Adafruit_NeoPixel rgbLED(NUM_RGB_LEDS, RGB_PIN, NEO_GRB + NEO_KHZ800);

// 像素屏对象
Adafruit_NeoPixel pixels(NUM_PIXELS, PIXEL_PIN, NEO_GRB + NEO_KHZ800);

// 像素屏演示模式状态
uint8_t pixelMode = 0;  // 当前模式: 0=彩虹, 1=跑马灯, 2=随机闪烁
uint8_t pixelHue = 0;   // 彩虹色相
uint8_t chaseIndex = 0; // 跑马灯索引
uint32_t lastPixelUpdate = 0;

// ========== 计数器功能 ==========

// 5x3像素实心风格数字字模 (0-9)
// 每个数字用5个字节表示，每个字节低3位表示一行像素
static const uint8_t digitPatterns[10][5] = {
    {0b111, 0b101, 0b101, 0b101, 0b111}, // 0
    {0b010, 0b010, 0b010, 0b010, 0b010}, // 1
    {0b111, 0b001, 0b111, 0b100, 0b111}, // 2
    {0b111, 0b001, 0b111, 0b001, 0b111}, // 3
    {0b101, 0b101, 0b111, 0b001, 0b001}, // 4
    {0b111, 0b100, 0b111, 0b001, 0b111}, // 5
    {0b111, 0b100, 0b111, 0b101, 0b111}, // 6
    {0b111, 0b001, 0b001, 0b001, 0b001}, // 7
    {0b111, 0b101, 0b111, 0b101, 0b111}, // 8
    {0b111, 0b101, 0b111, 0b001, 0b111}, // 9
};

// 计数器状态
static uint8_t counter = 0; // 计数器值，范围0-99

// ========== 像素屏模块实现 ==========

void pixel_init()
{
    // 初始化RGB LED
    rgbLED.begin();
    rgbLED.setBrightness(10);
    rgbLED.setPixelColor(0, rgbLED.Color(0, 255, 0)); // 启动成功亮绿灯
    rgbLED.show();
    Serial.println("RGB LED initialized (Green)");

    // 初始化像素屏
    pixels.begin();
    pixels.setBrightness(PIXEL_BRIGHTNESS);
    pixels.clear();
    pixels.show();

    // 启动时显示计数器初始值0
    pixel_set_number(0);
    Serial.println("WS2812B 8x8 Pixel Display initialized (Counter mode)");
}

void pixel_update(uint32_t now)
{
    // 检查是否到达更新时间
    if (now - lastPixelUpdate < PIXEL_EFFECT_INTERVAL_MS)
    {
        return;
    }
    lastPixelUpdate = now;

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
            r = r * 0.8;
            g = g * 0.8;
            b = b * 0.8;
            pixels.setPixelColor(i, pixels.Color(r, g, b));
        }

        // 设置新像素
        pixels.setPixelColor(chaseIndex, pixels.Color(0, 0, 255));                                 // 蓝色
        pixels.setPixelColor((chaseIndex + NUM_PIXELS / 2) % NUM_PIXELS, pixels.Color(255, 0, 0)); // 红色
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
            r = r * 0.7;
            g = g * 0.7;
            b = b * 0.7;
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

// ========== 计数器功能实现 ==========

/**
 * @brief 将xy坐标转换为Adafruit_NeoPixel线性索引
 * @param x X坐标 (0-7)
 * @param y Y坐标 (0-7)
 * @return 像素索引 (0-63)
 *
 * 蛇形布线：偶数行从右到左，奇数行从左到右
 */
static uint16_t xy_to_index(uint8_t x, uint8_t y)
{
    if (y % 2 == 0)
    {
        // 偶数行：从右到左
        return y * 8 + (7 - x);
    }
    else
    {
        // 奇数行：从左到右
        return y * 8 + x;
    }
}

/**
 * @brief 在指定位置绘制单个数字
 * @param x 起始X坐标 (0-7)
 * @param y 起始Y坐标 (0-7)
 * @param digit 数字 (0-9)
 * @param color 颜色值
 */
static void draw_digit(uint8_t x, uint8_t y, uint8_t digit, uint32_t color)
{
    if (digit > 9)
        return;

    const uint8_t *pattern = digitPatterns[digit];

    // 绘制5x3的数字
    for (uint8_t row = 0; row < 5; row++)
    {
        for (uint8_t col = 0; col < 3; col++)
        {
            // 检查该像素是否应该点亮
            if (pattern[row] & (1 << (2 - col)))
            {
                uint8_t pixelX = x + col;
                uint8_t pixelY = y + row;

                // 检查边界
                if (pixelX < 8 && pixelY < 8)
                {
                    pixels.setPixelColor(xy_to_index(pixelX, pixelY), color);
                }
            }
        }
    }
}

/**
 * @brief 设置并显示0-99的数字
 * @param number 要显示的数字 (0-99)
 *
 * 在8x8像素屏上显示两位数，十位在左侧，个位在右侧
 */
void pixel_set_number(uint8_t number)
{
    if (number > 99)
        number = 99;
    counter = number;

    // 清空像素屏
    pixels.clear();

    // 计算十位和个位
    uint8_t tens = number / 10;
    uint8_t ones = number % 10;

    // 绘制十位数字（左对齐，起始x=0）
    draw_digit(0, 1, tens, pixels.Color(0, 255, 0));

    // 绘制个位数字（右对齐，起始x=5，留2像素间隔）
    draw_digit(5, 1, ones, pixels.Color(0, 255, 0));

    pixels.show();
    Serial.print("[PIXEL] Display set to: ");
    Serial.println(number);
}

/**
 * @brief 计数器+1并刷新显示
 *
 * 超过99后回到0
 */
void pixel_increment_counter()
{
    counter++;
    if (counter > 99)
    {
        counter = 0;
    }
    pixel_set_number(counter);
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

void pixel_switch_mode()
{
    // 切换到下一个模式
    pixelMode = (pixelMode + 1) % 3;
    Serial.print("[PIXEL] Mode switched to: ");
    Serial.println(pixelMode);

    // 清空像素屏
    pixels.clear();

    // 重置一些状态变量
    chaseIndex = 0;
}

/**
 * @brief 显示分钟数 (0-59)
 * @param minute 分钟数 (0-59)
 *
 * 在8x8像素屏上显示分钟数，使用蓝色显示
 */
void pixel_set_minute(uint8_t minute)
{
    if (minute > 59)
    {
        minute = 59;
    }

    // 清空像素屏
    pixels.clear();

    // 计算十位和个位
    uint8_t tens = minute / 10;
    uint8_t ones = minute % 10;

    // 绘制十位数字（左对齐，起始x=0）
    draw_digit(0, 1, tens, pixels.Color(0, 100, 255));

    // 绘制个位数字（右对齐，起始x=5，留2像素间隔）
    draw_digit(5, 1, ones, pixels.Color(0, 100, 255));

    pixels.show();
}
