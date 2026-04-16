import { KeySwitchesModule } from "./modules/KeySwitchesModule";
import { ESP32S3WROOM16R8Module } from "./modules/ESP32S3WROOM16R8Module";
import { MAX7219Module } from "./modules/MAX7219Module";
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
    {/* ========== ESP32-S3-WROOM-1-N16R8 模块 ========== */}
    <ESP32S3WROOM16R8Module
      name="MCU"
      pcbX={-27}
      pcbY={0}
      schX={0}
      schY={5}
      pcbRotation="270deg"
    />

    {/* ========== 独立按键模块 ========== */}
    <KeySwitchesModule
      name="KEY"
      pcbX={30}
      pcbY={0}
      schX={0}
      schY={0}
    />

    {/* ========== MAX7219 显示模块接口 ========== */}
    <MAX7219Module
      name="DISP"
      pcbX={10}
      pcbY={-18}
      schX={-10}
      schY={5}
    />

    {/* ========== 网络定义 ========== */}
    <net name="net.MODE_SIG" />
    <net name="net.ENTER_SIG" />

    {/* ========== 模块间连线 ========== */}
    {/* Mode 按键: MCU.GPIO6 → KEY_MODE.pin1, KEY_MODE.pin2 → GND */}
    <trace from="MCU_ESP32.GPIO6" to="net.MODE_SIG" />
    <trace from="net.MODE_SIG" to="KEY_MODE.pin1" />
    <trace from="KEY_MODE.pin2" to="net.GND" />

    {/* Enter 按键: MCU.GPIO4 → KEY_ENTER.pin1, KEY_ENTER.pin2 → GND */}
    <trace from="MCU_ESP32.GPIO4" to="net.ENTER_SIG" />
    <trace from="net.ENTER_SIG" to="KEY_ENTER.pin1" />
    <trace from="KEY_ENTER.pin2" to="net.GND" />

    {/* ========== MAX7219 显示模块连线 ========== */}
    {/* VCC: MCU.3V3 → DISP_J1.pin1 */}
    <trace from="MCU_ESP32.3V3" to="DISP_J1.pin1" />
    {/* GND: GND → DISP_J1.pin2 */}
    <trace from="net.GND" to="DISP_J1.pin2" />
    {/* DIN: MCU.GPIO7 → DISP_J1.pin3 */}
    <trace from="MCU_ESP32.GPIO7" to="DISP_J1.pin3" />
    {/* CS: MCU.GPIO8 → DISP_J1.pin4 */}
    <trace from="MCU_ESP32.GPIO8" to="DISP_J1.pin4" />
    {/* CLK: MCU.GPIO15 → DISP_J1.pin5 */}
    <trace from="MCU_ESP32.GPIO15" to="DISP_J1.pin5" />

    {/* ========== 安装孔 (与 case_base.py 圆柱对齐) ========== */}
    <hole name="MH1" diameter="4mm" pcbX={-53} pcbY={-18} />
    <hole name="MH2" diameter="4mm" pcbX={53} pcbY={-18} />
    <hole name="MH3" diameter="4mm" pcbX={-53} pcbY={18} />
    <hole name="MH4" diameter="4mm" pcbX={53} pcbY={18} />
  </board>
);
