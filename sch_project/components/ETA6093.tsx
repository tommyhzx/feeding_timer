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

export const ETA6093 = (props: ChipProps<typeof eta6093PinLabels>) => (
  <chip
    {...props}
    manufacturerPartNumber="ETA6093S2F"
    pinLabels={eta6093PinLabels}
    footprint="sot23_5"
  />
);

export type ETA6093Pin = keyof typeof eta6093PinLabels;
