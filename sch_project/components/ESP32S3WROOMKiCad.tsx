import type { ChipProps } from "tscircuit"
import ESP32S3WROOM1Footprint from "kicad-libraries/footprints/Espressif.pretty/ESP32-S3-WROOM-1.kicad_mod"
interface Props extends ChipProps {
name: string
}
/**
 * ESP32-S3-WROOM-1 模块 - 使用 KiCad 官方封装
 *
 * 该组件使用 KiCad 的 ESP32-S3-WROOM-1 封装
 * KiCad 封装引脚命名: "1", "2", "3" ... "40"
 */
const esp32s3PinLabelsKiCad = {
  "1": "GND",
  "2": "3V3",
  "3": "EN",
  "4": "I2C_SDA",
  "5": "I2C_SCL",
  "6": "GPIO6",
  "7": "GPIO7",
  "8": "GPIO15",
  "9": "GPIO16",
  "10": "GPIO17",
  "11": "GPIO18",
  "12": "GPIO8",
  "13": "GPIO19",
  "14": "GPIO20",
  "15": "GPIO3",
  "16": "GPIO46",
  "17": "GPIO9",
  "18": "GPIO10",
  "19": "GPIO11",
  "20": "GPIO12",
  "21": "GPIO13",
  "22": "GPIO14",
  "23": "GPIO21",
  "24": "GPIO47",
  "25": "GND",
  "26": "BOOT_GPIO0",
  "27": "GPIO45",
  "28": "GPIO35",
  "29": "GPIO36",
  "30": "GPIO37",
  "31": "GPIO38",
  "32": "GPIO39",
  "33": "GPIO40",
  "34": "GND",
  "35": "I2S_BCLK",
  "36": "I2S_LRCK",
  "37": "I2S_DIN",
  "38": "I2S_DOUT",
  "39": "I2S_MIC_SCK",
  "40": "GND",
} as const

export const ESP32S3WROOMKiCad = (props: Props) => {
  return (
  <chip
    {...props}
    manufacturerPartNumber="ESP32-S3-WROOM-1-N4R2"
    // pinLabels={{
    //   pin1: "VCC",
    //   pin2: "DISCH",
    //   pin3: "THRES",
    //   pin4: "CTRL",
    //   pin5: "GND",
    //   pin6: "TRIG",
    //   pin7: "OUT",
    //   pin8: "RESET"
    // }}
    pinLabels={esp32s3PinLabelsKiCad}
    // footprint={ESP32S3WROOM1Footprint}
  />
)
}
// // 方便外部访问的引脚别名
// export type ESP32PinKiCad = keyof typeof esp32s3PinLabelsKiCad

// 常用引脚分组
// export const ESP32_PINS_KICAD = {
//   // 电源
//   GND: ["1", "25", "34", "40"] as const,
//   VDD_3V3: "2" as const,
//   // GPIO
//   GPIO6: "6",
//   GPIO7: "7",
//   GPIO15: "8",
//   GPIO16: "9",
// } as const
