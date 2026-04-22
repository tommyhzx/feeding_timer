import type { ChipProps } from "tscircuit";

/**
 * USBLC6-2  USB 2.0 ESD Protection
 * STMicroelectronics / C2827654
 *
 * 封装: SOT-23-6L
 * 引脚 (C2827654 对应关系):
 * 1 = IO1/VBUS (VBUS 方向)
 * 2 = GND
 * 3 = IO2/DP (DP 方向)
 * 4 = IO2/DM (DM 方向，差分对)
 * 5 = VBUS
 * 6 = IO1/IC (DM 方向，内部连接)
 */
const usblc6PinLabels = {
  pin1: "DP",   // IO1
  pin2: "GND",
  pin3: "DM",   // IO2
  pin4: "DM",   // IO2
  pin5: "VBUS",
  pin6: "DP",   // IO1
} as const;

export const USBLC6 = (props: ChipProps<typeof usblc6PinLabels>) => (
  <chip
    {...props}
    manufacturerPartNumber="USBLC6-2"
    pinLabels={usblc6PinLabels}
    footprint="sot23_6"
  />
);

export type USBLC6Pin = keyof typeof usblc6PinLabels;
