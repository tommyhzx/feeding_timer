#include "max7219_display.h"
#include <Arduino.h>

// ========== MAX7219 寄存器地址 ==========
namespace MAX7219_Register {
    constexpr uint8_t NO_OP        = 0x00;
    constexpr uint8_t DIGIT0       = 0x01;  // 第 0 行
    constexpr uint8_t DIGIT1       = 0x02;  // 第 1 行
    constexpr uint8_t DIGIT2       = 0x03;  // 第 2 行
    constexpr uint8_t DIGIT3       = 0x04;  // 第 3 行
    constexpr uint8_t DIGIT4       = 0x05;  // 第 4 行
    constexpr uint8_t DIGIT5       = 0x06;  // 第 5 行
    constexpr uint8_t DIGIT6       = 0x07;  // 第 6 行
    constexpr uint8_t DIGIT7       = 0x08;  // 第 7 行
    constexpr uint8_t DECODE_MODE  = 0x09;
    constexpr uint8_t INTENSITY    = 0x0A;
    constexpr uint8_t SCAN_LIMIT   = 0x0B;
    constexpr uint8_t SHUTDOWN     = 0x0C;
    constexpr uint8_t DISPLAY_TEST = 0x0F;
}

// ========== 当前亮度状态 ==========
static uint8_t normalIntensity = MAX7219_INTENSITY;
static uint8_t pressedIntensity = 15;  // 按键反馈时使用最大亮度

// ========== 显示缓冲区 (8行 x 8列) ==========
static uint8_t displayBuffer[8] = {0};

// ========== 底层 SPI 操作 ==========

/**
 * @brief 向 MAX7219 发送命令
 * @param address 寄存器地址
 * @param data 数据
 */
static void max7219_send_byte(uint8_t address, uint8_t data)
{
    digitalWrite(MAX7219_CS_PIN, LOW);  // CS 拉低，开始传输

    // 发送地址
    shiftOut(MAX7219_DIN_PIN, MAX7219_CLK_PIN, MSBFIRST, address);
    // 发送数据
    shiftOut(MAX7219_DIN_PIN, MAX7219_CLK_PIN, MSBFIRST, data);

    digitalWrite(MAX7219_CS_PIN, HIGH); // CS 拉高，结束传输
}

/**
 * @brief 设置 MAX7219 寄存器
 * @param reg 寄存器地址
 * @param data 数据
 */
static void max7219_set_register(uint8_t reg, uint8_t data)
{
    max7219_send_byte(reg, data);
}

/**
 * @brief 刷新显示缓冲区到 MAX7219
 */
static void max7219_refresh()
{
    for (uint8_t row = 0; row < 8; row++)
    {
        max7219_set_register(MAX7219_Register::DIGIT0 + row, displayBuffer[row]);
    }
}

// ========== 5x7 像素数字字模 (0-9) ==========
// 每个数字用 8 个字节表示，每个字节表示一行像素
// 使用 bit0-bit4 表示 5 列宽度
static const uint8_t digitPatterns[10][8] = {
    // 0
    {
        0b00000,
        0b01110,
        0b10001,
        0b10001,
        0b10001,
        0b10001,
        0b01110,
        0b00000
    },
    // 1
    {
        0b00000,
        0b00100,
        0b01100,
        0b00100,
        0b00100,
        0b00100,
        0b01110,
        0b00000
    },
    // 2
    {
        0b00000,
        0b01110,
        0b10001,
        0b00001,
        0b00010,
        0b00100,
        0b11111,
        0b00000
    },
    // 3
    {
        0b00000,
        0b01110,
        0b10001,
        0b00001,
        0b00110,
        0b00001,
        0b01110,
        0b00000
    },
    // 4
    {
        0b00000,
        0b00010,
        0b00110,
        0b01010,
        0b11111,
        0b00010,
        0b00010,
        0b00000
    },
    // 5
    {
        0b00000,
        0b11111,
        0b10000,
        0b11110,
        0b00001,
        0b10001,
        0b01110,
        0b00000
    },
    // 6
    {
        0b00000,
        0b00110,
        0b01000,
        0b10000,
        0b11110,
        0b10001,
        0b01110,
        0b00000
    },
    // 7
    {
        0b00000,
        0b11111,
        0b00001,
        0b00010,
        0b00100,
        0b00100,
        0b00100,
        0b00000
    },
    // 8
    {
        0b00000,
        0b01110,
        0b10001,
        0b01110,
        0b10001,
        0b10001,
        0b01110,
        0b00000
    },
    // 9
    {
        0b00000,
        0b01110,
        0b10001,
        0b01111,
        0b00001,
        0b00010,
        0b01100,
        0b00000
    },
};

