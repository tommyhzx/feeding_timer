import { ESP32S3Zero } from "../components/ESP32S3Zero";

/**
 * ESP32S3ZeroModule - ESP32-S3-Zero 模组模块
 *
 * 封装 Waveshare ESP32-S3-Zero 模组，该模组具有：
 * - 内置 ME6217C33M5G LDO (5V → 3.3V)
 * - USB Type-C 接口（原生 USB，无需外部 USB 转串口芯片）
 * - 板载 WS2812 RGB LED (GPIO21)
 * - 陶瓷天线
 *
 * 与 ESP32Module 相比，此模块更简单，因为不需要外部电源或 USB 电路。
 *
 * ═══════════════════════════════════════════════════════════════
 * 对外输出信号 (EXPORTED SIGNALS)
 * ═══════════════════════════════════════════════════════════════
 * 输入信号：
 *   • 5V_IN    → 5V 电源输入（可通过 USB-C 或外部 5V 供电）
 *
 * 输出信号：
 *   • ESP32_3V3      → 3.3V 电源输出（供外部组件使用）
 *   • ESP32_TX/RX    → UART0 (GPIO43/44) 用于调试/编程
 *   • ESP32_GPIO6-13 → 8 个 GPIO 用于键盘矩阵
 *   • ESP32_RGB_LED  → GPIO21 用于板载 WS2812 RGB LED
 *   • GND            → 地参考
 *
 * ═══════════════════════════════════════════════════════════════
 * 使用示例：
 * ═══════════════════════════════════════════════════════════════
 * ```tsx
 * <ESP32S3ZeroModule
 *   name="MCU"
 *   pcbX={0}
 *   pcbY={0}
 * />
 *
 * // 连接键盘矩阵
 * <trace from="net.ESP32_GPIO6" to="net.ROW0" />
 * <trace from="net.ESP32_GPIO7" to="net.ROW1" />
 * // ...
 *
 * // 控制 RGB LED
 * <trace from="net.ESP32_RGB_LED" to="rgb_driver.data" />
 * ```
 *
 * ═══════════════════════════════════════════════════════════════
 * Props:
 * - name: 组件名称前缀 (默认: "MCU")
 * - pcbX, pcbY: PCB位置
 * - schX, schY: 原理图位置
 */
export const ESP32S3ZeroModule = (props: {
  /** 组件名称前缀 (默认: "MCU") */
  name?: string;
  /** PCB X坐标 (默认: 0) */
  pcbX?: number;
  /** PCB Y坐标 (默认: 0) */
  pcbY?: number;
  /** PCB 旋转角度 (默认: 无) */
  pcbRotation?: string;
  /** 原理图 X坐标 (默认: 0) */
  schX?: number;
  /** 原理图 Y坐标 (默认: 0) */
  schY?: number;
}) => {
  const {
    name = "MCU",
    pcbX = 0,
    pcbY = 0,
    pcbRotation,
    schX = 0,
    schY = 0,
  } = props;

  return (
    <group
      name={name}
      pcbFlex
      pcbFlexGap="1mm"
      pcbX={pcbX}
      pcbY={pcbY}
      pcbRotation={pcbRotation}
      schX={schX}
      schY={schY}
    >
      {/* ========== 组件放置 ========== */}

      {/* ESP32-S3-Zero 模组 */}
      <ESP32S3Zero
        name={`${name}_ESP32`}
      />

      {/* ========== 内部走线 ========== */}

      {/* ===== 电源连接 ===== */}
      {/* 5V 输入 */}
      <trace from={`${name}_ESP32.pin1`} to="net.ESP32_5V_IN" />

      {/* GND */}
      <trace from={`${name}_ESP32.pin2`} to="net.GND" />

      {/* 3.3V 输出 */}
      <trace from={`${name}_ESP32.pin3`} to="net.ESP32_3V3" />

      {/* ========== 对外接口信号 (EXPORTED SIGNALS) ========== */}

      {/* ===== 通用 GPIO (pin4-pin9) ===== */}
      <trace from={`${name}_ESP32.pin4`} to="net.ESP32_GPIO1" />
      <trace from={`${name}_ESP32.pin5`} to="net.ESP32_GPIO2" />
      <trace from={`${name}_ESP32.pin6`} to="net.ESP32_GPIO3" />
      <trace from={`${name}_ESP32.pin7`} to="net.ESP32_GPIO4" />
      <trace from={`${name}_ESP32.pin8`} to="net.ESP32_GPIO5" />
      <trace from={`${name}_ESP32.pin9`} to="net.ESP32_GPIO6" />

      {/* ===== UART0 (用于调试/编程) ===== */}
      <trace from={`${name}_ESP32.pin10`} to="net.ESP32_TX" />
      <trace from={`${name}_ESP32.pin11`} to="net.ESP32_RX" />

      {/* ===== 键盘矩阵 GPIO (pin12-pin18) ===== */}
      <trace from={`${name}_ESP32.pin12`} to="net.ESP32_GPIO13" />
      <trace from={`${name}_ESP32.pin13`} to="net.ESP32_GPIO12" />
      <trace from={`${name}_ESP32.pin14`} to="net.ESP32_GPIO11" />
      <trace from={`${name}_ESP32.pin15`} to="net.ESP32_GPIO10" />
      <trace from={`${name}_ESP32.pin16`} to="net.ESP32_GPIO9" />
      <trace from={`${name}_ESP32.pin17`} to="net.ESP32_GPIO8" />
      <trace from={`${name}_ESP32.pin18`} to="net.ESP32_GPIO7" />
    </group>
  );
};

export type ESP32S3ZeroModuleProps = {
  name?: string;
  pcbX?: number;
  pcbY?: number;
  pcbRotation?: string;
  schX?: number;
  schY?: number;
};
