import type { ChipProps } from "tscircuit";

/**
 * ETA6093 - All-in-One Lithium Battery Charger & Boost Converter
 *
 * 高效充电升压一体IC，3.7V锂电池 ↔ 5V双向转换
 * 封装: SOT-23-5
 *
 * 引脚定义 (SOT23-5):
 * 1 = OUT   (5V输出)
 * 2 = GND   (地)
 * 3 = LED   (LED指示输出)
 * 4 = BAT   (电池输入/输出)
 * 5 = SW    (开关节点，接电感)
 *
 * 主要参数:
 * - 充电模式: USB 5V → 锂电池 (1.2A)
 * - 升压模式: 锂电池 → 5V输出 (1.2A)
 * - 效率: 高达95%
 * - 开关频率: 约900kHz
 * - 推荐电感: 4.7µH (饱和电流 > 1.5A)
 * - LED指示:
 *   - 放电中: 蓝灯高亮，红灯熄灭
 *   - 充电中: 蓝灯熄灭，红灯闪烁
 *   - 充满: 蓝灯熄灭，红灯高亮
 */
const eta6093PinLabels = {
  pin1: "OUT",
  pin2: "GND",
  pin3: "LED",
  pin4: "BAT",
  pin5: "SW",
} as const;

/**
 * ETA6093 SOT-23-5 footprint
 * 封装尺寸: 2.9mm x 1.6mm
 * 引脚间距: 0.95mm
 *
 * Pin positions (SOT23-5 standard):
 * Pin 1 (左上): OUT
 * Pin 2 (右上): GND
 * Pin 3 (右下): LED
 * Pin 4 (左下): BAT
 * Pin 5 (中间): SW
 */
const eta6093FootprintPads = [
  { portHints: ["pin1"], pcbX: -0.95, pcbY: 1.4, width: 1.0, height: 0.6 },  // OUT
  { portHints: ["pin2"], pcbX: 0.95, pcbY: 1.4, width: 1.0, height: 0.6 },   // GND
  { portHints: ["pin3"], pcbX: 0.95, pcbY: -1.4, width: 1.0, height: 0.6 },  // LED
  { portHints: ["pin4"], pcbX: -0.95, pcbY: -1.4, width: 1.0, height: 0.6 }, // BAT
  { portHints: ["pin5"], pcbX: 0, pcbY: 0, width: 1.2, height: 1.2 },        // SW (center)
];

export const ETA6093 = (props: ChipProps<typeof eta6093PinLabels>) => (
  <chip
    {...props}
    manufacturerPartNumber="ETA6093S2F"
    pinLabels={eta6093PinLabels}
    footprint={
      <footprint>
        {/* 引脚焊盘 */}
        {eta6093FootprintPads.map((pad) => (
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
        {/* Pin 5 (SW) 中心焊盘丝印 */}
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

export type ETA6093Pin = keyof typeof eta6093PinLabels;
