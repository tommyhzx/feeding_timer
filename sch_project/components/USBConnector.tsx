import type { ChipProps } from "tscircuit";

/**
 * USB-C Connector (JLCS C2927039)
 * 16-pin SMD USB-C 母口座
 *
 * 引脚定义:
 * 1-12: 信号引脚 (SMT焊盘)
 * 13-16: 屏蔽/安装引脚 (通孔)
 *
 * 信号引脚:
 * 1,12 = GND
 * 2,11 = VBUS (5V)
 * 3 = CC2, 9 = CC1 (配置通道)
 * 4 = SBU1, 8 = SBU2 (边带用)
 * 5,7 = DP (D+), 6 = DM (D-)
 * 10 = NC
 */
const usbCPinLabels = {
  pin1: "GND",
  pin2: "VBUS",
  pin3: "CC2",
  pin4: "SBU1",
  pin5: "DP",
  pin6: "DM",
  pin7: "DP_A",
  pin8: "SBU2",
  pin9: "CC1",
  pin10: "NC",
  pin11: "VBUS2",
  pin12: "GND2",
  pin13: "SHIELD",
  pin14: "SHIELD",
  pin15: "SHIELD",
  pin16: "SHIELD",
} as const;

/**
 * USB-C 信号焊盘 (SMT)
 */
const usbCSmtPads = [
  { portHints: ["pin1"], pcbX: -3.2, pcbY: 2.125, width: 0.5, height: 1.15 }, // GND
  { portHints: ["pin2"], pcbX: -2.4, pcbY: 2.125, width: 0.5, height: 1.15 }, // VBUS
  { portHints: ["pin3"], pcbX: -1.75, pcbY: 2.126, width: 0.3, height: 1.15 }, // CC2
  { portHints: ["pin4"], pcbX: -1.25, pcbY: 2.125, width: 0.3, height: 1.15 }, // SBU1
  { portHints: ["pin5"], pcbX: -0.75, pcbY: 2.125, width: 0.3, height: 1.15 }, // DP
  { portHints: ["pin6"], pcbX: -0.25, pcbY: 2.125, width: 0.3, height: 1.15 }, // DM
  { portHints: ["pin7"], pcbX: 0.25, pcbY: 2.125, width: 0.3, height: 1.15 }, // DP_A
  { portHints: ["pin8"], pcbX: 0.75, pcbY: 2.125, width: 0.3, height: 1.15 }, // SBU2
  { portHints: ["pin9"], pcbX: 1.25, pcbY: 2.126, width: 0.3, height: 1.15 }, // CC1
  { portHints: ["pin10"], pcbX: 1.75, pcbY: 2.125, width: 0.3, height: 1.15 }, // NC
  { portHints: ["pin11"], pcbX: 2.4, pcbY: 2.125, width: 0.5, height: 1.15 }, // VBUS2
  { portHints: ["pin12"], pcbX: 3.2, pcbY: 2.125, width: 0.5, height: 1.15 }, // GND2
];

/**
 * USB-C 中间固定孔 (非导电)
 */
const usbCMountingHoles = [
  { pcbX: 2.89, pcbY: 1.074, diameter: 0.65 },
  { pcbX: -2.89, pcbY: 1.074, diameter: 0.65 },
];

/**
 * USB-C 屏蔽引脚 (通孔，长圆孔)
 * pin13,16: 顶部，较大
 * pin14,15: 底部，较小
 */
const usbCShieldHoles = [
  {
    portHints: ["pin13"],
    pcbX: -4.32,
    pcbY: 1.574,
    holeWidth: 1.7,
    holeHeight: 0.6,
    rectPadWidth: 2.1,
    rectPadHeight: 1.0,
  }, // 左上
  {
    portHints: ["pin16"],
    pcbX: 4.32,
    pcbY: 1.574,
    holeWidth: 1.7,
    holeHeight: 0.6,
    rectPadWidth: 2.1,
    rectPadHeight: 1.0,
  }, // 右上
  {
    portHints: ["pin14"],
    pcbX: -4.32,
    pcbY: -2.606,
    holeWidth: 1.2,
    holeHeight: 0.6,
    rectPadWidth: 1.6,
    rectPadHeight: 1.0,
  }, // 左下
  {
    portHints: ["pin15"],
    pcbX: 4.32,
    pcbY: -2.606,
    holeWidth: 1.2,
    holeHeight: 0.6,
    rectPadWidth: 1.6,
    rectPadHeight: 1.0,
  }, // 右下
];

const usbCDims = { width: 8.74, height: 5.35 };

export const USBConnector = (props: ChipProps<typeof usbCPinLabels>) => (
  <chip
    {...props}
    manufacturerPartNumber="USB-TYPEC"
    pinLabels={usbCPinLabels}
    schPinSpacing={0.2}
    schWidth={2}
    footprint={
      <footprint>
        {/* 信号焊盘 (SMT) */}
        {usbCSmtPads.map((pad) => (
          <smtpad
            portHints={pad.portHints}
            pcbX={pad.pcbX}
            pcbY={pad.pcbY}
            width={pad.width}
            height={pad.height}
            shape="rect"
          />
        ))}

        {/* 中间固定孔 */}
        {usbCMountingHoles.map((hole) => (
          <hole
            pcbX={hole.pcbX}
            pcbY={hole.pcbY}
            diameter={`${hole.diameter}mm`}
          />
        ))}

        {/* 屏蔽引脚 (长圆孔 + 圆角矩形焊盘) */}
        {usbCShieldHoles.map((h) => (
          <platedhole
            portHints={h.portHints}
            pcbX={h.pcbX}
            pcbY={h.pcbY}
            shape="pill_hole_with_rect_pad"
            holeWidth={`${h.holeWidth}mm`}
            holeHeight={`${h.holeHeight}mm`}
            rectPadWidth={`${h.rectPadWidth}mm`}
            rectPadHeight={`${h.rectPadHeight}mm`}
            rectBorderRadius="0.5mm"
          />
        ))}

        {/* 外框丝印 */}
        <silkscreenpath
          route={[
            { x: -usbCDims.width / 2, y: usbCDims.height / 2 + 0.5 },
            { x: usbCDims.width / 2, y: usbCDims.height / 2 + 0.5 },
            { x: usbCDims.width / 2, y: -usbCDims.height / 2 - 0.5 },
            { x: -usbCDims.width / 2, y: -usbCDims.height / 2 - 0.5 },
            { x: -usbCDims.width / 2, y: usbCDims.height / 2 + 0.5 },
          ]}
        />

        {/* 接口开口指示 */}
        <silkscreenpath
          route={[
            { x: -2.5, y: usbCDims.height / 2 },
            { x: 2.5, y: usbCDims.height / 2 },
          ]}
          strokeWidth="0.3"
        />

        {/* Pin 1 标识 */}
        <silkscreenpath
          route={[
            { x: -usbCDims.width / 2, y: usbCDims.height / 2 + 0.3 },
            { x: -usbCDims.width / 2 + 0.5, y: usbCDims.height / 2 + 0.3 },
          ]}
          strokeWidth="0.3"
        />
      </footprint>
    }
  />
);

export type USBConnectorPin = keyof typeof usbCPinLabels;
