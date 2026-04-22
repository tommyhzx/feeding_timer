import { USBConnector } from "../components/USBConnector";
import { USBLC6 } from "../components/USBLC6";
import { ETA6093 } from "../components/ETA6093";
import { BatteryConnector } from "../components/BatteryConnector";

/**
 * PowerModuleETA6093 - All-in-One Battery Power with ETA6093
 *
 * ═══════════════════════════════════════════════════════════════
 * 电路架构
 * ═══════════════════════════════════════════════════════════════
 *
 * ETA6093 All-in-One拓扑:
 * USB 5V ──→ OUT ──→ 5V输出 → ESP32模块 (内部转3.3V)
 *                │
 *         (自动检测&切换)
 *                │
 *              SW ← 电感 → BAT ← 锂电池
 *
 * 功能说明：
 * 1. ETA6093: 充电+升压一体 (1.2A充电, 1.2A升压, 95%效率)
 * 2. 支持边充边用 (ETA6093内置路径管理)
 * 3. LED状态指示：
 *    - 放电中: 蓝灯亮
 *    - 充电中: 红灯闪
 *    - 充满: 红灯亮
 *
 * ═══════════════════════════════════════════════════════════════
 * PCB布局设计 (参考ETA6093数据手册)
 * ═══════════════════════════════════════════════════════════════
 *
 * 布局原则 (参考数据手册第5页):
 * 1. 功率器件尽可能靠近芯片
 * 2. 电源走线尽可能短
 * 3. 良好的GND接地
 *
 * 器件布局说明:
 * ┌────────────────────────────────────────────────────────────┐
 * │  左侧: USB-C连接器 + ESD保护 + USB数据线电阻                │
 * │         (方便外部连接)                                        │
 * ├────────────────────────────────────────────────────────────┤
 * │  中央: ETA6093芯片 (原点)                                     │
 * │    左上: C_OUT 22µF  (靠近OUT引脚)                           │
 * │    左下: C_BAT 10µF + 电感 (靠近BAT和SW引脚)                  │
 * │    右侧: LED指示灯                                          │
 * ├────────────────────────────────────────────────────────────┤
 * │  底部: 电池连接器                                             │
 * │         (方便电池连接)                                        │
 * └────────────────────────────────────────────────────────────┘
 *
 * 关键功率回路 (最优先级):
 * 1. C_OUT → OUT引脚 (输出滤波，减少纹波)
 * 2. BAT ↔ 电感 ↔ SW (开关节点，高频开关)
 * 3. C_BAT → BAT引脚 (电池滤波)
 *
 * ═══════════════════════════════════════════════════════════════
 * 对外输出信号 (EXPORTED SIGNALS)
 * ═══════════════════════════════════════════════════════════════
 * 输出到其他模块的信号：
 *   • PWR_5V      → 5V 电源输出（供 ESP32 模块使用，模块内部转3.3V）
 *   • PWR_USB_DP  → USB D+ 数据线（经 22Ω 电阻 + ESD 保护）
 *   • PWR_USB_DM  → USB D- 数据线（经 22Ω 电阻 + ESD 保护）
 *
 * 使用示例：
 *   import { POWER_MODULE_PORTS } from "./modules/PowerModuleETA6093"
 *   <trace from={POWER_MODULE_PORTS.PWR_5V} to="ESP32.5V" />
 * ═══════════════════════════════════════════════════════════════
 *
 * Props:
 * - name: component name prefix
 * - pcbX, pcbY: PCB position
 * - schX, schY: schematic position
 */
