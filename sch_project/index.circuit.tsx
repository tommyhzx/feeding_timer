import { KeySwitchesModule } from "./modules/KeySwitchesModule";
import { ESP32S3WROOM16R8Module } from "./modules/ESP32S3WROOM16R8Module";
import { MAX7219Module } from "./modules/MAX7219Module";
import { PowerModuleETA6093 } from "./modules/PowerModuleETA6093";
import { boardOutline } from "./boardOutline";

export default () => (
  <board
    autorouter="auto-local"
    defaultTraceWidth="0.5mm"
    pcbStyle={{
    viaPadDiameter: "0.8mm",
    viaHoleDiameter: "0.4mm",
  }}
  outline={boardOutline}
  >
    {/* ========== 电源模块 (ETA6093 All-in-One方案) ========== */}
    <PowerModuleETA6093
      name="PWR"
      pcbX={0}
      pcbY={0}
      schX={10}
      schY={10}
    />

    {/* ========== ESP32-S3-WROOM-1-N16R8 模块 ========== */}
    {/* <ESP32S3WROOM16R8Module
      name="MCU"
      pcbX={0}
      pcbY={0}
      schX={0}
      schY={5}
      pcbRotation="270deg"
      layer="bottom"
    /> */}

    {/* ========== 独立按键模块 ========== */}
    {/* <KeySwitchesModule
      name="KEY"
      pcbX={0}
      pcbY={0}
      schX={0}
      schY={0}
    /> */}

    {/* ========== MAX7219 显示模块接口 ========== */}
    {/* <MAX7219Module
      name="DISP"
      pcbX={27}
      pcbY={0}
      schX={-10}
      schY={5}
      pcbRotation="90deg"
    /> */}

    {/* ========== 网络定义 ========== */}
    <net name="net.MODE_SIG" />
    <net name="net.ENTER_SIG" />

    {/* ========== 电源连接 ========== */}
    {/* PowerModule 3.3V → ESP32 3.3V */}
    <trace from="net.PWR_3V3" to="net.ESP32_3V3" />

    {/* ========== 模块间连线 ========== */}
    {/* Mode 按键: MCU.GPIO6 → KEY_MODE.pin1, KEY_MODE.pin2 → GND */}
    <trace from="MCU_ESP32.GPIO6" to="net.MODE_SIG" />
    <trace from="net.MODE_SIG" to="KEY_MODE.pin1" />
    <trace from="KEY_MODE.pin2" to="net.GND" />

    {/* Enter 按键: MCU.GPIO11 → KEY_ENTER.pin1, KEY_ENTER.pin2 → GND (修改：避开 Strapping 引脚 GPIO4) */}
    <trace from="MCU_ESP32.GPIO11" to="net.ENTER_SIG" />
    <trace from="net.ENTER_SIG" to="KEY_ENTER.pin1" />
    <trace from="KEY_ENTER.pin2" to="net.GND" />

    {/* ========== MAX7219 显示模块连线 ========== */}
    {/* VCC: MCU.3V3 → DISP_J1.pin1 (ESP32模块的3V3输出) */}
    <trace from="MCU_ESP32.3V3" to="DISP_J1.pin1" />
    {/* GND: GND → DISP_J1.pin2 */}
    <trace from="net.GND" to="DISP_J1.pin2" />
    {/* DIN: MCU.GPIO7 → DISP_J1.pin3 */}
    <trace from="MCU_ESP32.GPIO7" to="DISP_J1.pin3" />
    {/* CS: MCU.GPIO8 → DISP_J1.pin4 */}
    <trace from="MCU_ESP32.GPIO8" to="DISP_J1.pin4" />
    {/* CLK: MCU.GPIO10 → DISP_J1.pin5 (修改：避开 Strapping 引脚 GPIO15) */}
    <trace from="MCU_ESP32.GPIO10" to="DISP_J1.pin5" />

    {/* ========== 安装孔 (与 case_base.py 圆柱对齐) ========== */}
    <hole name="MH1" diameter="4mm" pcbX={-25} pcbY={0} />
    <hole name="MH2" diameter="4mm" pcbX={23} pcbY={-8} />
    <hole name="MH3" diameter="4mm" pcbX={23} pcbY={8} />
  </board>
);
