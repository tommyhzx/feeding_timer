import type { ChipProps } from "tscircuit"

/**
 * ESP32-S3-Zero 模块引脚定义
 *
 * Waveshare ESP32-S3-Zero 是一个紧凑型 ESP32-S3 模组，具有：
 * - 内置 ME6217C33M5G LDO (3.3V, 800mA)
 * - USB Type-C 接口（原生 USB 支持）
 * - WS2812 RGB LED（GPIO21）
 * - 陶瓷天线（顶部边缘）
 * - 邮票孔/半孔工艺设计
 *
 * ═══════════════════════════════════════════════════════════════
 * 引脚排列（顺时针，从左上开始）：
 * ═══════════════════════════════════════════════════════════════
 *   pin1   = 5V_IN       5V 输入
 *   pin2   = GND         地
 *   pin3   = 3V3_OUT     3.3V 输出
 *   pin4   = GPIO1       通用 GPIO
 *   pin5   = GPIO2       通用 GPIO
 *   pin6   = GPIO3       通用 GPIO
 *   pin7   = GPIO4       通用 GPIO
 *   pin8   = GPIO5       通用 GPIO
 *   pin9   = GPIO6       通用 GPIO
 *   pin10  = UART_TX     UART0 TX
 *   pin11  = UART_RX     UART0 RX
 *   pin12  = GPIO13      通用 GPIO
 *   pin13  = GPIO12      通用 GPIO
 *   pin14  = GPIO11      通用 GPIO
 *   pin15  = GPIO10      通用 GPIO
 *   pin16  = GPIO9       通用 GPIO
 *   pin17  = GPIO8       通用 GPIO
 *   pin18  = GPIO7       通用 GPIO
 *
 * ═══════════════════════════════════════════════════════════════
 * 注意事项：
 * ═══════════════════════════════════════════════════════════════
 * - GPIO 引脚不耐受 5V（仅 3.3V）
 * - 陶瓷天线区域需要净空（顶部边缘约 5mm x 10mm）
 * - 下载固件时需按住 BOOT(GPIO0) 按键再接上 Type-C 线缆
 */
const esp32s3ZeroPinLabels = {
  // 电源引脚
  pin1: "5V_IN",
  pin2: "GND",
  pin3: "3V3_OUT",

  // 通用 GPIO
  pin4: "GPIO1",
  pin5: "GPIO2",
  pin6: "GPIO3",
  pin7: "GPIO4",
  pin8: "GPIO5",
  pin9: "GPIO6",

  // UART0 (默认串口)
  pin10: "UART_TX",
  pin11: "UART_RX",

  // 键盘矩阵 GPIO (7 个引脚)
  pin12: "GPIO13",
  pin13: "GPIO12",
  pin14: "GPIO11",
  pin15: "GPIO10",
  pin16: "GPIO9",
  pin17: "GPIO8",
  pin18: "GPIO7",
} as const

/**
 * ESP32-S3-Zero 模组封装
 *
 * PCB 尺寸: 18mm x 23.5mm
 * 引脚间距: 2.54mm (邮票孔)
 *
 * 天线净空区: 顶部边缘约 5mm x 10mm（陶瓷天线）
 */
