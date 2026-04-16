import { KailhSwitch } from "../components/KailhSwitch";

/**
 * KeySwitchesModule - 独立按键模块
 *
 * Encapsulates:
 * - 2个独立机械开关（Kailh CPG151101D213）
 * - 标准键间距 19.05mm，居中对齐
 *
 * ═══════════════════════════════════════════════════════════════
 * 对外接口信号 (EXPORTED SIGNALS)
 * ═══════════════════════════════════════════════════════════════
 * 按键引脚（需要外部连接）：
 *   • ${name}_MODE.pin1  → Mode 按键信号端 (连接到 ESP32 GPIO4)
 *   • ${name}_MODE.pin2  → Mode 按键接地端 (连接到 GND)
 *   • ${name}_ENTER.pin1 → Enter 按键信号端 (连接到 ESP32 GPIO6)
 *   • ${name}_ENTER.pin2 → Enter 按键接地端 (连接到 GND)
 *
 * ═══════════════════════════════════════════════════════════════
 * Props:
 * - name: 组件名称前缀 (默认: "KEY")
 * - pcbX, pcbY: PCB位置
 * - schX, schY: 原理图位置
 */
export const KeySwitchesModule = (props: {
  /** 组件名称前缀 (默认: "KEY") */
  name?: string;
  /** PCB X坐标 (默认: 0) */
  pcbX?: number;
  /** PCB Y坐标 (默认: 0) */
  pcbY?: number;
  /** 原理图 X坐标 (默认: 0) */
  schX?: number;
  /** 原理图 Y坐标 (默认: 0) */
  schY?: number;
}) => {
  const {
    name = "KEY",
    pcbX = 0,
    pcbY = 0,
    schX = 0,
    schY = 0,
  } = props;

  return (
    <group
      name={name}
      pcbX={pcbX}
      pcbY={pcbY}
      schX={schX}
      schY={schY}
    >
      {/* ========== 独立按键 ========== */}
      {/* 标准键间距 19.05mm，按键居中对齐 */}
      <KailhSwitch name={`${name}_MODE`} pcbX={-9.525} pcbY={0} />
      <KailhSwitch name={`${name}_ENTER`} pcbX={9.525} pcbY={0} />

      {/* 注意: 模块间连线在 index.circuit.tsx 中实现 */}
    </group>
  );
};

export type KeySwitchesModuleProps = {
  name?: string;
  pcbX?: number;
  pcbY?: number;
  schX?: number;
  schY?: number;
};
