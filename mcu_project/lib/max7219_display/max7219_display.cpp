#include "max7219_display.h"
#include <Arduino.h>

// ========== MAX7219 寄存器地址 ==========
namespace MAX7219_Register
{
    constexpr uint8_t NO_OP = 0x00;
    constexpr uint8_t DIGIT0 = 0x01; // 第 0 行
    constexpr uint8_t DIGIT1 = 0x02; // 第 1 行
    constexpr uint8_t DIGIT2 = 0x03; // 第 2 行
    constexpr uint8_t DIGIT3 = 0x04; // 第 3 行
    constexpr uint8_t DIGIT4 = 0x05; // 第 4 行
    constexpr uint8_t DIGIT5 = 0x06; // 第 5 行
    constexpr uint8_t DIGIT6 = 0x07; // 第 6 行
    constexpr uint8_t DIGIT7 = 0x08; // 第 7 行
    constexpr uint8_t DECODE_MODE = 0x09;
    constexpr uint8_t INTENSITY = 0x0A;
    constexpr uint8_t SCAN_LIMIT = 0x0B;
    constexpr uint8_t SHUTDOWN = 0x0C;
    constexpr uint8_t DISPLAY_TEST = 0x0F;
}

// ========== 当前亮度状态 ==========
static uint8_t normalIntensity = MAX7219_INTENSITY;
static uint8_t pressedIntensity = 15; // 按键反馈时使用最大亮度

// ========== 显示缓冲区 (2个设备 x 8行) ==========
static uint8_t displayBuffer[MAX7219_NUM_DEVICES][8] = {0};

// ========== 底层 SPI 操作 ==========

/**
 * @brief 向 MAX7219 发送命令（支持级联）
 * @param device 设备索引 (0=第一个设备, 1=第二个设备, 255=所有设备)
 * @param address 寄存器地址
 * @param data 数据
 */
static void max7219_send_byte(uint8_t device, uint8_t address, uint8_t data)
{
    digitalWrite(MAX7219_CS_PIN, LOW); // CS 拉低，开始传输

    if (device == 255)
    {
        // 发送到所有设备
        for (uint8_t i = 0; i < MAX7219_NUM_DEVICES; i++)
        {
            shiftOut(MAX7219_DIN_PIN, MAX7219_CLK_PIN, MSBFIRST, address);
            shiftOut(MAX7219_DIN_PIN, MAX7219_CLK_PIN, MSBFIRST, data);
        }
    }
    else
    {
        // 发送到特定设备
        for (uint8_t i = 0; i < MAX7219_NUM_DEVICES; i++)
        {
            if (i == device)
            {
                shiftOut(MAX7219_DIN_PIN, MAX7219_CLK_PIN, MSBFIRST, address);
                shiftOut(MAX7219_DIN_PIN, MAX7219_CLK_PIN, MSBFIRST, data);
            }
            else
            {
                // 发送空操作
                shiftOut(MAX7219_DIN_PIN, MAX7219_CLK_PIN, MSBFIRST, MAX7219_Register::NO_OP);
                shiftOut(MAX7219_DIN_PIN, MAX7219_CLK_PIN, MSBFIRST, 0);
            }
        }
    }

    digitalWrite(MAX7219_CS_PIN, HIGH); // CS 拉高，结束传输
}

/**
 * @brief 设置 MAX7219 寄存器（所有设备）
 * @param reg 寄存器地址
 * @param data 数据
 */
static void max7219_set_register(uint8_t reg, uint8_t data)
{
    max7219_send_byte(255, reg, data);
}

/**
 * @brief 刷新显示缓冲区到 MAX7219（支持级联）
 */
