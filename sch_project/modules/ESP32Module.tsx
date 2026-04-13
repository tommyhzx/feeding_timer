import { ESP32S3WROOM } from "../components/ESP32S3WROOM";

/**
 * ESP32Module - ESP32-S3-WROOM-1 最小系统模块
 *
 * Encapsulates:
 * - ESP32-S3-WROOM-1-N4R2 module (40pin, 20x2)
 * - Startup circuit (EN pull-up 10kΩ, GPIO0 pull-down 10kΩ)
 *
 * ═══════════════════════════════════════════════════════════════
 * 对外输出信号 (EXPORTED SIGNALS)
 * ═══════════════════════════════════════════════════════════════
 * 输入信号：
 *   • PWR_3V3    → 3.3V电源输入
 *   • USB_DP    → USB D+ 数据线 (连接到GPIO19)
 *   • USB_DM    → USB D- 数据线 (连接到GPIO20)
 *
 * 输出信号：
 *   • I2C_SDA   → I2C数据线 (GPIO1)
 *   • I2C_SCL   → I2C时钟线 (GPIO2)
 *   • GPIO6-9   → 通用GPIO (可用于键盘矩阵等)
 *
 * ═══════════════════════════════════════════════════════════════
 * Props:
 * - name: 组件名称前缀 (默认: "MCU")
 * - pcbX, pcbY: PCB位置
 * - schX, schY: 原理图位置
 */
export const ESP32Module = (props: {
  /** 组件名称前缀 (默认: "MCU") */
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
    name = "MCU",
    pcbX = 0,
    pcbY = 0,
    schX = 0,
    schY = 0,
  } = props;

  return (
    <group
      pcbFlex pcbFlexGap="1mm"
      name={name}
      pcbX={pcbX}
      pcbY={pcbY}
      schX={schX}
      schY={schY}
    >
      {/* ========== 组件放置 ========== */}

      {/* ESP32-S3-WROOM-1 模块 */}
      <ESP32S3WROOM
        name={`${name}_ESP32`}
      />

      {/* EN 上拉电阻 10kΩ */}
      <resistor
        name={`${name}_R_EN`}
        resistance="10kΩ"
        footprint="0603"
      />

      {/* GPIO0 下拉电阻 10kΩ (正常启动) */}
      <resistor
        name={`${name}_R_BOOT`}
        resistance="10kΩ"
        footprint="0603"
      />

      {/* ========== 内部走线 ========== */}

      {/* ===== 电源连接 ===== */}
      {/* 3.3V电源输入 → 对外接口 */}
      <trace from={`${name}_ESP32.3V3`} to="net.ESP32_3V3" />

      {/* 所有GND引脚连接到公共地 */}
      <trace from={`${name}_ESP32.GND`} to="net.GND" />
      <trace from={`${name}_ESP32.pin25`} to="net.GND" />
      <trace from={`${name}_ESP32.pin34`} to="net.GND" />
      <trace from={`${name}_ESP32.pin40`} to="net.GND" />

      {/* ===== 启动电路 ===== */}
      {/* EN 上拉到 3.3V */}
      <trace from={`${name}_R_EN.pin1`} to="net.ESP32_3V3" />
      <trace from={`${name}_R_EN.pin2`} to={`${name}_ESP32.EN`} />

      {/* GPIO0 下拉到地 */}
      <trace from={`${name}_R_BOOT.pin1`} to={`${name}_ESP32.BOOT_GPIO0`} />
      <trace from={`${name}_R_BOOT.pin2`} to="net.GND" />

      {/* ========== 对外接口信号 (EXPORTED SIGNALS) ========== */}

      {/* ===== USB接口 (GPIO19/20) ===== */}
      <trace from={`${name}_ESP32.GPIO19`} to="net.ESP32_USB_DP" />
      <trace from={`${name}_ESP32.GPIO20`} to="net.ESP32_USB_DM" />

      {/* ===== I2C接口 (GPIO1/2) ===== */}
      <trace from={`${name}_ESP32.I2C_SDA`} to="net.ESP32_I2C_SDA" />
      <trace from={`${name}_ESP32.I2C_SCL`} to="net.ESP32_I2C_SCL" />

      {/* ===== GPIO通用接口 ===== */}
      <trace from={`${name}_ESP32.GPIO6`} to="net.ESP32_GPIO6" />
      <trace from={`${name}_ESP32.GPIO7`} to="net.ESP32_GPIO7" />
      <trace from={`${name}_ESP32.GPIO15`} to="net.ESP32_GPIO8" />
      <trace from={`${name}_ESP32.GPIO16`} to="net.ESP32_GPIO9" />
    </group>
  );
};

export type ESP32ModuleProps = {
  name?: string;
  pcbX?: number;
  pcbY?: number;
  schX?: number;
  schY?: number;
};

