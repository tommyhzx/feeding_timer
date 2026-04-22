import { USBConnector } from "../components/USBConnector";
import { TPS7333 } from "../components/TPS7333";
import { USBLC6 } from "../components/USBLC6";
import { TP4056 } from "../components/TP4056";
import { ME2108 } from "../components/ME2108";
import { BatteryConnector } from "../components/BatteryConnector";

/**
 * PowerModule - USB-C power with battery charging and management
 *
 * ═══════════════════════════════════════════════════════════════
 * 电路架构
 * ═══════════════════════════════════════════════════════════════
 *
 * USB 5V ──→ TP4056 ──→ 锂电池 ──→ ME2108升压 ──→ TPS7333 ──→ 3.3V
 *              │              │
 *          充电指示      电池接口
 *
 * 功能说明：
 * 1. TP4056: 锂电池充电管理 (500mA充电电流)
 * 2. ME2108: 3.7V → 5V升压转换器
 * 3. TPS7333: 5V → 3.3V LDO稳压
 * 4. 支持边充边用 (USB输入时同时供电和充电)
 *
 * ═══════════════════════════════════════════════════════════════
 * 对外输出信号 (EXPORTED SIGNALS)
 * ═══════════════════════════════════════════════════════════════
 * 输出到其他模块的信号：
 *   • PWR_3V3     → 3.3V 稳压电源输出（供 MCU 使用）
 *   • PWR_USB_DP  → USB D+ 数据线（经 22Ω 电阻 + ESD 保护）
 *   • PWR_USB_DM  → USB D- 数据线（经 22Ω 电阻 + ESD 保护）
 *   • BAT_VOLTAGE → 电池电压检测（分压后，供ADC监测）
 *
 * 使用示例：
 *   import { POWER_MODULE_PORTS } from "./modules/PowerModule"
 *   <trace from={POWER_MODULE_PORTS.PWR_3V3} to="ESP32.3V3" />
 * ═══════════════════════════════════════════════════════════════
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
      {/* ==================== USB输入部分 ==================== */}
      {/* USB-C Connector */}
      <USBConnector
        name={`${name}_USB`}
      />

      {/* USBLC6 ESD Protection */}
      <USBLC6
        name={`${name}_ESD`}
      />

      {/* ==================== 充电管理部分 ==================== */}
      {/* TP4056 锂电充电IC */}
      <TP4056
        name={`${name}_CHG`}
      />

      {/* 充电电流设置电阻 R_PROG = 2kΩ → 500mA */}
      <resistor
        name={`${name}_R_PROG`}
        resistance="2kΩ"
        footprint="0603"
      />

      {/* 充电指示LED (STAT引脚，开漏输出) */}
      <led
        name={`${name}_LED_CHG`}
        color="red"
        footprint="0603"
      />
      <resistor
        name={`${name}_R_LED_CHG`}
        resistance="1kΩ"
        footprint="0603"
      />

      {/* TP4056输入电容 */}
      <capacitor
        name={`${name}_C_CHG_IN`}
        capacitance="10µF"
        footprint="0603"
      />

      {/* ==================== 电池部分 ==================== */}
      {/* 电池连接器 (放在PCB边缘) */}
      <BatteryConnector
        name={`${name}_BAT`}
      />

      {/* 电池电压检测分压电阻 (200k + 100k = 1/3分压) */}
      <resistor
        name={`${name}_R_VOLT1`}
        resistance="200kΩ"
        footprint="0603"
      />
      <resistor
        name={`${name}_R_VOLT2`}
        resistance="100kΩ"
        footprint="0603"
      />

      {/* ==================== 升压部分 ==================== */}
      {/* ME2108 升压转换器 */}
      <ME2108
        name={`${name}_BOOST`}
      />

      {/* 升压电感 4.7µH */}
      <inductor
        name={`${name}_L_BOOST`}
        inductance="4.7µH"
        footprint="0603"
      />

      {/* ME2108输出电容 */}
      <capacitor
        name={`${name}_C_BOOST_OUT`}
        capacitance="10µF"
        footprint="0603"
      />

      {/* ==================== 隔离二极管 (电源OR-ing) ==================== */}
      {/* USB 5V 隔离二极管 - 防止升压5V倒灌到USB */}
      <diode
        name={`${name}_D_USB`}
        footprint="sod123"
      />
      {/* 升压5V 隔离二极管 - 防止USB 5V倒灌到升压电路 */}
      <diode
        name={`${name}_D_BOOST`}
        footprint="sod123"
      />

      {/* ==================== 原有LDO部分 ==================== */}
      {/* TPS7333 LDO */}
      <TPS7333
        name={`${name}_LDO`}
      />

      {/* LDO输入电容 */}
      <capacitor
        name={`${name}_C_IN`}
        capacitance="4.7µF"
        footprint="0603"
      />

      {/* LDO输出电容 */}
      <capacitor
        name={`${name}_C_OUT`}
        capacitance="4.7µF"
        footprint="0603"
      />

      {/* ==================== USB数据线部分 ==================== */}
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

      {/* ==================== 内部走线 ==================== */}

      {/* ========== USB 5V输入网络 ========== */}
      <trace from={`${name}_USB.VBUS`} to="net.USB_5V" />
      <trace from={`${name}_USB.VBUS2`} to="net.USB_5V" />
      <trace from="net.USB_5V" to={`${name}_ESD.VBUS`} />

      {/* USB GND */}
      <trace from={`${name}_USB.GND`} to="net.GND" />
      <trace from={`${name}_USB.GND2`} to="net.GND" />

      {/* ========== 充电电路 ========== */}
      {/* USB 5V → TP4056 VCC */}
      <trace from="net.USB_5V" to={`${name}_C_CHG_IN.pin1`} />
      <trace from="net.USB_5V" to={`${name}_CHG.VCC`} />

      {/* TP4056 GND */}
      <trace from={`${name}_C_CHG_IN.pin2`} to="net.GND" />
      <trace from={`${name}_CHG.GND`} to="net.GND" />

      {/* 充电电流编程电阻 */}
      <trace from={`${name}_CHG.PROG`} to={`${name}_R_PROG.pin1`} />
      <trace from={`${name}_R_PROG.pin2`} to="net.GND" />

      {/* 充电指示LED (STAT引脚开漏，LED接VCC) */}
      <trace from={`${name}_CHG.STAT`} to={`${name}_R_LED_CHG.pin1`} />
      <trace from={`${name}_R_LED_CHG.pin2`} to={`${name}_LED_CHG.cathode`} />
      <trace from={`${name}_LED_CHG.anode`} to="net.USB_5V" />

      {/* ========== 电池连接 ========== */}
      {/* TP4056 BAT ↔ 电池正极 */}
      <trace from={`${name}_CHG.BAT`} to="net.BAT_PLUS" />
      <trace from={`net.BAT_PLUS`} to={`${name}_BAT.pin1`} />

      {/* 电池负极 → GND */}
      <trace from={`${name}_BAT.pin2`} to="net.GND" />

      {/* ========== 电池电压检测 ========== */}
      {/* 电池正极 → 分压电阻 → BAT_VOLTAGE输出 */}
      <trace from={`net.BAT_PLUS`} to={`${name}_R_VOLT1.pin1`} />
      <trace from={`${name}_R_VOLT1.pin2`} to="net.BAT_VOLTAGE" />
      <trace from={`net.BAT_VOLTAGE`} to={`${name}_R_VOLT2.pin1`} />
      <trace from={`${name}_R_VOLT2.pin2`} to="net.GND" />

      {/* ========== 升压电路 ========== */}
      {/* ME2108C50:
          Pin 1 (GND) → 接地
          Pin 2 (VOUT) → 输出5V到BOOST_5V网络
          Pin 3 (CE) → 使能控制，接VIN=常开
          Pin 4 (LX) → 开关输出，接电感
          Pin 5 (NC) → 悬空
      */}
      {/* 电池正极 → ME2108 CE (使能) 和 VIN输入 */}
      <trace from={`net.BAT_PLUS`} to={`${name}_BOOST.CE`} />

      {/* ME2108 GND */}
      <trace from={`${name}_BOOST.GND`} to="net.GND" />

      {/* ME2108 LX ↔ 电感 ↔ VOUT (升压拓扑) */}
      <trace from={`${name}_BOOST.LX`} to={`${name}_L_BOOST.pin1`} />
      <trace from={`${name}_L_BOOST.pin2`} to="net.BOOST_5V" />
      <trace from={`net.BOOST_5V`} to={`${name}_BOOST.VOUT`} />

      {/* 升压输出电容 */}
      <trace from={`net.BOOST_5V`} to={`${name}_C_BOOST_OUT.pin1`} />
      <trace from={`${name}_C_BOOST_OUT.pin2`} to="net.GND" />

      {/* ========== LDO电路 ========== */}
      {/* 电源隔离二极管电路 (OR-ing configuration)
          USB 5V → D_USB → LDO_5V ─┐
          升压5V → D_BOOST → LDO_5V ─┼→ TPS7333 → 3.3V
                                    │
                              肖特基二极管压降约0.3V
      */}
      <trace from={`net.USB_5V`} to={`${name}_D_USB.anode`} />
      <trace from={`${name}_D_USB.cathode`} to="net.LDO_5V" />

      <trace from={`net.BOOST_5V`} to={`${name}_D_BOOST.anode`} />
      <trace from={`${name}_D_BOOST.cathode`} to="net.LDO_5V" />

      <trace from={`net.LDO_5V`} to={`${name}_C_IN.pin1`} />
      <trace from={`net.LDO_5V`} to={`${name}_LDO.IN`} />
      <trace from={`net.LDO_5V`} to={`${name}_LDO.EN`} />

      {/* LDO电容 */}
      <trace from={`${name}_C_IN.pin2`} to="net.GND" />
      <trace from={`${name}_LDO.OUT`} to={`${name}_C_OUT.pin1`} />
      <trace from={`${name}_C_OUT.pin2`} to="net.GND" />

      {/* LDO GND */}
      <trace from={`${name}_LDO.GND`} to="net.GND" />
      <trace from={`${name}_LDO.GND_THERMAL`} to="net.GND" />

      {/* ========== 对外接口信号 (EXPORTED SIGNALS) ========== */}

      {/* LDO Output → 3.3V (供 MCU、外设使用) */}
      <trace from={`${name}_LDO.OUT`} to="net.PWR_3V3" />

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
