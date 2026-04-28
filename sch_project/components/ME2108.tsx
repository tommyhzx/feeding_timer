import type { ChipProps } from "tscircuit";

/**
 * ME2108C50 - High Efficiency Step-Up DC-DC Converter
 *
 * 高效升压转换器，3.7V锂电池 → 5V输出
 * 封装: SOT-23-5
 *
 * 引脚定义 (ME2108C50 数据手册):
 * 1 = GND   (地)
 * 2 = VOUT  (5V输出)
 * 3 = CE    (Chip Enable，使能控制，接VIN=常开，接GND=关闭)
 * 4 = LX    (开关输出，接电感)
 * 5 = NC    (悬空，不连接)
 *
 * 主要参数:
 * - 输入电压: 2.5V - 4.5V
 * - 输出电压: 固定5.0V
 * - 最大输出电流: 1A
 * - 开关频率: 1.2MHz
 * - 推荐电感: 4.7µH (饱和电流 > 1.2A)
 * - 效率: >90%
 */
/**
 * ME2108C50 Pinout (SOT-23-5)
 * 按照数据手册的正确引脚定义
 */
const me2108PinLabels = {
  pin1: "GND",
  pin2: "VOUT",
  pin3: "CE",
  pin4: "LX",
  pin5: "NC",
} as const;

/**
 * ME2108 SOT-23-5 footprint
 * 封装尺寸: 2.9mm x 1.6mm
 * 引脚间距: 0.95mm
 *
 * ME2108C50 引脚位置:
 * Pin 1 (左上): GND
 * Pin 2 (右上): VOUT (5V输出)
 * Pin 3 (右下): CE (使能，接VIN)
 * Pin 4 (左下): LX (开关输出，接电感)
 * Pin 5 (中间): NC (悬空)
 */
const me2108FootprintPads = [
  { portHints: ["pin1"], pcbX: -0.95, pcbY: 1.4, width: 1.0, height: 0.6 },  // GND
  { portHints: ["pin2"], pcbX: 0.95, pcbY: 1.4, width: 1.0, height: 0.6 },   // VOUT
  { portHints: ["pin3"], pcbX: 0.95, pcbY: -1.4, width: 1.0, height: 0.6 },  // CE
  { portHints: ["pin4"], pcbX: -0.95, pcbY: -1.4, width: 1.0, height: 0.6 }, // LX
  { portHints: ["pin5"], pcbX: 0, pcbY: 0, width: 1.2, height: 1.2 },        // NC (center)
];

export const ME2108 = (props: ChipProps<typeof me2108PinLabels>) => (
  <chip
    {...props}
    manufacturerPartNumber="ME2108"
    pinLabels={me2108PinLabels}
    schPinSpacing={0.2}
    schWidth={2}
    footprint={
      <footprint>
        {/* 引脚焊盘 */}
        {me2108FootprintPads.map((pad) => (
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
            { x: -1.5, y: 2.0 },
            { x: 1.5, y: 2.0 },
            { x: 1.5, y: -2.0 },
            { x: -1.5, y: -2.0 },
            { x: -1.5, y: 2.0 },
          ]}
        />
        {/* 引脚 1 标识点 */}
        <silkscreencircle pcbX={-0.95} pcbY={0} radius="0.2" />
        {/* Pin 5 (NC) 中心焊盘丝印 */}
        <silkscreenpath
          route={[
            { x: -0.3, y: 0.3 },
            { x: 0.3, y: 0.3 },
            { x: 0.3, y: -0.3 },
            { x: -0.3, y: -0.3 },
            { x: -0.3, y: 0.3 },
          ]}
        />
      </footprint>
    }
  />
);

export type ME2108Pin = keyof typeof me2108PinLabels;
