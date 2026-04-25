#ifndef KEYBOARD_MODULE_H
#define KEYBOARD_MODULE_H

#include <stdint.h>

// ========== 按键模块配置 ==========

// 独立按键GPIO定义
constexpr uint8_t MODE_PIN = 7;   // MODE 按键 - 输入上拉 (避开 MAX7219_DIN_PIN GPIO6)
constexpr uint8_t ENTER_PIN = 11; // ENTER 按键 - 输入上拉 (避开 Strapping 引脚 GPIO4)

// 消抖时间 (ms)
constexpr uint32_t DEBOUNCE_MS = 20;

// 双击检测时间窗口 (ms)
constexpr uint32_t DOUBLE_CLICK_MS = 300;

// 按键枚举
enum KeyType {
    KEY_MODE,   // MODE 按键
    KEY_ENTER,  // ENTER 按键
    KEY_COUNT   // 按键总数
};

// 按键信息结构体
struct KeyInfo
{
    uint8_t gpio;
    bool lastStableState;     // 上次稳定状态
    bool currentState;        // 当前状态
    uint32_t lastChangeTime;  // 上次状态变化时间
    uint32_t pressStartTime;  // 按下开始时间
    uint32_t lastReleaseTime; // 上次释放时间（用于双击检测）
    uint8_t clickCount;       // 点击计数
};

// ========== 按键模块接口 ==========

/**
 * @brief 初始化按键模块
 * 配置GPIO引脚为 INPUT_PULLUP 模式
 */
void keyboard_init();

/**
 * @brief 更新按键状态
 * @param now 当前时间戳 (millis())
 *
 * 处理按键扫描、消抖，触发按键回调
 */
void keyboard_update(uint32_t now);

/**
 * @brief MODE按键按下回调
 * 可在 main.cpp 中实现自定义功能
 */
void keyboard_on_mode_pressed();

/**
 * @brief ENTER按键按下回调
 * 可在 main.cpp 中实现自定义功能
 */
void keyboard_on_enter_pressed();

/**
 * @brief ENTER按键短按回调（按下后释放）
 * 可在 main.cpp 中实现自定义功能
 */
void keyboard_on_enter_short_press();

/**
 * @brief ENTER按键双击回调
 * 可在 main.cpp 中实现自定义功能
 */
void keyboard_on_enter_double_click();

#endif // KEYBOARD_MODULE_H