// ========== MAX7219 显示模块实现 ==========

void max7219_init()
{
    // 配置 GPIO 引脚
    pinMode(MAX7219_DIN_PIN, OUTPUT);
    pinMode(MAX7219_CLK_PIN, OUTPUT);
    pinMode(MAX7219_CS_PIN, OUTPUT);
    digitalWrite(MAX7219_CS_PIN, HIGH);  // CS 默认为高

    // 初始化 MAX7219
    max7219_set_register(MAX7219_Register::DISPLAY_TEST, 0x00);  // 退出测试模式
    max7219_set_register(MAX7219_Register::DECODE_MODE, 0x00);   // 不使用 BCD 解码
    max7219_set_register(MAX7219_Register::SCAN_LIMIT, 0x07);    // 扫描所有8位数字
    max7219_set_register(MAX7219_Register::SHUTDOWN, 0x01);      // 退出省电模式
    max7219_set_register(MAX7219_Register::INTENSITY, normalIntensity);  // 设置亮度

    // 清空显示
    max7219_clear();

    Serial.println("MAX7219 8x8 Dot Matrix Display initialized");

    // 启动时显示 "--"
    memset(displayBuffer, 0, sizeof(displayBuffer));
    displayBuffer[3] = 0b00010000;  // 第 3 行中间列
    displayBuffer[4] = 0b00010000;  // 第 4 行中间列
    max7219_refresh();
}

/**
 * @brief 绘制单个数字到指定列位置
 * @param col 起始列 (0-7)
 * @param digit 数字 (0-9)
 */
static void draw_digit(uint8_t col, uint8_t digit)
{
    if (digit > 9 || col > 7) {
        return;
    }

    const uint8_t (*pattern)[8] = &digitPatterns[digit];

    // 绘制 8 行高、5 列宽的数字
    for (uint8_t row = 0; row < 8; row++)
    {
        for (uint8_t c = 0; c < 5; c++)
        {
            if (col + c < 8)
            {
                // 获取字模中该位置的像素
                bool pixel = ((*pattern)[row] >> (4 - c)) & 0x01;
                if (pixel)
                {
                    displayBuffer[row] |= (1 << (7 - (col + c)));
                }
            }
        }
    }
}

void max7219_set_minute(uint8_t minute)
{
    if (minute > 59)
    {
        minute = 59;
    }

    // 清空显示缓冲区
    memset(displayBuffer, 0, sizeof(displayBuffer));

    // 计算十位和个位
    uint8_t tens = minute / 10;
    uint8_t ones = minute % 10;

    // 绘制十位数字（左对齐，起始列=1，居中显示）
    draw_digit(1, tens);

    // 绘制个位数字（右对齐，起始列=5，留2像素间隔）
    draw_digit(5, ones);

    // 刷新显示
    max7219_refresh();

    Serial.print("[MAX7219] Display set to: ");
    if (minute < 10)
        Serial.print("0");
    Serial.println(minute);
}

void max7219_set_feedback(bool pressed)
{
    if (pressed)
    {
        // 按键按下 - 增加亮度
        max7219_set_register(MAX7219_Register::INTENSITY, pressedIntensity);
    }
    else
    {
        // 按键释放 - 恢复正常亮度
        max7219_set_register(MAX7219_Register::INTENSITY, normalIntensity);
    }
}

void max7219_clear()
{
    memset(displayBuffer, 0, sizeof(displayBuffer));
    max7219_refresh();
}

void max7219_set_intensity(uint8_t intensity)
{
    if (intensity > 15)
    {
        intensity = 15;
    }
    normalIntensity = intensity;
    max7219_set_register(MAX7219_Register::INTENSITY, normalIntensity);
}
