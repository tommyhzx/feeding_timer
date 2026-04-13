import { CPG151101D213FootprintData, CPG151101D213MountingHole } from "./footprints/CPG151101D213";

export interface KailhSwitchProps {
  name: string;
  pcbX?: number;
  pcbY?: number;
  pcbRotation?: string;
  schX?: number;
  schY?: number;
}

/**
 * Kailh CPG151101D213 Mechanical Keyboard Switch
 * C400235 - LCSC Part Number
 * Through-hole switch with 2 pins and central mounting hole
 */
export const KailhSwitch = ({
  name,
  pcbX,
  pcbY,
  pcbRotation,
  schX,
  schY,
}: KailhSwitchProps) => {
  const hasCustomPosition =
    pcbX !== undefined ||
    pcbY !== undefined ||
    pcbRotation !== undefined ||
    schX !== undefined ||
    schY !== undefined;

  const groupProps: any = {};
  if (pcbX !== undefined) groupProps.pcbX = pcbX;
  if (pcbY !== undefined) groupProps.pcbY = pcbY;
  if (pcbRotation !== undefined) groupProps.pcbRotation = pcbRotation;
  if (schX !== undefined) groupProps.schX = schX;
  if (schY !== undefined) groupProps.schY = schY;

  // Get pin positions from footprint data
  const pin1 = CPG151101D213FootprintData[0];
  const pin2 = CPG151101D213FootprintData[1];
  const mountingHole = CPG151101D213MountingHole;

  const switchElement = (
    <switch
      name={name}
      type="spst"
      footprint={
        <footprint>
          {/* 丝印外轮廓 */}
          <silkscreenpath
            route={[
              { x: -7.75, y: -7.75 },
              { x: 7.75, y: -7.75 },
              { x: 7.75, y: 7.75 },
              { x: -7.75, y: 7.75 },
              { x: -7.75, y: -7.75 },
            ]}
          />
          {/* 中心安装孔 */}
          <hole
            pcbX={mountingHole.pcbX}
            pcbY={mountingHole.pcbY}
            diameter={`${mountingHole.diameter}mm`}
          />
          {/* 引脚1 */}
          <platedhole
            portHints={pin1.portHints}
            pcbX={pin1.pcbX}
            pcbY={pin1.pcbY}
            shape="circular_hole_with_rect_pad"
            holeDiameter="1.6mm"
            rectPadWidth={`${pin1.width}mm`}
            rectPadHeight={`${pin1.height}mm`}
          />
          {/* 引脚2 */}
          <platedhole
            portHints={pin2.portHints}
            pcbX={pin2.pcbX}
            pcbY={pin2.pcbY}
            shape="circular_hole_with_rect_pad"
            holeDiameter="1.6mm"
            rectPadWidth={`${pin2.width}mm`}
            rectPadHeight={`${pin2.height}mm`}
          />
        </footprint>
      }
    />
  );

  if (hasCustomPosition) {
    return <group {...groupProps}>{switchElement}</group>;
  }
  return switchElement;
};
