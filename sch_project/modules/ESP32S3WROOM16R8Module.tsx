import { ESP32S3WROOM1N16R8 } from "../components/ESP32S3WROOM1N16R8";

/**
 * ESP32S3WROOM16R8Module - ESP32-S3-WROOM-1-N16R8 最小系统模块
 *
 * Encapsulates:
 * - ESP32-S3-WROOM-1-N16R8 module (44pin, 22x2)
 * - Startup circuit (RST pull-up 10kΩ, GPIO0 pull-down 10kΩ)
 *
 * ═══════════════════════════════════════════════════════════════
 * 对外输出信号 (EXPORTED SIGNALS)
 * ═══════════════════════════════════════════════════════════════
 * 输入信号：
 *   • PWR_3V3    → 3.3V电源输入
 *   • ROW0       → 行0 (GPIO4)
 *   • ROW1       → 行1 (GPIO5)
 *   • COL0       → 列0 (GPIO6)
 *   • COL1       → 列1 (GPIO7)
 *   • COL2       → 列2 (GPIO8)
 *
 * 输出信号：
 *   • ROW0       → 连接到外部键盘矩阵行
 *   • ROW1       → 连接到外部键盘矩阵行
 *   • COL0-COL2  → 连接到外部键盘矩阵列
 *
 * ═══════════════════════════════════════════════════════════════
 * Props:
 * - name: 组件名称前缀 (默认: "MCU")
 * - pcbX, pcbY: PCB位置
 * - schX, schY: 原理图位置
 * - rowPins: 行信号网络 (e.g., ["net.ROW0", "net.ROW1"])
 * - colPins: 列信号网络 (e.g., ["net.COL0", "net.COL1", "net.COL2"])
 */
export const ESP32S3WROOM16R8Module = (props: {
  /** 组件名称前缀 (默认: "MCU") */
  name?: string;
  /** PCB X坐标 (默认: 0) */
  pcbX?: number;
  /** PCB Y坐标 (默认: 0) */
  pcbY?: number;
  /** PCB 旋转角度 (默认: "0deg") */
  pcbRotation?: string;
  /** 原理图 X坐标 (默认: 0) */
  schX?: number;
  /** 原理图 Y坐标 (默认: 0) */
  schY?: number;
  /** 行信号网络 (e.g., ["net.ROW0", "net.ROW1"]) */
  rowPins: string[];
  /** 列信号网络 (e.g., ["net.COL0", "net.COL1", "net.COL2"]) */
  colPins: string[];
}) => {
  const {
    name = "MCU",
    pcbX = 0,
    pcbY = 0,
    pcbRotation = "0deg",
    schX = 0,
    schY = 0,
    rowPins,
    colPins,
  } = props;

  return (
    <group
      pcbPack
      pcbGap="1mm"
      name={name}
      pcbX={pcbX}
      pcbY={pcbY}
      schX={schX}
      schY={schY}
      pcbRotation={pcbRotation} 
    >
      {/* ========== 组件放置 ========== */}

      {/* ESP32-S3-WROOM-1-N16R8 模块 */}
      <ESP32S3WROOM1N16R8 name={`${name}_ESP32`} 
      pcbX={0} 
      pcbY={0} 
      />

      {/* RST 上拉电阻 10kΩ */}
      <resistor
        name={`${name}_R_RST`}
        resistance="10kΩ"
        footprint="0603"
        pcbX={-18} 
        pcbY={20} 
      />

      {/* GPIO0 下拉电阻 10kΩ (正常启动) */}
      <resistor
        name={`${name}_R_BOOT`}
        resistance="10kΩ"
        footprint="0603"
        pcbX={18}
        pcbY={-6.35}
      />

      {/* ========== 内部走线 ========== */}

      {/* ===== 电源连接 ===== */}
      {/* 3.3V电源输入 → 对外接口 */}
      <trace from={`${name}_ESP32.pin1`} to="net.ESP32_3V3" />
      <trace from={`${name}_ESP32.pin2`} to="net.ESP32_3V3" />

      {/* 所有GND引脚连接到公共地 */}
      <trace from={`${name}_ESP32.pin22`} to="net.GND" />
      <trace from={`${name}_ESP32.pin23`} to="net.GND" />
      <trace from={`${name}_ESP32.pin43`} to="net.GND" />
      <trace from={`${name}_ESP32.pin44`} to="net.GND" />

      {/* ===== 启动电路 ===== */}
      {/* RST 上拉到 3.3V */}
      <trace from={`${name}_R_RST.pin1`} to="net.ESP32_3V3" />
      <trace from={`${name}_R_RST.pin2`} to={`${name}_ESP32.pin3`} />

      {/* GPIO0 下拉到地 */}
      <trace from={`${name}_R_BOOT.pin1`} to={`${name}_ESP32.pin36`} />
      <trace from={`${name}_R_BOOT.pin2`} to="net.GND" />

      {/* ========== 对外接口信号 (EXPORTED SIGNALS) ========== */}

      {/* ===== 键盘矩阵 ROW 接口 (GPIO4, GPIO5) ===== */}
      <trace from={`${name}_ESP32.pin4`} to={rowPins[0]} />
      <trace from={`${name}_ESP32.pin5`} to={rowPins[1]} />

      {/* ===== 键盘矩阵 COL 接口 (GPIO6, GPIO7, GPIO8) ===== */}
      <trace from={`${name}_ESP32.pin6`} to={colPins[0]} />
      <trace from={`${name}_ESP32.pin7`} to={colPins[1]} />
      <trace from={`${name}_ESP32.pin12`} to={colPins[2]} />
    </group>
  );
};

export type ESP32S3WROOM16R8ModuleProps = {
  name?: string;
  pcbX?: number;
  pcbY?: number;
  pcbRotation?: string;
  schX?: number;
  schY?: number;
  rowPins: string[];
  colPins: string[];
};