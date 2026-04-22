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

/**
 * BatteryConnector 2pin footprint
 * 间距: 2.0mm
 */
const batteryConnectorFootprintPads = [
  { portHints: ["pin1"], pcbX: -1, pcbY: 0, width: "2", height: "2", shape: "rect" }, // VBAT+
  { portHints: ["pin2"], pcbX: 1, pcbY: 0, width: "2", height: "2", shape: "rect" },   // GND
];

export const BatteryConnector = (props: ChipProps<typeof batteryConnectorPinLabels>) => (
  <chip
    {...props}
    manufacturerPartNumber="PH2.0-2P"
    pinLabels={batteryConnectorPinLabels}
    footprint={
      <footprint>
        {/* 引脚焊盘 */}
        {batteryConnectorFootprintPads.map((pad) => (
          <smtpad
            portHints={pad.portHints}
            pcbX={pad.pcbX}
            pcbY={pad.pcbY}
            width={pad.width}
            height={pad.height}
            shape={pad.shape}
          />
        ))}
        {/* 外框丝印 */}
        <silkscreenpath
          route={[
            { x: -2.5, y: 2 },
            { x: 2.5, y: 2 },
            { x: 2.5, y: -2 },
            { x: -2.5, y: -2 },
            { x: -2.5, y: 2 },
          ]}
        />
        {/* 极性标识 (+) */}
        <silkscreenpath
          route={[
            { x: -1.7, y: 0 },
            { x: -0.3, y: 0 },
          ]}
          strokeWidth="0.3"
        />
        <silkscreenpath
          route={[
            { x: -1, y: -0.7 },
            { x: -1, y: 0.7 },
          ]}
          strokeWidth="0.3"
        />
      </footprint>
    }
  />
);

export type BatteryConnectorPin = keyof typeof batteryConnectorPinLabels;
