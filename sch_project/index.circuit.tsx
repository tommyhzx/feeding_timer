import { KeyMatrix } from "./modules/KeyMatrix";
import type { KLELayout } from "./components/types";
import { ESP32S3WROOM16R8Module } from "./modules/ESP32S3WROOM16R8Module";
import { boardOutline } from "./boardOutline";


// 2x3 键盘布局 - 上居中于左、下、右
const arrowLayout: KLELayout = [
  ["", "Up"],  // 添加占位键使 Up 位于 col=1（中间列）
  ["Left", "Down", "Right"],
];

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
      rowPins={["net.ROW0", "net.ROW1"]}
      colPins={["net.COL0", "net.COL1", "net.COL2"]}
      pcbX={-27}
      pcbY={0}
      schX={0}
      schY={5}
      pcbRotation="270deg"
    />

    {/* ========== 键盘矩阵 ========== */}
    <KeyMatrix
      name="KB"
      layout={arrowLayout}
      rowToMicroPin={["net.ROW0", "net.ROW1"]}
      colToMicroPin={["net.COL0", "net.COL1", "net.COL2"]}
      pcbX={40}
      pcbY={11}
      schX={0}
      schY={0}
    />

    {/* ========== 安装孔 (与 case_base.py 圆柱对齐) ========== */}
    <hole name="MH1" diameter="4mm" pcbX={-53} pcbY={-18} />
    <hole name="MH2" diameter="4mm" pcbX={53} pcbY={-18} />
    <hole name="MH3" diameter="4mm" pcbX={-53} pcbY={18} />
    <hole name="MH4" diameter="4mm" pcbX={53} pcbY={18} />
  </board>
);
