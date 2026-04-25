#ifndef FONTS_H
#define FONTS_H

#include <stdint.h>

// 前向声明（避免与 max7219_display.h 中的定义冲突）
typedef struct {
    const uint8_t digits[10][8];
    const uint8_t width;
} Font_t;

// ========== 字体数据声明 ==========

/**
 * @brief 紧凑字体（5列宽）
 * 适合在有限空间内显示更多内容
 */
extern const Font_t fontCompact;

/**
 * @brief 窄字体（4列宽）
 * 留出边距，增强呼吸感
 */
extern const Font_t fontNarrow;

/**
 * @brief 数码管字体（5列宽）
 * 标准7段数码管风格，经典显示效果
 */
extern const Font_t fontDotted;

/**
 * @brief 分段数码管字体（5列宽）
 * 纯横竖直线，每段独立，无弯曲
 */
extern const Font_t fontSegment;

#endif // FONTS_H
