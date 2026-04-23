import type { ChipProps } from "tscircuit"

/**
 * ESP32-S3-WROOM-1-N16R8 模组引脚定义
 *
 * ESP32-S3-WROOM-1-N16R8 是一款 ESP32-S3 模组，具有：
 * - 16MB Flash (N16) + 8MB PSRAM (R8)
 * - 内置 WiFi/BT 天线
 * - 邮票孔工艺
 *
 * ═══════════════════════════════════════════════════════════════
 * 引脚排列（从模块正面看，左排从上到下，右排从上到下）：
 * ═══════════════════════════════════════════════════════════════
 *
 * 左排 (pin1-pin22):
 *   pin1  = 3V3         3.3V 电源
 *   pin2  = 3V3         3.3V 电源
 *   pin3  = RST         复位引脚
 *   pin4  = GPIO4       通用 GPIO
 *   pin5  = GPIO5       通用 GPIO
 *   pin6  = GPIO6       通用 GPIO
 *   pin7  = GPIO7       通用 GPIO
 *   pin8  = GPIO15      通用 GPIO
 *   pin9  = GPIO16      通用 GPIO
 *   pin10 = GPIO17      通用 GPIO
 *   pin11 = GPIO18      通用 GPIO
 *   pin12 = GPIO8       通用 GPIO
 *   pin13 = GPIO3       通用 GPIO
 *   pin14 = GPIO46      通用 GPIO
 *   pin15 = GPIO9       通用 GPIO
 *   pin16 = GPIO10      通用 GPIO
 *   pin17 = GPIO11      通用 GPIO
 *   pin18 = GPIO12      通用 GPIO
 *   pin19 = GPIO13      通用 GPIO
 *   pin20 = GPIO14      通用 GPIO
 *   pin21 = 5V_IN       5V 输入
 *   pin22 = GND         地
 *
 * 右排 (pin23-pin44):
 *   pin23 = GND         地
 *   pin24 = GPIO43      通用 GPIO
 *   pin25 = GPIO44      通用 GPIO
 *   pin26 = GPIO1       通用 GPIO (UART TX)
 *   pin27 = GPIO2       通用 GPIO (UART RX)
 *   pin28 = GPIO42      通用 GPIO
 *   pin29 = GPIO41      通用 GPIO
 *   pin30 = GPIO40      通用 GPIO
 *   pin31 = GPIO39      通用 GPIO
 *   pin32 = GPIO38      通用 GPIO
 *   pin33 = GPIO37      通用 GPIO
 *   pin34 = GPIO36      通用 GPIO
 *   pin35 = GPIO35      通用 GPIO
 *   pin36 = GPIO0       通用 GPIO (BOOT)
 *   pin37 = GPIO45      通用 GPIO
 *   pin38 = GPIO48      通用 GPIO
 *   pin39 = GPIO47      通用 GPIO
 *   pin40 = GPIO21      通用 GPIO
 *   pin41 = GPIO20      通用 GPIO
 *   pin42 = GPIO19      通用 GPIO
 *   pin43 = GND         地
 *   pin44 = GND         地
 *
 * ═══════════════════════════════════════════════════════════════
 * 模块尺寸: 57mm x 28mm
 * 引脚间距: 2.54mm
 * 两排引脚间距: 25.4mm (中心到中心)
 * 引脚排布: 中心对称 (y=0为中心，左右引脚关于y轴对称)
 */
const esp32s3wroom1N16r8PinLabels = {
  // 左排引脚 (pin1-pin22)
  pin1: "3V3",
  pin2: "3V3",
  pin3: "RST",
  pin4: "GPIO4",
  pin5: "GPIO5",
  pin6: "GPIO6",
  pin7: "GPIO7",
  pin8: "GPIO15",
  pin9: "GPIO16",
  pin10: "GPIO17",
  pin11: "GPIO18",
  pin12: "GPIO8",
  pin13: "GPIO3",
  pin14: "GPIO46",
  pin15: "GPIO9",
  pin16: "GPIO10",
  pin17: "GPIO11",
  pin18: "GPIO12",
  pin19: "GPIO13",
  pin20: "GPIO14",
  pin21: "5V_IN",
  pin22: "GND",

  // 右排引脚 (pin23-pin44)
  pin23: "GND",
  pin24: "GPIO43",
  pin25: "GPIO44",
  pin26: "GPIO1",
  pin27: "GPIO2",
  pin28: "GPIO42",
  pin29: "GPIO41",
  pin30: "GPIO40",
  pin31: "GPIO39",
  pin32: "GPIO38",
  pin33: "GPIO37",
  pin34: "GPIO36",
  pin35: "GPIO35",
  pin36: "GPIO0",
  pin37: "GPIO45",
  pin38: "GPIO48",
  pin39: "GPIO47",
  pin40: "GPIO21",
  pin41: "GPIO20",
  pin42: "GPIO19",
  pin43: "GND",
  pin44: "GND",
} as const

/**
 * ESP32-S3-WROOM-1-N16R8 模组封装
 *
 * 使用内置 dip footprint：
 * - 44引脚 (22x2)
 * - 引脚间距 p: 2.54mm
 * - 孔径 id: 1mm
 * - 铜径 od: 1.8mm
 * - 列间距 w: 25.4mm (1000mil)
 */
export const ESP32S3WROOM1N16R8 = (props: ChipProps<typeof esp32s3wroom1N16r8PinLabels>) => (
  <chip
    {...props}
    manufacturerPartNumber="ESP32-S3-WROOM-1-N16R8"
    pinLabels={esp32s3wroom1N16r8PinLabels}
    footprint="dip44_w25.4mm_p2.54mm_id1mm_od1.8mm"
  />
)

// 方便外部访问的引脚别名
export type ESP32S3WROOM1N16R8Pin = keyof typeof esp32s3wroom1N16r8PinLabels

// 常用引脚分组
export const ESP32S3WROOM1N16R8_PINS = {
  // 电源
  VDD_3V3: ["pin1", "pin2"] as const,
  VDD_5V: "pin21" as const,
  GND: ["pin22", "pin23", "pin43", "pin44"] as const,

  // 复位
  RST: "pin3" as const,

  // UART0 (默认串口)
  UART_TX: "pin26" as const,
  UART_RX: "pin27" as const,

  // BOOT 引脚
  BOOT: "pin36" as const,
} as const