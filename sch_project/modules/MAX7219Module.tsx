/**
 * MAX7219 Dot Matrix Module Interface
 * 5-pin header for connecting MAX7219 based LED matrix display
 * Pinout: VCC - GND - DIN - CS - CLK
 */

const max7219PinLabels = {
  pin1: "VCC",
  pin2: "GND",
  pin3: "DIN",
  pin4: "CS",
  pin5: "CLK",
} as const;

export interface MAX7219ModuleProps {
  name?: string;
  pcbX?: number;
  pcbY?: number;
  schX?: number;
  schY?: number;
  pcbRotation?: string;
}

export const MAX7219Module = ({
  name = "MAX7219",
  pcbX = 0,
  pcbY = 0,
  schX = 0,
  schY = 0,
  pcbRotation,
}: MAX7219ModuleProps) => {
  return (
    <group name={name} pcbX={pcbX} pcbY={pcbY} schX={schX} schY={schY} pcbRotation={pcbRotation}>
      <pinheader
        name={`${name}_J1`}
        pinCount={5}
        gender="male"
        pitch="2.54mm"
        pinLabels={max7219PinLabels}
        pcbX={0}
        pcbY={0}
      />
    </group>
  );
};
