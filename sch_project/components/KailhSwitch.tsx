/**
 * Kailh CPG151101D213 Mechanical Keyboard Switch
 * C400235 - LCSC Part Number
 * Through-hole switch with 2 pins and central mounting hole
 */

type PinData = {
  portHints: string[];
  pcbX: number;
  pcbY: number;
  width: number;
  height: number;
};

// Pin and mounting hole data (mounting hole at center 0,0)
const PINS: PinData[] = [
  { portHints: ["pin1"], pcbX: -3.81, pcbY: 2.54, width: 2.4, height: 2.4 },
  { portHints: ["pin2"], pcbX: 2.54, pcbY: 5.08, width: 2.4, height: 2.4 },
];

const MOUNTING_HOLE = { pcbX: 0, pcbY: 0, diameter: 4.2 };

export interface KailhSwitchProps {
  name: string;
  pcbX?: number;
  pcbY?: number;
  pcbRotation?: string;
  schX?: number;
  schY?: number;
}

export const KailhSwitch = ({
  name,
  pcbX,
  pcbY,
  pcbRotation,
  schX,
  schY,
}: KailhSwitchProps) => {
  // Build position props object, excluding undefined values
  const positionProps = {
    ...(pcbX !== undefined && { pcbX }),
    ...(pcbY !== undefined && { pcbY }),
    ...(pcbRotation !== undefined && { pcbRotation }),
    ...(schX !== undefined && { schX }),
    ...(schY !== undefined && { schY }),
  };

  const hasCustomPosition = Object.keys(positionProps).length > 0;

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
            pcbX={MOUNTING_HOLE.pcbX}
            pcbY={MOUNTING_HOLE.pcbY}
            diameter={`${MOUNTING_HOLE.diameter}mm`}
          />
          {/* 引脚 */}
          <platedhole
            portHints={PINS[0].portHints}
            pcbX={PINS[0].pcbX}
            pcbY={PINS[0].pcbY}
            shape="circular_hole_with_rect_pad"
            holeDiameter="1.6mm"
            rectPadWidth={`${PINS[0].width}mm`}
            rectPadHeight={`${PINS[0].height}mm`}
          />
          <platedhole
            portHints={PINS[1].portHints}
            pcbX={PINS[1].pcbX}
            pcbY={PINS[1].pcbY}
            shape="circular_hole_with_rect_pad"
            holeDiameter="1.6mm"
            rectPadWidth={`${PINS[1].width}mm`}
            rectPadHeight={`${PINS[1].height}mm`}
          />
        </footprint>
      }
    />
  );

  if (hasCustomPosition) {
    return <group {...positionProps}>{switchElement}</group>;
  }
  return switchElement;
};
