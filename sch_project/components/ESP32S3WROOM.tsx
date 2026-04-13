import type { ChipProps } from "tscircuit"
import { ESP32S3WROOM1N4R2FootprintData } from "./footprints/ESP32-S3-WROOM-1-N4R2"

/**
 * ESP32-S3-WROOM-1 模块引脚定义
 *
 * 电源引脚:
 *   pin1  = GND           地
 *   pin2  = 3V3           3.3V电源输入
 *   pin3  = EN            使能引脚 (高电平有效)
 *
 * GPIO引脚 (常用):
 *   pin4  = GPIO1 / I2C_SDA   I2C数据线
 *   pin5  = GPIO2 / I2C_SCL   I2C时钟线
 *   pin35 = GPIO34            音频I2S BCLK
 *   pin36 = GPIO35            音频I2S LRCK
 *   pin37 = GPIO36            音频I2S DIN
 *   pin38 = GPIO37            音频I2S DOUT
 *   pin39 = GPIO38            麦克风I2S SCK
 *   pin40 = GPIO39            麦克风I2S WS
 *   pin41 = GPIO40            麦克风I2S SD
 *
 * 其他:
 *   pin26 = GPIO0        BOOT引脚 / 按钮
 *   pin28 = GPIO21       I2C SDA (备用)
 *   pin29 = GPIO47       数字输入
 *   pin30 = GPIO48       数字输入
 *
 * GND引脚:
 *   pin1  = GND1
 *   pin25 = GND2
 *   pin34 = GND3
 *   pin40 = GND4
 */
const esp32s3PinLabels = {
  pin1: "GND",
  pin2: "3V3",
  pin3: "EN",
  pin4: "I2C_SDA",
  pin5: "I2C_SCL",
  pin6: "GPIO6",
  pin7: "GPIO7",
  pin8: "GPIO15",
  pin9: "GPIO16",
  pin10: "GPIO17",
  pin11: "GPIO18",
  pin12: "GPIO8",
  pin13: "GPIO19",
  pin14: "GPIO20",
  pin15: "GPIO3",
  pin16: "GPIO46",
  pin17: "GPIO9",
  pin18: "GPIO10",
  pin19: "GPIO11",
  pin20: "GPIO12",
  pin21: "GPIO13",
  pin22: "GPIO14",
  pin23: "GPIO21",
  pin24: "GPIO47",
  pin25: "GND",
  pin26: "BOOT_GPIO0",
  pin27: "GPIO45",
  pin28: "GPIO35",
  pin29: "GPIO36",
  pin30: "GPIO37",
  pin31: "GPIO38",
  pin32: "GPIO39",
  pin33: "GPIO40",
  pin34: "GND",
  pin35: "I2S_BCLK",
  pin36: "I2S_LRCK",
  pin37: "I2S_DIN",
  pin38: "I2S_DOUT",
  pin39: "I2S_MIC_SCK",
  pin40: "GND",
} as const

export const ESP32S3WROOM = (props: ChipProps<typeof esp32s3PinLabels>) => (
  <chip
    {...props}
    manufacturerPartNumber="ESP32-S3-WROOM-1-N4R2"
    pinLabels={esp32s3PinLabels}
    footprint={<footprint>
      {/* 从 KiCad .kicad_mod 生成的 footprint 数据 */}
      {ESP32S3WROOM1N4R2FootprintData.map((pad) => (
        <smtpad
          portHints={pad.portHints}
          pcbX={pad.pcbX}
          pcbY={pad.pcbY}
          width={pad.width}
          height={pad.height}
          shape={pad.shape}
        />
      ))}

      {/* 丝印边框 - 模块轮廓 (基于 KiCad fp_line) */}
      <silkscreenpath route={[
        {"x": -9, "y": 9.75},
        {"x": 9, "y": 9.75},
        {"x": 9, "y": -15.75},
        {"x": -9, "y": -15.75},
        {"x": -9, "y": 9.75}
      ]} />

      {/* Pin 1 标识 */}
      <silkscreenpath route={[
        {"x": -9, "y": 9.75},
        {"x": -8, "y": 9.75}
      ]} strokeWidth="0.3" />

      {/* courtyard (器件边界) */}
      <courtyardoutline outline={[
        {"x": -9.8, "y": 10.55},
        {"x": 9.8, "y": 10.55},
        {"x": 9.8, "y": -16.05},
        {"x": -9.8, "y": -16.05},
        {"x": -9.8, "y": 10.55}
      ]} />
    </footprint>}
  />
)

// 方便外部访问的引脚别名
export type ESP32Pin = keyof typeof esp32s3PinLabels

// 常用引脚分组
export const ESP32_PINS = {
  // 电源
  GND: ["pin1", "pin25", "pin34", "pin40"] as const,
  VDD_3V3: "pin2" as const,
} as const
