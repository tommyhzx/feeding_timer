/**
 * KLE (Keyboard Layout Editor) Layout type
 * Array of rows, each row is an array of key labels or property objects
 */
export type KLELayout = (string | KLEKeyProperties)[][];

export interface KLEKeyProperties {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  r?: number;
  rx?: number;
  ry?: number;
  a?: number;
  /** @deprecated - use 'r' instead */
  rotation_angle?: number;
}

export interface ParsedKey {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  rotationX: number;
  rotationY: number;
  row: number;
  col: number;
}