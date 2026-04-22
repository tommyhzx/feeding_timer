import type { ChipProps } from "tscircuit";

/**
 * TP4056 - 1A Linear Li-ion Battery Charger
 *
 * 完整线性锂离子电池充电管理芯片
 * 封装: SOT-23-6
 *
 * 引脚定义:
 * 1 = TEMP  (温度检测输入，悬空或接NTC)
 * 2 = PROG  (充电电流编程，接电阻到GND)
 * 3 = GND   (地)
 * 4 = VCC   (电源输入，4.5V-6V)
 * 5 = BAT   (电池连接，充电输出)
 * 6 = STAT  (充电状态指示，开漏输出)
 *
 * 充电电流: I_CHG = 1000 / R_PROG (kΩ)
 *   R_PROG = 2kΩ → 500mA
 *   R_PROG = 4kΩ → 250mA
 */
const tp4056PinLabels = {
  pin1: "TEMP",
  pin2: "PROG",
  pin3: "GND",
  pin4: "VCC",
  pin5: "BAT",
  pin6: "STAT",
} as const;

/**
 * TP4056 SOT-23-6 footprint
 * 封装尺寸: 2.9mm x 1.6mm
 * 引脚间距: 0.95mm
 */
const tp4056FootprintPads = [
  { portHints: ["pin1"], pcbX: -1.9, pcbY: 0.95, width: 1.0, height: 0.6 }, // TEMP
  { portHints: ["pin2"], pcbX: -0.95, pcbY: 0.95, width: 1.0, height: 0.6 }, // PROG
  { portHints: ["pin3"], pcbX: 0, pcbY: 0.95, width: 1.0, height: 0.6 },     // GND
  { portHints: ["pin4"], pcbX: 0, pcbY: -0.95, width: 1.0, height: 0.6 },    // VCC
  { portHints: ["pin5"], pcbX: -0.95, pcbY: -0.95, width: 1.0, height: 0.6 }, // BAT
  { portHints: ["pin6"], pcbX: -1.9, pcbY: -0.95, width: 1.0, height: 0.6 }, // STAT
];

export const TP4056 = (props: ChipProps<typeof tp4056PinLabels>) => (
  <chip
    {...props}
    manufacturerPartNumber="TP4056"
    pinLabels={tp4056PinLabels}
    footprint={
      <footprint>
        {/* 引脚焊盘 */}
        {tp4056FootprintPads.map((pad) => (
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
            { x: -2.5, y: 1.5 },
            { x: 1.5, y: 1.5 },
            { x: 1.5, y: -1.5 },
            { x: -2.5, y: -1.5 },
            { x: -2.5, y: 1.5 },
          ]}
        />
        {/* 引脚 1 标识点 */}
        <silkscreencircle pcbX={-1.9} pcbY={0} radius="0.2" />
      </footprint>
    }
  />
);

export type TP4056Pin = keyof typeof tp4056PinLabels;
