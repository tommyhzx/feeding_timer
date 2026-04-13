/**
 * CPG151101D213 (Kailh Keyboard Switch) Footprint Data
 * C400235 - LCSC part number
 * Converted from EasyEDA footprint data
 *
 * This is a through-hole mechanical keyboard switch with 2 pins
 * and a central mounting hole.
 */

export const CPG151101D213FootprintData: Array<{
  portHints: string[];
  pcbX: number;
  pcbY: number;
  width: number;
  height: number;
  shape: "rect";
}> = [
  {
    portHints: ["pin1"],
    pcbX: -3.175,
    pcbY: -0.575,
    width: 2.4,
    height: 2.4,
    shape: "rect" as const,
  },
  {
    portHints: ["pin2"],
    pcbX: 3.175,
    pcbY: 1.965,
    width: 2.4,
    height: 2.4,
    shape: "rect" as const,
  },
];

// Mechanical mounting hole data (not electrical pins)
// Central hole: 4.2mm diameter
export const CPG151101D213MountingHole = {
  pcbX: 0.635,
  pcbY: -3.115,
  diameter: 4.2,
};
