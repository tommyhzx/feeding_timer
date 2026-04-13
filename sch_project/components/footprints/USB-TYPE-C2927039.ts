/**
 * C2927039 USB-C Connector Footprint Data
 * Auto-generated from EasyEDA (C2927039)
 *
 * Generated: 2026-03-30
 * 16-pin USB-C SMD connector (pin1-pin12: SMT signal pads, pin13-pin16: Shield mounting holes)
 *
 * Pin mapping:
 * pin1  = GND
 * pin2  = VBUS
 * pin3  = CC2
 * pin4  = SBU1
 * pin5  = DP
 * pin6  = DM
 * pin7  = DP_A
 * pin8  = SBU2
 * pin9  = CC1
 * pin10 = NC
 * pin11 = VBUS2
 * pin12 = GND2
 * pin13-pin16 = Shield/GND
 */

export const USBTYPEC2927039SMTPads: Array<{
  portHints: string[];
  pcbX: number;
  pcbY: number;
  width: number;
  height: number;
  shape: "rect";
}> = [
  // Top side pads (y ≈ 2.12-2.13)
  { portHints: ["pin1"], pcbX: -3.2, pcbY: 2.125, width: 0.5, height: 1.1, shape: "rect" as const },
  { portHints: ["pin2"], pcbX: -2.4, pcbY: 2.125, width: 0.5, height: 1.1, shape: "rect" as const },
  { portHints: ["pin3"], pcbX: -1.75, pcbY: 2.126, width: 0.3, height: 1.1, shape: "rect" as const },
  { portHints: ["pin4"], pcbX: -1.25, pcbY: 2.125, width: 0.3, height: 1.1, shape: "rect" as const },
  { portHints: ["pin5"], pcbX: -0.75, pcbY: 2.125, width: 0.3, height: 1.1, shape: "rect" as const },
  { portHints: ["pin6"], pcbX: -0.25, pcbY: 2.125, width: 0.3, height: 1.1, shape: "rect" as const },
  { portHints: ["pin7"], pcbX: 0.25, pcbY: 2.125, width: 0.3, height: 1.1, shape: "rect" as const },
  { portHints: ["pin8"], pcbX: 0.75, pcbY: 2.125, width: 0.3, height: 1.1, shape: "rect" as const },
  { portHints: ["pin9"], pcbX: 1.25, pcbY: 2.126, width: 0.3, height: 1.1, shape: "rect" as const },
  { portHints: ["pin10"], pcbX: 1.75, pcbY: 2.125, width: 0.3, height: 1.1, shape: "rect" as const },
  { portHints: ["pin11"], pcbX: 2.4, pcbY: 2.125, width: 0.5, height: 1.1, shape: "rect" as const },
  { portHints: ["pin12"], pcbX: 3.2, pcbY: 2.125, width: 0.5, height: 1.1, shape: "rect" as const },
];

// Mounting holes (metal shield anchors)
export const USBTYPEC2927039MountingHoles: Array<{
  pcbX: number;
  pcbY: number;
  diameter: number;
}> = [
  { pcbX: 2.89, pcbY: 1.074, diameter: 0.65 },
  { pcbX: -2.89, pcbY: 1.074, diameter: 0.65 },
];

// Corner plated holes (shield mounting)
export const USBTYPEC2927039PlatedHoles: Array<{
  portHints: string[];
  pcbX: number;
  pcbY: number;
  diameter: number;
}> = [
  { portHints: ["pin13"], pcbX: -4.32, pcbY: 1.574, diameter: 0.8 },
  { portHints: ["pin14"], pcbX: -4.32, pcbY: -2.626, diameter: 0.8 },
  { portHints: ["pin15"], pcbX: 4.32, pcbY: -2.626, diameter: 0.8 },
  { portHints: ["pin16"], pcbX: 4.32, pcbY: 1.574, diameter: 0.8 },
];

// Package dimensions
export const USBTYPEC2927039Dimensions = {
  width: 8.74,
  height: 5.35,
};