export const ESP32S3Zero = (props: ChipProps<typeof esp32s3ZeroPinLabels>) => (
  <chip
    {...props}
    manufacturerPartNumber="ESP32-S3-Zero"
    pinLabels={esp32s3ZeroPinLabels}
    footprint={<footprint>
      {/* 邮票孔 (castellated holes) - ESP32-S3-Zero 有 18 个引脚 */}
      {/* 模块尺寸: 18mm x 23.5mm */}
      {/* 两列引脚间距: 15.24mm (中心到中心) */}
      {/* 左排: pin1-pin9 (从下到上) */}
      {/* 右排: pin10-pin18 (从下到上) */}

      {/* 左排引脚 - pin1 到 pin9 (x=-7.62mm, 从下往上) */}
      <platedhole portHints={["pin1"]} pcbX="-7.62mm" pcbY="-10.16mm" holeDiameter="1mm" shape="circular_hole_with_rect_pad" rectPadWidth="2mm" rectPadHeight="2mm" />
      <platedhole portHints={["pin2"]} pcbX="-7.62mm" pcbY="-7.62mm" holeDiameter="1mm" shape="circular_hole_with_rect_pad" rectPadWidth="2mm" rectPadHeight="2mm" />
      <platedhole portHints={["pin3"]} pcbX="-7.62mm" pcbY="-5.08mm" holeDiameter="1mm" shape="circular_hole_with_rect_pad" rectPadWidth="2mm" rectPadHeight="2mm" />
      <platedhole portHints={["pin4"]} pcbX="-7.62mm" pcbY="-2.54mm" holeDiameter="1mm" shape="circular_hole_with_rect_pad" rectPadWidth="2mm" rectPadHeight="2mm" />
      <platedhole portHints={["pin5"]} pcbX="-7.62mm" pcbY="0mm" holeDiameter="1mm" shape="circular_hole_with_rect_pad" rectPadWidth="2mm" rectPadHeight="2mm" />
      <platedhole portHints={["pin6"]} pcbX="-7.62mm" pcbY="2.54mm" holeDiameter="1mm" shape="circular_hole_with_rect_pad" rectPadWidth="2mm" rectPadHeight="2mm" />
      <platedhole portHints={["pin7"]} pcbX="-7.62mm" pcbY="5.08mm" holeDiameter="1mm" shape="circular_hole_with_rect_pad" rectPadWidth="2mm" rectPadHeight="2mm" />
      <platedhole portHints={["pin8"]} pcbX="-7.62mm" pcbY="7.62mm" holeDiameter="1mm" shape="circular_hole_with_rect_pad" rectPadWidth="2mm" rectPadHeight="2mm" />
      <platedhole portHints={["pin9"]} pcbX="-7.62mm" pcbY="10.16mm" holeDiameter="1mm" shape="circular_hole_with_rect_pad" rectPadWidth="2mm" rectPadHeight="2mm" />

      {/* 右排引脚 - pin10 到 pin18 (x=7.62mm, 从下往上) */}
      <platedhole portHints={["pin10"]} pcbX="7.62mm" pcbY="-10.16mm" holeDiameter="1mm" shape="circular_hole_with_rect_pad" rectPadWidth="2mm" rectPadHeight="2mm" />
      <platedhole portHints={["pin11"]} pcbX="7.62mm" pcbY="-7.62mm" holeDiameter="1mm" shape="circular_hole_with_rect_pad" rectPadWidth="2mm" rectPadHeight="2mm" />
      <platedhole portHints={["pin12"]} pcbX="7.62mm" pcbY="-5.08mm" holeDiameter="1mm" shape="circular_hole_with_rect_pad" rectPadWidth="2mm" rectPadHeight="2mm" />
      <platedhole portHints={["pin13"]} pcbX="7.62mm" pcbY="-2.54mm" holeDiameter="1mm" shape="circular_hole_with_rect_pad" rectPadWidth="2mm" rectPadHeight="2mm" />
      <platedhole portHints={["pin14"]} pcbX="7.62mm" pcbY="0mm" holeDiameter="1mm" shape="circular_hole_with_rect_pad" rectPadWidth="2mm" rectPadHeight="2mm" />
      <platedhole portHints={["pin15"]} pcbX="7.62mm" pcbY="2.54mm" holeDiameter="1mm" shape="circular_hole_with_rect_pad" rectPadWidth="2mm" rectPadHeight="2mm" />
      <platedhole portHints={["pin16"]} pcbX="7.62mm" pcbY="5.08mm" holeDiameter="1mm" shape="circular_hole_with_rect_pad" rectPadWidth="2mm" rectPadHeight="2mm" />
      <platedhole portHints={["pin17"]} pcbX="7.62mm" pcbY="7.62mm" holeDiameter="1mm" shape="circular_hole_with_rect_pad" rectPadWidth="2mm" rectPadHeight="2mm" />
      <platedhole portHints={["pin18"]} pcbX="7.62mm" pcbY="10.16mm" holeDiameter="1mm" shape="circular_hole_with_rect_pad" rectPadWidth="2mm" rectPadHeight="2mm" />

      {/* 丝印 - 模块轮廓 (18mm x 23.5mm) */}
      <silkscreenpath route={[
        {"x": -9, "y": 11.75},
        {"x": 9, "y": 11.75},
        {"x": 9, "y": -11.75},
        {"x": -9, "y": -11.75},
        {"x": -9, "y": 11.75}
      ]} />

      {/* 天线净空区域警告丝印 (顶部边缘) */}
      <silkscreenpath route={[
        {"x": -9, "y": -11.75},
        {"x": -9, "y": -6},
        {"x": 9, "y": -6},
        {"x": 9, "y": -11.75},
        {"x": -9, "y": -11.75}
      ]} strokeWidth="0.2" />

      {/* Pin 1 标识 */}
      <silkscreenpath route={[
        {"x": -9, "y": 11.75},
        {"x": -8, "y": 11.75}
      ]} strokeWidth="0.3" />

      {/* 天线净空警告文字 (使用丝印路径模拟) */}
      <silkscreenpath route={[
        {"x": -8, "y": -10},
        {"x": -7, "y": -10}
      ]} strokeWidth="0.2" />
      <silkscreenpath route={[
        {"x": -6, "y": -10},
        {"x": -5, "y": -10}
      ]} strokeWidth="0.2" />
      <silkscreenpath route={[
        {"x": -4, "y": -10},
        {"x": -3, "y": -10}
      ]} strokeWidth="0.2" />

      {/* courtyard (器件边界) */}
      <courtyardoutline outline={[
        {"x": -9.5, "y": 12.5},
        {"x": 9.5, "y": 12.5},
        {"x": 9.5, "y": -12.5},
        {"x": -9.5, "y": -12.5},
        {"x": -9.5, "y": 12.5}
      ]} />
    </footprint>}
  />
)

// 方便外部访问的引脚别名
export type ESP32S3ZeroPin = keyof typeof esp32s3ZeroPinLabels

// 常用引脚分组
export const ESP32S3Zero_PINS = {
  // 电源
  GND: "pin2" as const,
  VDD_5V: "pin1" as const,
  VDD_3V3: "pin3" as const,

  // UART0
  UART_TX: "pin10" as const,
  UART_RX: "pin11" as const,

  // 键盘矩阵 GPIO (7 个引脚)
  MATRIX_GPIOS: ["pin12", "pin13", "pin14", "pin15", "pin16", "pin17", "pin18"] as const,
} as const
