export interface DiodeProps {
  name: string;
  pcbX?: number;
  pcbY?: number;
  pcbRotation?: string;
  schX?: number;
  schY?: number;
}

/**
 * 1N4148WS Schottky diode for keyboard matrix
 * diode 组件使用标准 SMD footprint
 */
export const Diode = ({
  name,
  pcbX,
  pcbY,
  pcbRotation,
  schX,
  schY,
}: DiodeProps) => {
  return (
    <diode
      name={name}
      pcbX={pcbX}
      pcbY={pcbY}
      pcbRotation={pcbRotation}
      schX={schX}
      schY={schY}
      footprint="sod123"
    />
  );
};