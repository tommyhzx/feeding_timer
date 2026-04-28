import type { ChipProps } from "tscircuit";

/**
 * BatteryConnector - 锂电池接口
 *
 * PH2.0-2P 或 JST 2P 电池连接器
 * 用于连接3.7V锂电池
 *
 * 引脚定义:
 * Pin 1 = VBAT+ (电池正极)
 * Pin 2 = GND   (电池负极)
 *
 * 推荐型号:
 * - PH2.0-2P 端子 (间距2.0mm)
 * - JST-PH 2pin 连接器
 */
const batteryConnectorPinLabels = {
  pin1: "VBAT",
  pin2: "GND",
} as const;

export const BatteryConnector = (props: ChipProps<typeof batteryConnectorPinLabels>) => (
  <chip
    {...props}
    manufacturerPartNumber="PH2.0-2P"
    pinLabels={batteryConnectorPinLabels}
    footprint="pinrow2"
    schPinSpacing={0.2}
    schWidth={1}
  />
);

export type BatteryConnectorPin = keyof typeof batteryConnectorPinLabels;
