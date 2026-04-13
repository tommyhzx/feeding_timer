import type { ChipProps } from "tscircuit";

/**
 * 贴片电容 (SMD Capacitor)
 * 封装: 0402 / 0603 / 0805
 */
const capacitorPinLabels = {
  pin1: "1",
  pin2: "2",
} as const;

/**
 * 0603 封装尺寸 (mm):
 * 宽度: 0.8mm, 高度: 0.45mm
 */
export const Capacitor0603 = (props: ChipProps<typeof capacitorPinLabels> & { capacitance?: string }) => (
  <chip
    {...props}
    manufacturerPartNumber="CAPACITOR-0603"
    pinLabels={capacitorPinLabels}
    footprint={
      <footprint>
        {/* 引脚焊盘 */}
        <smtpad
          portHints={["pin1"]}
          pcbX={-0.8}
          pcbY={0}
          width={0.6}
          height={0.5}
          shape="rect"
        />
        <smtpad
          portHints={["pin2"]}
          pcbX={0.8}
          pcbY={0}
          width={0.6}
          height={0.5}
          shape="rect"
        />
        {/* 电容丝印轮廓 (矩形) */}
        <silkscreenpath
          route={[
            { x: -0.3, y: 0.2 },
            { x: 0.3, y: 0.2 },
            { x: 0.3, y: -0.2 },
            { x: -0.3, y: -0.2 },
            { x: -0.3, y: 0.2 },
          ]}
        />
      </footprint>
    }
  />
);

export type CapacitorPin = keyof typeof capacitorPinLabels;