static void max7219_refresh()
{
    for (uint8_t row = 0; row < 8; row++)
    {
        digitalWrite(MAX7219_CS_PIN, LOW); // CS 拉低，开始传输

        // 按照级联顺序发送数据（先发送到最后一个设备）
        for (int8_t dev = MAX7219_NUM_DEVICES - 1; dev >= 0; dev--)
        {
            shiftOut(MAX7219_DIN_PIN, MAX7219_CLK_PIN, MSBFIRST, MAX7219_Register::DIGIT0 + row);
            shiftOut(MAX7219_DIN_PIN, MAX7219_CLK_PIN, MSBFIRST, displayBuffer[dev][row]);
        }

        digitalWrite(MAX7219_CS_PIN, HIGH); // CS 拉高，结束传输
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
        0b00000},
    // 1
    {
        0b00000,
        0b00100,
        0b01100,
        0b00100,
        0b00100,
        0b00100,
        0b01110,
        0b00000},
    // 2
    {
        0b00000,
        0b01110,
        0b10001,
        0b00001,
        0b00010,
        0b00100,
        0b11111,
        0b00000},
    // 3
    {
        0b00000,
        0b01110,
        0b10001,
        0b00001,
        0b00110,
        0b00001,
        0b01110,
        0b00000},
    // 4
    {
        0b00000,
        0b00010,
        0b00110,
        0b01010,
        0b11111,
        0b00010,
        0b00010,
        0b00000},
    // 5
    {
        0b00000,
        0b11111,
        0b10000,
        0b11110,
        0b00001,
        0b10001,
        0b01110,
        0b00000},
    // 6
    {
        0b00000,
        0b00110,
        0b01000,
        0b10000,
        0b11110,
        0b10001,
        0b01110,
        0b00000},
    // 7
    {
        0b00000,
        0b11111,
        0b00001,
        0b00010,
        0b00100,
        0b00100,
        0b00100,
        0b00000},
    // 8
    {
        0b00000,
        0b01110,
        0b10001,
        0b01110,
        0b10001,
        0b10001,
        0b01110,
        0b00000},
    // 9
    {
        0b00000,
        0b01110,
        0b10001,
        0b01111,
        0b00001,
        0b00010,
        0b01100,
        0b00000},
};

// ========== MAX7219 显示模块实现 ==========

void max7219_init()
{
    // 配置 GPIO 引脚
    pinMode(MAX7219_DIN_PIN, OUTPUT);
    pinMode(MAX7219_CLK_PIN, OUTPUT);
    pinMode(MAX7219_CS_PIN, OUTPUT);
    digitalWrite(MAX7219_CS_PIN, HIGH); // CS 默认为高

    // 初始化所有 MAX7219 设备
    max7219_set_register(MAX7219_Register::DISPLAY_TEST, 0x00);         // 退出测试模式
    max7219_set_register(MAX7219_Register::DECODE_MODE, 0x00);          // 不使用 BCD 解码
    max7219_set_register(MAX7219_Register::SCAN_LIMIT, 0x07);           // 扫描所有8位数字
    max7219_set_register(MAX7219_Register::SHUTDOWN, 0x01);             // 退出省电模式
    max7219_set_register(MAX7219_Register::INTENSITY, normalIntensity); // 设置亮度

    // 清空显示
    max7219_clear();

    Serial.print("MAX7219 ");
    Serial.print(MAX7219_NUM_DEVICES);
    Serial.print("x 8x8 Dot Matrix Display initialized (");
    Serial.print(MAX7219_NUM_DEVICES * 8);
    Serial.println("x8)");

    // 启动时显示 "--"
    memset(displayBuffer, 0, sizeof(displayBuffer));
    displayBuffer[0][3] = 0b00010000; // 第一个设备，第 3 行中间列
    displayBuffer[0][4] = 0b00010000; // 第一个设备，第 4 行中间列
    max7219_refresh();
}

/**
 * @brief 绘制单个数字到指定列位置（支持级联设备）
 * @param col 起始列 (0-15)
 * @param digit 数字 (0-9)
 */
