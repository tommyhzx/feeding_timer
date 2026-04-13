import { USBConnector } from "../components/USBConnector";
import { TPS7333 } from "../components/TPS7333";
import { USBLC6 } from "../components/USBLC6";

/**
 * PowerModule - USB-C power input with ESD protection and LDO regulation
 *
 * Encapsulates:
 * - USB-C connector (VBUS input)
 * - TPS7333 LDO (5V → 3.3V)
 * - USBLC6 ESD protection
 * - Input/output capacitors (4.7µF)
 * - USB series resistors (22Ω)
 *
 * ═══════════════════════════════════════════════════════════════
 * 对外输出信号 (EXPORTED SIGNALS)
 * ═══════════════════════════════════════════════════════════════
 * 输出到其他模块的信号：
 *   • PWR_3V3     → 3.3V 稳压电源输出（供 MCU 使用）
 *   • PWR_USB_DP  → USB D+ 数据线（经 22Ω 电阻 + ESD 保护）
 *   • PWR_USB_DM  → USB D- 数据线（经 22Ω 电阻 + ESD 保护）
 *
 * 使用示例：
 *   import { POWER_MODULE_PORTS } from "./modules/PowerModule"
 *   <trace from={POWER_MODULE_PORTS.PWR_3V3} to="ESP32.3V3" />
 * ═══════════════════════════════════════════════════════════════
 *
 *
 * Props:
 * - name: component name prefix
 * - pcbX, pcbY: PCB position
 * - schX, schY: schematic position
 */
export const PowerModule = (props: {
  name?: string;
  pcbX?: number;
  pcbY?: number;
  schX?: number;
  schY?: number;
}) => {
  const {
    name = "PWR",
    pcbX = 0,
    pcbY = 0,
    schX = 0,
    schY = 0,
  } = props;

  return (
    <group
      name={name}
      pcbFlex pcbFlexGap="1mm"
      pcbX={pcbX}
      pcbY={pcbY}
      schX={schX}
      schY={schY}
    >
      {/* USB-C Connector */}
      <USBConnector
        name={`${name}_USB`}
      />

      {/* TPS7333 LDO - 20mm to the right of USB */}
      <TPS7333
        name={`${name}_LDO`}
      />

      {/* USBLC6 ESD Protection - below LDO */}
      <USBLC6
        name={`${name}_ESD`}
      />

      {/* Input Capacitor 4.7µF - near LDO input */}
      <capacitor
        name={`${name}_C_IN`}
        capacitance="4.7µF"
        footprint="0603"
      />

      {/* Output Capacitor 4.7µF - near LDO output */}
      <capacitor
        name={`${name}_C_OUT`}
        capacitance="4.7µF"
        footprint="0603"
      />

      {/* USB DP Series Resistor 22Ω */}
      <resistor
        name={`${name}_R_DP`}
        resistance="22Ω"
        footprint="0603"
      />

      {/* USB DM Series Resistor 22Ω */}
      <resistor
        name={`${name}_R_DM`}
        resistance="22Ω"
        footprint="0603"
      />

      {/* ========== Internal Traces ========== */}

      {/* USB 5V input network - use net.USB_5V to get short label */}
      <trace from={`${name}_USB.VBUS`} to="net.USB_5V" />
      <trace from={`${name}_USB.VBUS2`} to="net.USB_5V" />
      <trace from="net.USB_5V" to={`${name}_LDO.IN`} />
      <trace from="net.USB_5V" to={`${name}_C_IN.pin1`} />
      <trace from="net.USB_5V" to={`${name}_LDO.EN`} />
      <trace from="net.USB_5V" to={`${name}_ESD.VBUS`} />
      <trace from={`${name}_C_IN.pin2`} to="net.GND" />

      {/* USB GND connections (both GND pins) */}
      <trace from={`${name}_USB.GND`} to="net.GND" />
      <trace from={`${name}_USB.GND2`} to="net.GND" />

      {/* ========== 对外接口信号 (EXPORTED SIGNALS) ========== */}

      {/* LDO Output → 3.3V (供 MCU、外设使用) */}
      <trace from={`${name}_LDO.OUT`} to="net.PWR_3V3" />

      {/* LDO Output Capacitor */}
      <trace from={`${name}_LDO.OUT`} to={`${name}_C_OUT.pin1`} />
      <trace from={`${name}_C_OUT.pin2`} to="net.GND" />

      {/* LDO Ground */}
      <trace from={`${name}_LDO.GND`} to="net.GND" />
      <trace from={`${name}_LDO.GND_THERMAL`} to="net.GND" />

      {/* USB Data Lines → Series Resistors → ESD → External */}
      {/* USB DP → 经 22Ω 电阻 + ESD 保护 → 输出到 MCU */}
      <trace from={`${name}_USB.DP`} to={`${name}_R_DP.pin1`} />
      <trace from={`${name}_R_DP.pin2`} to={`${name}_ESD.DP`} />
      <trace from={`${name}_ESD.DP`} to="net.PWR_USB_DP" />

      {/* USB DM → 经 22Ω 电阻 + ESD 保护 → 输出到 MCU */}
      <trace from={`${name}_USB.DM`} to={`${name}_R_DM.pin1`} />
      <trace from={`${name}_R_DM.pin2`} to={`${name}_ESD.DM`} />
      <trace from={`${name}_ESD.DM`} to="net.PWR_USB_DM" />

      {/* ESD GND */}
      <trace from={`${name}_ESD.GND`} to="net.GND" />
    </group>
  );
};

export type PowerModuleProps = {
  name?: string;
  pcbX?: number;
  pcbY?: number;
  schX?: number;
  schY?: number;
};