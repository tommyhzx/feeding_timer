import type { ChipProps } from "tscircuit";

/**
 * MAX7219 Dot Matrix Module Interface
 * 5-pin header for connecting MAX7219 based LED matrix display
 * Pinout: VCC - GND - DIN - CS - CLK
 */

const max7219PinLabels = {
  pin1: "VCC",
  pin2: "GND",
  pin3: "DIN",
  pin4: "CS",
  pin5: "CLK",
} as const;

export const MAX7219Module = ({ name = "MAX7219", ...restProps }: ChipProps<typeof max7219PinLabels>) => (
  <chip
    name={`${name}_J1`}
    {...restProps}
    manufacturerPartNumber="HDR_M5_2.54"
    pinLabels={max7219PinLabels}
    footprint="pinrow5"
  />
);

export type MAX7219ModulePin = keyof typeof max7219PinLabels;
