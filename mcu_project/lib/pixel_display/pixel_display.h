#ifndef PIXEL_DISPLAY_H
#define PIXEL_DISPLAY_H

#include <stdint.h>

// ========== 像素屏模块配置 ==========

// RGB LED (GPIO48) - 用于按键反馈
#define RGB_PIN 48
#define NUM_RGB_LEDS 1

// WS2812B 像素屏 (8x8) - 使用GPIO15
#define PIXEL_PIN 15
#define NUM_PIXELS 64
#define PIXEL_BRIGHTNESS 50

// 像素屏演示模式
constexpr uint32_t PIXEL_EFFECT_INTERVAL_MS = 100;  // 像素效果更新间隔
constexpr uint32_t MODE_SWITCH_INTERVAL_MS = 5000;  // 模式切换间隔

// ========== 像素屏模块接口 ==========

/**
 * @brief 初始化像素屏模块
 * 初始化RGB LED和WS2812B像素屏
 */
void pixel_init();

/**
 * @brief 更新像素屏显示效果
 * @param now 当前时间戳 (millis())
 *
 * 处理像素屏演示效果的自动切换和渲染
 */
void pixel_update(uint32_t now);

/**
 * @brief 设置按键反馈LED
 * @param pressed true=按下状态(亮蓝色), false=释放状态(熄灭)
 */
void pixel_set_feedback(bool pressed);

/**
 * @brief 设置并显示0-99的数字
 * @param number 要显示的数字 (0-99)
 *
 * 在8x8像素屏上显示两位数，十位在左侧，个位在右侧
 */
void pixel_set_number(uint8_t number);

/**
 * @brief 计数器+1并刷新显示
 *
 * 超过99后回到0
 */
void pixel_increment_counter();

/**
 * @brief 手动切换像素屏演示模式
 * 在三种模式间循环切换：彩虹渐变、跑马灯、随机闪烁
 */
void pixel_switch_mode();

/**
 * @brief 显示分钟数 (0-59)
 * @param minute 分钟数 (0-59)
 *
 * 在8x8像素屏上显示分钟数
 */
void pixel_set_minute(uint8_t minute);

#endif // PIXEL_DISPLAY_H