export const PowerModuleETA6093 = (props: {
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
      // pcbGrid pcbGridCols={2} pcbGridGap="1mm"
      pcbX={pcbX}
      pcbY={pcbY}
      schX={schX}
      schY={schY}
    >
      {/* ==================== 连接器部分 ==================== */}
      {/* Connectors Group - USB连接器 + 电池连接器 */}
      <group
        name={`${name}_USBCONN_GROUP`}
        // pcbFlex pcbFlexGap="1mm"
        schX={0}
        schY={0}
        pcbX={-20}
        pcbY={0}
      >
        {/* USB-C Connector - 放在PCB边缘，方便连接，头朝左 */}
        <USBConnector
          name={`${name}_USB`}
          pcbRotation={270}

        />
      </group>
      <group
        name={`${name}_PWRCONN_GROUP`}
        // pcbFlex pcbFlexGap="1mm"
        schX={0}
        schY={0}
        pcbX={10}
        pcbY={0}
      >
        {/* 电池连接器 - 放在PCB底部边缘，方便连接电池 */}
        <BatteryConnector
          name={`${name}_BAT`}
          pcbRotation={90}
        />
      </group>
      {/* USB ESD Protection Group - ESD芯片 + DP/DM串联电阻 */}
      <group   
        name={`${name}_USB_GROUP`}
        schX={0}
        schY={5}
        pcbX={-10}
        pcbY={0}
        // pcbRotation={90}
      >
        <USBLC6 name={`${name}_ESD`} 
          // pcbRotation={90}
        />
        <resistor
          name={`${name}_R_DP`}
          resistance="22Ω"
          footprint="0603"
        />
        <resistor
          name={`${name}_R_DM`}
          resistance="22Ω"
          footprint="0603"
        />
      </group>

      {/* ==================== ETA6093 电源管理 ==================== */}
      {/* ETA6093 Power Group - 芯片 + 输出电容 + 电池电容 + 电感 */}
      <group
        name={`${name}_PM_GROUP`}
        schX={0}
        schY={10}
        pcbX={0}
        pcbY={0}
      >
        <ETA6093
          name={`${name}_PM`}
        />

        {/* ETA6093输出电容 22µF - 靠近OUT引脚 (Pin1, 左上方) */}
        <capacitor
          name={`${name}_C_OUT`}
          capacitance="22µF"
          footprint="1206"
        />

        {/* 电池旁路电容 10µF - 靠近BAT引脚 (Pin4, 左下方) */}
        <capacitor
          name={`${name}_C_BAT`}
          capacitance="10µF"
          footprint="0805"
        />

        {/* 电感 4.7µH (BAT ↔ SW) - 靠近BAT和SW引脚 (左下方) */}
        <inductor
          name={`${name}_L`}
          inductance="4.7µH"
          footprint="0805"
        />
         <led
          name={`${name}_LED_RED`}
          color="red"
          footprint="0603"
        />
        <resistor
          name={`${name}_R_LED_RED`}
          resistance="2kΩ"
          footprint="0603"
        />

        {/* 蓝色LED (放电指示) - 放在边缘方便观察 */}
        <led
          name={`${name}_LED_BLUE`}
          color="blue"
          footprint="0603"
        />
        <resistor
          name={`${name}_R_LED_BLUE`}
          resistance="2kΩ"
          footprint="0603"
        />
      </group>

      {/* ==================== 内部走线 ==================== */}

      {/* ========== USB 5V输入网络 ========== */}
      {/* USB VBUS → ETA6093 OUT (5V总线) */}
      <trace from={`${name}_USB.VBUS`} to="net.USB_5V" />
      <trace from={`${name}_USB.VBUS2`} to="net.USB_5V" />
      <trace from={"net.USB_5V"} to={`${name}_PM.OUT`} />
      <trace from={"net.USB_5V"} to={`${name}_ESD.VBUS`} />

      {/* USB GND */}
      <trace from={`${name}_USB.GND`} to="net.GND" />
      <trace from={`${name}_USB.GND2`} to="net.GND" />

      {/* ========== ETA6093电源电路 ========== */}
      {/* ETA6093 GND */}
      <trace from={`${name}_PM.GND`} to="net.GND" />

      {/* ETA6093 BAT ↔ 电感 ↔ SW (双向功率级) */}
      <trace from={`${name}_PM.BAT`} to={`net.BAT_PLUS`} />
      <trace from={`net.BAT_PLUS`} to={`${name}_L.pin1`} />
      <trace from={`${name}_L.pin2`} to={`${name}_PM.SW`} />

      {/* ETA6093输出电容 (OUT → GND) */}
      <trace from={`${name}_PM.OUT`} to={`${name}_C_OUT.pin1`} />
      <trace from={`${name}_C_OUT.pin2`} to="net.GND" />

      {/* 电池旁路电容 (BAT → GND) */}
      <trace from={`net.BAT_PLUS`} to={`${name}_C_BAT.pin1`} />
      <trace from={`${name}_C_BAT.pin2`} to="net.GND" />

      {/* ========== LED指示电路 ========== */}
      {/* ETA6093 LED驱动引脚 → 限流电阻 → LED → GND
          ETA6093会自动控制LED显示状态：
          - 放电中: LED脚输出高电平驱动蓝灯
          - 充电中: LED脚输出PWM驱动红灯闪烁
          - 充满: LED脚输出高电平驱动红灯
      */}
      {/* 红色LED (充电/充满) */}
      <trace from={`${name}_PM.LED`} to={`${name}_R_LED_RED.pin1`} />
      <trace from={`${name}_R_LED_RED.pin2`} to={`${name}_LED_RED.cathode`} />
      <trace from={`${name}_LED_RED.anode`} to={`net.USB_5V`} />

      {/* 蓝色LED (放电指示，使用反相逻辑或GPIO控制) */}
      {/* 注意：ETA6093只有一个LED引脚，需要根据应用调整
           此处预留蓝灯位置，可根据实际需求连接
      */}
      <trace from={`net.USB_5V`} to={`${name}_R_LED_BLUE.pin1`} />
      <trace from={`${name}_R_LED_BLUE.pin2`} to={`${name}_LED_BLUE.anode`} />
      <trace from={`${name}_LED_BLUE.cathode`} to={`net.GND`} />
      {/* 蓝灯由MCU GPIO控制，根据放电状态点亮 */}

      {/* ========== 电池连接 ========== */}
      {/* 电池正极 ↔ BAT_PLUS网络 */}
      <trace from={`net.BAT_PLUS`} to={`${name}_BAT.pin1`} />
      {/* 电池负极 → GND */}
      <trace from={`${name}_BAT.pin2`} to="net.GND" />

      {/* ========== 对外接口信号 (EXPORTED SIGNALS) ========== */}

      {/* ETA6093 OUT (5V) → 直接输出供ESP32使用 */}
      <trace from={`${name}_PM.OUT`} to="net.PWR_5V" />

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

export type PowerModuleETA6093Props = {
  name?: string;
  pcbX?: number;
  pcbY?: number;
  schX?: number;
  schY?: number;
};
