import {
  CircuitJsonToKicadSchConverter,
  CircuitJsonToKicadPcbConverter,
  CircuitJsonToKicadProConverter,
} from "circuit-json-to-kicad"
import * as fs from "fs"
import * as path from "path"

// Import the circuit.json directly from the compiled dist folder
// @ts-ignore - JSON module import
import circuitJson from "./dist/index/circuit.json"

/**
 * 从 circuit JSON 中移除走线和过孔。
 * 这样可以在 KiCad 中手动布线，而不会被自动生成的走线覆盖。
 */
function removeTracesAndVias(cj: any): any {
  if (!Array.isArray(cj)) return cj
  return cj.filter((item: any) => {
    const type = item?.type
    return type !== "pcb_trace" && type !== "pcb_via"
  })
}

/**
 * 使用方法：
 *   npx tsx export-to-kicad.ts              # 导出不带走线（默认，手动布线）
 *   npx tsx export-to-kicad.ts --with-traces # 导出带走线信息
 *   npx tsx export-to-kicad.ts -t            # 同上，简写
 *   npx tsx export-to-kicad.ts --force       # 强制重新生成已存在的 PCB 文件
 *   npx tsx export-to-kicad.ts -f            # 同上，简写
 *   npx tsx export-to-kicad.ts -t -f         # 组合使用：带走线且强制重新生成
 *   npx tsx export-to-kicad.ts --help        # 显示帮助信息
 *
 * 参数说明：
 *   --with-traces, -t   在 PCB 导出中包含走线和过孔信息
 *   --force, -f         即使 PCB 文件已存在也重新生成
 *   --help, -h          显示帮助信息
 */

// 解析命令行参数
const args = process.argv.slice(2)
const includeTraces = args.includes("--with-traces") || args.includes("-t")
const forceRegenerate = args.includes("--force") || args.includes("-f")

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
KiCad 导出选项：
  --with-traces, -t   在 PCB 导出中包含走线和过孔信息
  --force, -f         即使 PCB 文件已存在也重新生成
  --help, -h          显示帮助信息

使用示例：
  npx tsx export-to-kicad.ts              # 导出不带走线（默认，手动布线）
  npx tsx export-to-kicad.ts --with-traces # 导出带走线信息
  npx tsx export-to-kicad.ts -t -f        # 带走线且强制重新生成
`)
  process.exit(0)
}

const outputDir = path.join(__dirname, "kicad_output")

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const projectName = "my-keyboard"

console.log("Starting KiCad export...")

// 1. Convert to KiCad Schematic (.kicad_sch)
console.log("Generating schematic...")
const schConverter = new CircuitJsonToKicadSchConverter(circuitJson)
schConverter.runUntilFinished()
const schContent = schConverter.getOutputString()
fs.writeFileSync(path.join(outputDir, `${projectName}.kicad_sch`), schContent)
console.log("  -> Schematic generated")

// 2. Convert to KiCad PCB (.kicad_pcb)
const pcbOutputPath = path.join(outputDir, `${projectName}.kicad_pcb`)
if (!forceRegenerate && fs.existsSync(pcbOutputPath)) {
  console.log("  -> PCB file exists, skipping (use --force to regenerate)")
} else {
  const circuitJsonForPcb = includeTraces ? circuitJson : removeTracesAndVias(circuitJson)
  console.log(`Generating PCB ${includeTraces ? "with traces" : "without traces"}...`)
  const pcbConverter = new CircuitJsonToKicadPcbConverter(circuitJsonForPcb, {
    projectName,
  })
  pcbConverter.runUntilFinished()
  const pcbContent = pcbConverter.getOutputString()
  fs.writeFileSync(pcbOutputPath, pcbContent)
  console.log(`  -> PCB generated ${includeTraces ? "(with traces)" : "(traces removed - route manually in KiCad)"}`)
}

// 3. Generate KiCad Project file (.kicad_pro)
console.log("Generating project file...")
const proConverter = new CircuitJsonToKicadProConverter(circuitJson, {
  projectName,
  schematicFilename: `${projectName}.kicad_sch`,
  pcbFilename: `${projectName}.kicad_pcb`,
})
proConverter.runUntilFinished()
const proContent = proConverter.getOutputString()
fs.writeFileSync(path.join(outputDir, `${projectName}.kicad_pro`), proContent)
console.log("  -> Project file generated")

console.log(`\nKiCad files exported to: ${outputDir}`)
console.log(`  - ${projectName}.kicad_pro (open this in KiCad)`)
console.log(`  - ${projectName}.kicad_sch`)
console.log(`  - ${projectName}.kicad_pcb`)
