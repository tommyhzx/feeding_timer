import { KeySwitchesModule } from "./modules/KeySwitchesModule";
import { ESP32S3WROOM16R8Module } from "./modules/ESP32S3WROOM16R8Module";
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

    {/* ========== 模块间连线 ========== */}
    {/* Mode 按键: MCU.GPI04 → KEY_MODE.pin1, KEY_MODE.pin2 → GND */}
    <trace from="MCU.MCU_ESP32.pin4" to="KEY.KEY_MODE.pin1" />
    <trace from="KEY.KEY_MODE.pin2" to="net.GND" />

    {/* Enter 按键: MCU.GPIO6 → KEY_ENTER.pin1, KEY_ENTER.pin2 → GND */}
    <trace from="MCU.MCU_ESP32.pin6" to="KEY.KEY_ENTER.pin1" />
    <trace from="KEY.KEY_ENTER.pin2" to="net.GND" />

    {/* ========== 安装孔 (与 case_base.py 圆柱对齐) ========== */}
    <hole name="MH1" diameter="4mm" pcbX={-53} pcbY={-18} />
    <hole name="MH2" diameter="4mm" pcbX={53} pcbY={-18} />
    <hole name="MH3" diameter="4mm" pcbX={-53} pcbY={18} />
    <hole name="MH4" diameter="4mm" pcbX={53} pcbY={18} />
  </board>
);
