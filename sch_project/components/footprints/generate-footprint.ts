/**
 * 生成 KiCad footprint 静态数据文件
 *
 * 用法: bun run components/footprints/generate-footprint.ts <kicad_mod_path> <output_name>
 *
 * 示例:
 *   bun run components/footprints/generate-footprint.ts ESP32-S3-WROOM-1 ESP32-S3-WROOM-1-N4R2
 *
 * 生成的文件: components/footprints/<output_name>.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// 命令行参数
const kicadModPath = process.argv[2];
const outputName = process.argv[3];

if (!kicadModPath || !outputName) {
  console.error("用法: bun run generate-footprint.ts <kicad_mod_path> <output_name>");
  console.error("示例: bun run generate-footprint.ts ESP32-S3-WROOM-1 ESP32-S3-WROOM-1-N4R2");
  process.exit(1);
}

// KiCad .kicad_mod 文件路径
const KICAD_MOD_PATH = join(__dirname, "..", "..", "node_modules", "kicad-libraries", "footprints", "Espressif.pretty", kicadModPath + ".kicad_mod")

// 输出文件路径
const OUTPUT_PATH = join(__dirname, `${outputName}.ts`)

// 导出数据名称 (PascalCase)
const exportName = outputName.replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/^-/, '') + 'FootprintData'

// 简单的 S-expression 解析
function parseSexpr(content: string): any {
  const regex = /\(|\)|"[^"]*"|[^\s()]+/g;
  const tokens = content.match(regex) || [];
  let pos = 0;

  function parse(): any {
    if (tokens[pos] === "(") {
      pos++;
      const arr = [];
      while (tokens[pos] !== ")") {
        arr.push(parse());
      }
      pos++;
      return arr;
    }
    const token = tokens[pos];
    pos++;
    const num = parseFloat(token);
    return isNaN(num) ? token.replace(/^"(.*)"$/, "$1") : num;
  }

  return parse();
}

interface Pad {
  name: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
}

function extractPads(sexpr: any): Pad[] {
  const pads: Pad[] = [];

  function scanForPads(arr: any[]) {
    for (const item of arr) {
      if (Array.isArray(item)) {
        if (item[0] === "pad") {
          const atArr = item[4];
          const sizeArr = item[5];

          if (!atArr || !sizeArr || !Array.isArray(atArr) || !Array.isArray(sizeArr)) continue;

          const name = String(item[1]);
          const pinNum = parseInt(name);
          if (isNaN(pinNum) || pinNum < 1) continue;

          pads.push({
            name,
            x: atArr[1],
            y: atArr[2],
            rotation: atArr[3] || 0,
            width: sizeArr[1],
            height: sizeArr[2]
          });
        } else {
          scanForPads(item);
        }
      }
    }
  }

  scanForPads(sexpr);
  return pads;
}

function applyRotation(pad: Pad): { x: number; y: number; width: number; height: number } {
  let { x, y, rotation, width, height } = pad;

  // KiCad Y轴向上，tscircuit Y轴向下，所以 Y 取反
  y = -y;

  // rotation 只影响焊盘宽高方向，不影响中心位置
  if (rotation === 90 || rotation === 270) {
    return { x, y, width: height, height: width };
  }

  return { x, y, width, height };
}

// 主程序
console.log("读取 KiCad 文件:", KICAD_MOD_PATH)
const content = readFileSync(KICAD_MOD_PATH, "utf-8")
const sexpr = parseSexpr(content)
const pads = extractPads(sexpr)
pads.sort((a, b) => parseInt(a.name) - parseInt(b.name))

console.log(`解析到 ${pads.length} 个 pad`)

// 生成 TypeScript 代码
const tsCode = `/**
 * ${outputName} Footprint 数据
 * 自动从 KiCad .kicad_mod 文件生成
 *
 * 生成时间: ${new Date().toISOString()}
 */

export const ${exportName}: Array<{
  portHints: string[];
  pcbX: number;
  pcbY: number;
  width: number;
  height: number;
  shape: "rect";
}> = [
${pads.map(pad => {
  const rotated = applyRotation(pad);
  return `  {
    portHints: ["pin${pad.name}"],
    pcbX: ${rotated.x.toFixed(3)},
    pcbY: ${rotated.y.toFixed(3)},
    width: ${rotated.width},
    height: ${rotated.height},
    shape: "rect" as const,
  }`;
}).join(",\n")}
];
`

writeFileSync(OUTPUT_PATH, tsCode)
console.log("生成文件:", OUTPUT_PATH)
console.log("完成!")