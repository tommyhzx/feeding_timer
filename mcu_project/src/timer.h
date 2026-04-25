#ifndef TIMER_H
#define TIMER_H

#include <Arduino.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

// ========== 枚举定义 ==========

// 应用模式
typedef enum {
    MODE_CLOCK,      // 时钟模式
    MODE_TIMER       // 计时器模式
} AppMode;

// 计时器状态
typedef enum {
    TIMER_IDLE,      // 空闲状态
    TIMER_RUNNING,   // 运行中
    TIMER_PAUSED     // 暂停
} TimerState;

// ========== 初始化函数 ==========

/**
 * @brief 初始化计时器模块
 */
void timer_init(void);

// ========== 更新函数 ==========

/**
 * @brief 更新计时器逻辑（应在主循环中调用）
 * @param now 当前毫秒数（来自millis()）
 */
void timer_update(uint32_t now);

/**
 * @brief 更新显示内容（应在主循环中调用）
 * @param now 当前毫秒数（来自millis()）
 */
void timer_display_update(uint32_t now);

// ========== 控制函数 ==========

/**
 * @brief 切换应用模式
 */
void timer_toggle_mode(void);

/**
 * @brief 开始/暂停计时器
 * @return true 如果开始计时器，false 如果暂停计时器
 */
bool timer_toggle_start(void);

/**
 * @brief 重置计时器
 */
void timer_reset(void);

/**
 * @brief 获取当前应用模式
 * @return 当前模式
 */
AppMode timer_get_mode(void);

/**
 * @brief 获取计时器状态
 * @return 当前计时器状态
 */
TimerState timer_get_state(void);

#ifdef __cplusplus
}
#endif

#endif // TIMER_H
