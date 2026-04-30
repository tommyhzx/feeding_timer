import { ESP32S3WROOM1N16R8 } from "../components/ESP32S3WROOM1N16R8";

/**
 * ESP32S3WROOM16R8Module - ESP32-S3-WROOM-1-N16R8 最小系统模块
 *
 * Encapsulates:
 * - ESP32-S3-WROOM-1-N16R8 module (44pin, 22x2)
 *
 * ═══════════════════════════════════════════════════════════════
 * 对外接口信号 (EXPORTED SIGNALS)
 * ═══════════════════════════════════════════════════════════════
 * 电源信号：
 *   • net.ESP32_5V   → 5V电源输入 (内部已连接到 ESP32 pin21)
 *   • net.ESP32_3V3  → 3.3V电源 (内部已连接到 ESP32 pin1, pin2)
 *   • net.GND        → 公共地 (内部已连接到 ESP32 GND引脚)
 *
 * GPIO引脚（可用于外部连接）：
 *   • ${name}_ESP32.pin4  → GPIO4 (Mode 按键)
 *   • ${name}_ESP32.pin6  → GPIO6 (Enter 按键)
 *
 * ═══════════════════════════════════════════════════════════════
 * Props:
 * - name: 组件名称前缀 (默认: "MCU")
 * - pcbX, pcbY: PCB位置
 * - pcbRotation: PCB旋转角度 (默认: "0deg")
 * - schX, schY: 原理图位置
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
  /** PCB 层 (默认: "top") */
  layer?: "top" | "bottom";
}) => {
  const {
    name = "MCU",
    pcbX = 0,
    pcbY = 0,
    pcbRotation = "0deg",
    schX = 0,
    schY = 0,
    layer = "top",
  } = props;

  return (
    <group
      // pcbPack
      // pcbGap="1mm"
      name={name}
      pcbX={pcbX}
      pcbY={pcbY}
      schX={schX}
      schY={schY}
      pcbRotation={pcbRotation} 
    >
      {/* ========== 组件放置 ========== */}

      {/* ESP32-S3-WROOM-1-N16R8 模块 */}
      <ESP32S3WROOM1N16R8
        name={`${name}_ESP32`}
        pcbX={0}
        pcbY={0}
        layer={layer}
        connections={{
          // 5V 电源输入 (唯一引脚，可用标签名)
          pin21: "net.ESP32_5V",

          // 3.3V 电源输入 (两个引脚，需明确指定)
          pin1: "net.ESP32_3V3",
          pin2: "net.ESP32_3V3",

          // GND 引脚 (四个引脚，需明确指定)
          pin22: "net.GND",
          pin23: "net.GND",
          pin43: "net.GND",
          pin44: "net.GND",
        }}
      />

      {/* 注意: GPIO4 (pin4) 和 GPIO6 (pin6) 引脚已预留，可在 index.circuit.tsx 中连接外部设备 */}
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
};