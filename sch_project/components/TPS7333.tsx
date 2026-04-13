import type { ChipProps } from "tscircuit";

/**
 * TPS7333 Low Dropout Voltage Regulator
 * TI 500mA LDO with Enable
 *
 * 封装: SOIC-8 或 SOT-223
 * 引脚:
 * 1 = IN (5V 输入)
 * 2 = GND
 * 3 = GND (thermal)
 * 4 = OUT (3.3V 输出)
 * 5 = EN (使能，高电平有效)
 * 6-8 = NC (无连接)
 */
const tps7333PinLabels = {
  pin1: "IN",
  pin2: "GND",
  pin3: "GND_THERMAL",
  pin4: "OUT",
  pin5: "EN",
  pin6: "NC",
  pin7: "NC",
  pin8: "NC",
} as const;

/**
 * TPS7333 SOIC-8 footprint
 */
const tps7333FootprintPads = [
  { portHints: ["pin1"], pcbX: -3.5, pcbY: 2.5, width: 1.5, height: 0.6 }, // IN
  { portHints: ["pin2"], pcbX: -1.8, pcbY: 2.5, width: 1.5, height: 0.6 }, // GND
  { portHints: ["pin3"], pcbX: 0, pcbY: 2.5, width: 1.5, height: 0.6 }, // GND_THERMAL
  { portHints: ["pin4"], pcbX: 1.8, pcbY: 2.5, width: 1.5, height: 0.6 }, // OUT
  { portHints: ["pin5"], pcbX: 3.5, pcbY: 2.5, width: 1.5, height: 0.6 }, // EN
  { portHints: ["pin6"], pcbX: 3.5, pcbY: -2.5, width: 1.5, height: 0.6 }, // NC
  { portHints: ["pin7"], pcbX: 1.8, pcbY: -2.5, width: 1.5, height: 0.6 }, // NC
  { portHints: ["pin8"], pcbX: 0, pcbY: -2.5, width: 1.5, height: 0.6 }, // NC
];

export const TPS7333 = (props: ChipProps<typeof tps7333PinLabels>) => (
  <chip
    {...props}
    manufacturerPartNumber="TPS7333DBVR"
    pinLabels={tps7333PinLabels}
    footprint={
      <footprint>
        {/* 引脚焊盘 */}
        {tps7333FootprintPads.map((pad) => (
          <smtpad
            portHints={pad.portHints}
            pcbX={pad.pcbX}
            pcbY={pad.pcbY}
            width={pad.width}
            height={pad.height}
            shape="rect"
          />
        ))}
        {/* 芯片外框丝印 */}
        <silkscreenpath
          route={[
            { x: -4.5, y: 3.2 },
            { x: 4.5, y: 3.2 },
            { x: 4.5, y: -3.2 },
            { x: -4.5, y: -3.2 },
            { x: -4.5, y: 3.2 },
          ]}
        />
        {/* 引脚 1 标识点 */}
        <silkscreenpath
          route={[
            { x: -4.5, y: 2.8 },
            { x: -4.0, y: 2.8 },
          ]}
          strokeWidth="0.3"
        />
      </footprint>
    }
  />
);

export type TPS7333Pin = keyof typeof tps7333PinLabels;