static void draw_digit(uint8_t col, uint8_t digit)
{
    if (digit > 9 || col >= MAX7219_NUM_DEVICES * 8)
    {
        return;
    }

    const uint8_t (*pattern)[8] = &digitPatterns[digit];

    // 绘制 8 行高、5 列宽的数字
    for (uint8_t row = 0; row < 8; row++)
    {
        // 行翻转：字模row=0(顶) → 显示row=7(底)
        uint8_t displayRow = 7 - row;

        for (uint8_t c = 0; c < 5; c++)
        {
            uint8_t absCol = col + c;
            if (absCol < MAX7219_NUM_DEVICES * 8)
            {
                // 计算设备和列索引
                uint8_t device = absCol / 8;
                uint8_t deviceCol = absCol % 8;

                // 获取字模中该位置的像素
                bool pixel = ((*pattern)[row] >> (4 - c)) & 0x01;
                if (pixel)
                {
                    displayBuffer[device][displayRow] |= (1 << deviceCol);
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

/**
 * @brief 绘制冒号分隔符
 * @param col 列位置 (0-15)
 */
static void draw_colon(uint8_t col)
{
    if (col >= MAX7219_NUM_DEVICES * 8)
    {
        return;
    }

    uint8_t device = col / 8;
    uint8_t deviceCol = col % 8;

    // 冒号在行3、5显示点（翻转后，原2,4）
    displayBuffer[device][5] |= (1 << deviceCol);
    displayBuffer[device][3] |= (1 << deviceCol);
}

void max7219_set_time(uint8_t hour, uint8_t minute)
{
    // 调试输出：查看接收到的参数
    Serial.print("[DEBUG] max7219_set_time called: hour=");
    Serial.print(hour);
    Serial.print(" minute=");
    Serial.println(minute);

    if (hour > 23)
        hour = 23;
    if (minute > 59)
        minute = 59;

    // 清空显示缓冲区
    memset(displayBuffer, 0, sizeof(displayBuffer));

    // 计算各位数字
    uint8_t hourTens = hour / 10;
    uint8_t hourOnes = hour % 10;
    uint8_t minuteTens = minute / 10;
    uint8_t minuteOnes = minute % 10;

    // 固定布局（32列）：
    // 列3-7:  数字1（小时十位）
    // 列8-12: 数字2（小时个位）
    // 列15-16: 冒号（2列宽）
    // 列19-23: 数字3（分钟十位）
    // 列24-28: 数字4（分钟个位）

    if (hourTens > 0)
    {
        // 两位数小时
        draw_digit(3, hourTens); // 小时十位
        draw_digit(8, hourOnes); // 小时个位
    }
    else
    {
        // 一位数小时：空出小时十位，小时个位从列8开始
        draw_digit(8, hourOnes);
    }

    draw_colon(15);             // 冒号（第1列）
    draw_colon(16);             // 冒号（第2列）
    draw_digit(19, minuteTens); // 分钟十位
    draw_digit(24, minuteOnes); // 分钟个位

    // 刷新显示
    max7219_refresh();

    Serial.print("[MAX7219] Time set to: ");
    if (hour < 10)
        Serial.print("0");
    Serial.print(hour);
    Serial.print(":");
    if (minute < 10)
        Serial.print("0");
    Serial.println(minute);
}

void max7219_test_columns(uint16_t delay_ms)
{
    uint8_t totalCols = MAX7219_NUM_DEVICES * 8;

    for (uint8_t col = 0; col < totalCols; col++)
    {
        // 清空显示缓冲区
        memset(displayBuffer, 0, sizeof(displayBuffer));

        // 计算该列所在的设备和列索引
        uint8_t device = col / 8;
        uint8_t deviceCol = col % 8;

        // 点亮该列的所有8行
        for (uint8_t row = 0; row < 8; row++)
        {
            displayBuffer[device][row] |= (1 << deviceCol);
        }

        // 刷新显示
        max7219_refresh();

        // 打印当前测试的列
        Serial.print("[MAX7219] Testing column ");
        Serial.print(col);
        Serial.print("/");
        Serial.print(totalCols - 1);
        Serial.print(" (Device ");
        Serial.print(device);
        Serial.print(", Col ");
        Serial.print(deviceCol);
        Serial.println(")");

        delay(delay_ms);
    }

    // 测试结束后清屏
    max7219_clear();
    Serial.println("[MAX7219] Column test complete");
}

void max7219_test_rows(uint16_t delay_ms)
{
    for (uint8_t row = 0; row < 8; row++)
    {
        // 清空显示缓冲区
        memset(displayBuffer, 0, sizeof(displayBuffer));

        // 点亮该行的所有列（所有设备）
        for (uint8_t dev = 0; dev < MAX7219_NUM_DEVICES; dev++)
        {
            displayBuffer[dev][row] = 0xFF; // 该行全部点亮
        }

        // 刷新显示
        max7219_refresh();

        // 打印当前测试的行
        Serial.print("[MAX7219] Testing row ");
        Serial.print(row);
        Serial.println("/7");

        delay(delay_ms);
    }

    // 测试结束后清屏
    max7219_clear();
    Serial.println("[MAX7219] Row test complete");
}
