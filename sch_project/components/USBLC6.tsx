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
  pin1: "VBUS",
  pin2: "GND",
  pin3: "DP",
  pin4: "DM",
  pin5: "VBUS",
  pin6: "IC",
} as const;

/**
 * SOT-23-6L footprint pads
 * Standard SOT-23-6 package with 6 pins
 */
const usblc6FootprintPads = [
  { portHints: ["pin1"], pcbX: -1.45, pcbY: 0.95, width: 0.9, height: 0.35 }, // VBUS
  { portHints: ["pin2"], pcbX: 0, pcbY: 0.95, width: 0.9, height: 0.35 }, // GND
  { portHints: ["pin3"], pcbX: 1.45, pcbY: 0.95, width: 0.9, height: 0.35 }, // DP
  { portHints: ["pin4"], pcbX: 1.45, pcbY: -0.95, width: 0.9, height: 0.35 }, // DM
  { portHints: ["pin5"], pcbX: 0, pcbY: -0.95, width: 0.9, height: 0.35 }, // VBUS
  { portHints: ["pin6"], pcbX: -1.45, pcbY: -0.95, width: 0.9, height: 0.35 }, // IC
];

export const USBLC6 = (props: ChipProps<typeof usblc6PinLabels>) => (
  <chip
    {...props}
    manufacturerPartNumber="USBLC6-2"
    pinLabels={usblc6PinLabels}
    footprint={
      <footprint>
        {usblc6FootprintPads.map((pad) => (
          <smtpad
            portHints={pad.portHints}
            pcbX={pad.pcbX}
            pcbY={pad.pcbY}
            width={pad.width}
            height={pad.height}
            shape="rect"
          />
        ))}
        {/* Chip outline */}
        <silkscreenpath
          route={[
            { x: -2.0, y: 1.4 },
            { x: 2.0, y: 1.4 },
            { x: 2.0, y: -1.4 },
            { x: -2.0, y: -1.4 },
            { x: -2.0, y: 1.4 },
          ]}
        />
        {/* Pin 1 indicator */}
        <silkscreenpath
          route={[
            { x: -2.0, y: 1.2 },
            { x: -1.5, y: 1.2 },
          ]}
          strokeWidth="0.3"
        />
      </footprint>
    }
  />
);

export type USBLC6Pin = keyof typeof usblc6PinLabels;
