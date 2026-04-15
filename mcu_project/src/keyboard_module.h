#ifndef KEYBOARD_MODULE_H
#define KEYBOARD_MODULE_H

#include <stdint.h>

// ========== 按键模块配置 ==========

// 矩阵键盘GPIO定义 (单个按键)
constexpr uint8_t ROW_PIN = 7;  // 行 - 输入上拉
constexpr uint8_t COL_PIN = 4;  // 列 - 输出LOW

// 消抖时间 (ms)
constexpr uint32_t DEBOUNCE_MS = 20;

// 按键信息结构体
struct KeyInfo
{
    uint8_t gpio;
    bool lastStableState;    // 上次稳定状态
    bool currentState;       // 当前状态
    uint32_t lastChangeTime; // 上次状态变化时间
};

// ========== 按键模块接口 ==========

/**
 * @brief 初始化按键模块
 * 配置GPIO引脚
 */
void keyboard_init();

/**
 * @brief 更新按键状态
 * @param now 当前时间戳 (millis())
 *
 * 处理按键扫描、消抖，按键按下时计数器+1
 */
void keyboard_update(uint32_t now);

#endif // KEYBOARD_MODULE_H
