import type { ChipProps } from "tscircuit";
import {
  USBTYPEC2927039SMTPads,
  USBTYPEC2927039MountingHoles,
  USBTYPEC2927039PlatedHoles,
  USBTYPEC2927039Dimensions,
} from "./footprints/USB-TYPE-C2927039";

/**
 * USB-C Connector using JLCS C2927039
 * 16-pin SMD USB-C receptacle
 *
 * Pin mapping (pin1-pin12: SMT signal pads, pin13-pin16: Shield mounting holes):
 * pin1  = B12A1 = GND
 * pin2  = B9A4  = VBUS
 * pin3  = B8    = NC
 * pin4  = A5    = CC1
 * pin5  = B7    = SBU2
 * pin6  = A6    = DP_A
 * pin7  = A7    = DM
 * pin8  = B6    = DP
 * pin9  = A8    = SBU1
 * pin10 = B5    = CC2
 * pin11 = A9B4  = VBUS
 * pin12 = A12B1 = GND
 * pin13-pin16 = Shield/GND
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

export const USBConnector = (props: ChipProps<typeof usbCPinLabels>) => {
  const { width, height } = USBTYPEC2927039Dimensions;

  return (
    <chip
      {...props}
      manufacturerPartNumber="USB-TYPEC"
      pinLabels={usbCPinLabels}
      footprint={
        <footprint>
          {/* SMT signal pads */}
          {USBTYPEC2927039SMTPads.map((pad) => (
            <smtpad
              portHints={pad.portHints}
              pcbX={pad.pcbX}
              pcbY={pad.pcbY}
              width={pad.width}
              height={pad.height}
              shape={pad.shape}
            />
          ))}

          {/* Mounting holes (metal shield anchors) */}
          {USBTYPEC2927039MountingHoles.map((hole) => (
            <hole
              pcbX={hole.pcbX}
              pcbY={hole.pcbY}
              diameter={`${hole.diameter}mm`}
            />
          ))}

          {/* Corner plated holes (shield) */}
          {USBTYPEC2927039PlatedHoles.map((ph) => (
            <platedhole
              portHints={ph.portHints}
              pcbX={ph.pcbX}
              pcbY={ph.pcbY}
              shape="circular_hole_with_rect_pad"
              holeDiameter={`${ph.diameter}mm`}
              rectPadWidth="1.5mm"
              rectPadHeight="1.5mm"
            />
          ))}

          {/* USB-C 外形丝印 */}
          <silkscreenpath
            route={[
              { x: -width / 2, y: height / 2 + 0.5 },
              { x: width / 2, y: height / 2 + 0.5 },
              { x: width / 2, y: -height / 2 - 0.5 },
              { x: -width / 2, y: -height / 2 - 0.5 },
              { x: -width / 2, y: height / 2 + 0.5 },
            ]}
          />

          {/* Type-C 插座指示 (凹槽) */}
          <silkscreenpath
            route={[
              { x: -2.5, y: height / 2 },
              { x: 2.5, y: height / 2 },
            ]}
            strokeWidth="0.3"
          />

          {/* Pin 1 标识 */}
          <silkscreenpath
            route={[
              { x: -width / 2, y: height / 2 + 0.3 },
              { x: -width / 2 + 0.5, y: height / 2 + 0.3 },
            ]}
            strokeWidth="0.3"
          />
        </footprint>
      }
    />
  );
};

export type USBConnectorPin = keyof typeof usbCPinLabels;
