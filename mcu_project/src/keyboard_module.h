#ifndef KEYBOARD_MODULE_H
#define KEYBOARD_MODULE_H

#include <stdint.h>

// ========== 键盘模块配置 ==========

// 矩阵键盘GPIO定义 (单个按键测试)
constexpr uint8_t ROW_PIN = 7;  // 行 - 输入上拉
constexpr uint8_t COL_PIN = 4;  // 列 - 输出LOW

// 消抖时间 (ms)
constexpr uint32_t DEBOUNCE_MS = 20;
// 长按阈值 (ms) - 超过这个时间开始重复
constexpr uint32_t LONG_PRESS_MS = 400;
// 重复间隔 (ms) - 长按时每次发送的间隔
constexpr uint32_t REPEAT_INTERVAL_MS = 100;

// 按键信息结构体
struct KeyInfo
{
    uint8_t gpio;
    uint8_t hidCode;
    bool lastStableState;    // 上次稳定状态
    bool currentState;       // 当前状态
    uint32_t lastChangeTime; // 上次状态变化时间
    bool isRepeating;        // 是否正在重复发送
    uint32_t lastRepeatTime; // 上次重复发送时间
};

// ========== 键盘模块接口 ==========

/**
 * @brief 初始化键盘模块
 * 配置GPIO引脚，设置Keyboard对象
 */
void keyboard_init();

/**
 * @brief 更新键盘状态
 * @param now 当前时间戳 (millis())
 *
 * 处理按键扫描、消抖、长按重复等功能
 */
void keyboard_update(uint32_t now);

#endif // KEYBOARD_MODULE_H
