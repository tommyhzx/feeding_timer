import { type KLELayout } from "../components/types";
import { parseKLELayout } from "../components/parseKLELayout";
import { KailhSwitch } from "../components/KailhSwitch";
import { Diode } from "../components/Diode";

export interface KeyMatrixProps {
  layout: KLELayout;
  rowToMicroPin: string[];
  colToMicroPin: string[];
  pcbX?: number;
  pcbY?: number;
  schX?: number;
  schY?: number;
  name?: string;
}

/**
 * KeyMatrix - A matrix of keyboard switches with diodes for scanning
 *
 * @param layout - KLE (Keyboard Layout Editor) JSON format layout
 * @param rowToMicroPin - Array of net names for each row (e.g., ["net.ROW0", "net.ROW1"])
 * @param colToMicroPin - Array of net names for each column (e.g., ["net.COL0", "net.COL1"])
 * @param pcbX - X position on PCB
 * @param pcbY - Y position on PCB
 * @param name - Name prefix for the matrix
 *
 * Example circuit:
 *   net.ROW0 ──┬── D1.pin2 ── D1.pin1 ── K1.pin1
 *   net.ROW1 ──┴── D2.pin2 ── D2.pin1 ── K2.pin1
 *                      K1.pin2 ── net.COL0
 *                      K2.pin2 ── net.COL1
 *
 * Note: Diode pin1 (anode) connects to key, pin2 (cathode) connects to row net.
 * This prevents ghosting by ensuring current flows only one direction.
 */
export const KeyMatrix = ({
  layout,
  rowToMicroPin,
  colToMicroPin,
  pcbX = 0,
  pcbY = 0,
  schX = 0,
  schY = 0,
  name = "KB",
}: KeyMatrixProps) => {
  const keys = parseKLELayout(layout);

  // 计算边界和中心点
  const minX = Math.min(...keys.map((k) => k.x));
  const maxX = Math.max(...keys.map((k) => k.x + k.width));
  const minY = Math.min(...keys.map((k) => k.y));
  const maxY = Math.max(...keys.map((k) => k.y + k.height));
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return (
    <group pcbX={pcbX} pcbY={pcbY} schX={schX} schY={schY}>
      {keys.map((key) => {
        // PCB 位置（相对于键盘中心）
        const relX = key.x - centerX;
        const relY = key.y - centerY;
        // 原理图位置（网格系统）
        const schRelX = key.col * 3;
        const schRelY = key.row * -4;

        return (
          <group
          key={key.name} pcbX={relX} pcbY={relY} schX={schRelX} schY={schRelY}>
            {/* 键盘开关 */}
            <KailhSwitch name={key.name} />

            {/* 二极管 - 仅当该行有对应的 MCU 引脚时才添加 */}
            {rowToMicroPin[key.row] !== undefined && (
              <Diode
                name={`${key.name}_D`}
                pcbX={0}
                pcbY={-9}
                schX={0}
                schY={-1}
              />
            )}

            {/* 走线：按键 pin1 → 二极管 pin1 */}
            {rowToMicroPin[key.row] !== undefined && (
              <trace
                from={`.${key.name} > .pin1`}
                to={`.${key.name}_D > .pin1`}
              />
            )}

            {/* 走线：二极管 pin2 → 行网络 */}
            {rowToMicroPin[key.row] !== undefined && (
              <trace
                from={`.${key.name}_D > .pin2`}
                to={rowToMicroPin[key.row]}
              />
            )}

            {/* 走线：按键 pin2 → 列网络 */}
            {colToMicroPin[key.col] !== undefined && (
              <trace
                from={`.${key.name} > .pin2`}
                to={colToMicroPin[key.col]}
              />
            )}
          </group>
        );
      })}
    </group>
  );
};
