#ifndef MAX7219_DISPLAY_H
#define MAX7219_DISPLAY_H

#include <stdint.h>

// ========== MAX7219 显示模块配置 ==========

// GPIO 引脚定义
constexpr uint8_t MAX7219_DIN_PIN = 6;   // Data In
constexpr uint8_t MAX7219_CS_PIN = 8;    // Chip Select
constexpr uint8_t MAX7219_CLK_PIN = 10;  // Clock (修改：避开 Strapping 引脚 GPIO15)

// MAX7219 设备配置
constexpr uint8_t MAX7219_NUM_DEVICES = 4;  // 四个 8x8 点阵模块级联（8x32）

// 亮度设置 (0-15)
constexpr uint8_t MAX7219_INTENSITY = 1;

// ========== MAX7219 显示模块接口 ==========

/**
 * @brief 初始化 MAX7219 显示模块
 * 配置 SPI 引脚，初始化显示设备
 */
void max7219_init();

/**
 * @brief 设置并显示分钟数 (0-59)
 * @param minute 分钟数 (0-59)
 *
 * 在 8x8 点阵屏上显示两位数字，十位在左侧，个位在右侧
 */
void max7219_set_minute(uint8_t minute);

/**
 * @brief 设置并显示时间（时:分:秒）
 * @param hour 小时 (0-23)
 * @param minute 分钟 (0-59)
 * @param second 秒 (0-59)
 *
 * 在 8x32 点阵屏上显示 HH:MM:SS 格式的时间
 */
void max7219_set_time(uint8_t hour, uint8_t minute, uint8_t second);

/**
 * @brief 设置按键反馈效果
 * @param pressed true=按下状态(亮度增加), false=释放状态(恢复正常)
 *
 * 按下时增加亮度作为视觉反馈
 */
void max7219_set_feedback(bool pressed);

/**
 * @brief 清空显示
 */
void max7219_clear();

/**
 * @brief 设置显示亮度
 * @param intensity 亮度值 (0-15)
 */
void max7219_set_intensity(uint8_t intensity);

/**
 * @brief 逐列测试显示（调试用）
 * @param delay_ms 每列显示的延时（毫秒）
 *
 * 从左到右依次点亮每一列，用于检测屏幕和硬件连接
 */
void max7219_test_columns(uint16_t delay_ms);

/**
 * @brief 逐行测试显示（调试用）
 * @param delay_ms 每行显示的延时（毫秒）
 *
 * 从上到下依次点亮每一行，用于检测屏幕和硬件连接
 */
void max7219_test_rows(uint16_t delay_ms);

// ========== 字体管理 ==========

// 包含字体定义
#include "fonts.h"

/**
 * @brief 设置当前使用的字体
 * @param font 指向字体结构体的指针
 *
 * 注意：切换字体后需要重新调用显示函数才能看到效果
 */
void max7219_set_font(const Font_t* font);

/**
 * @brief 获取当前使用的字体
 * @return 指向当前字体结构体的指针
 */
const Font_t* max7219_get_font(void);

#endif // MAX7219_DISPLAY_H
