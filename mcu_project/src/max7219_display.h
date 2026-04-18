#ifndef MAX7219_DISPLAY_H
#define MAX7219_DISPLAY_H

#include <stdint.h>

// ========== MAX7219 显示模块配置 ==========

// GPIO 引脚定义
constexpr uint8_t MAX7219_DIN_PIN = 7;   // Data In
constexpr uint8_t MAX7219_CS_PIN = 8;    // Chip Select
constexpr uint8_t MAX7219_CLK_PIN = 10;  // Clock (修改：避开 Strapping 引脚 GPIO15)

// MAX7219 设备配置
constexpr uint8_t MAX7219_NUM_DEVICES = 1;  // 单个 8x8 点阵模块

// 亮度设置 (0-15)
constexpr uint8_t MAX7219_INTENSITY = 8;

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

#endif // MAX7219_DISPLAY_H
