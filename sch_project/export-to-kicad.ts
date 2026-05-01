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
 * 为 circuit.json 中的所有组件分配唯一的参考标号
 * 解决原理图同步到PCB时因问号批注导致的问题
 *
 * 问题描述：
 * - tscircuit 使用描述性名称（如 PWR_USB, MCU_ESP32等）
 * - circuit-json-to-kicad 会将这些名称转换为带问号的参考标号（如 U?, R?）
 * - KiCad 首次打开时会自动批注（U? -> U1），但重新导出后又变回 U?
 * - 导致原理图无法正确同步到已有的PCB
 *
 * 解决方案：
 * - 在导出前为所有组件分配固定的参考标号（U1, U2, R1, R2等）
 * - 同时更新所有引用这些名称的地方（display_name、网络名称等）
 * - 每次导出时相同的组件会获得相同的参考标号
 */
function annotateCircuitJson(circuitJson: any): any {
  // 参考标号前缀映射表（与 circuit-json-to-kicad 保持一致）
  const referencePrefixByFtype: Record<string, string> = {
    simple_chip: "U",
    simple_resistor: "R",
    simple_capacitor: "C",
    simple_inductor: "L",
    simple_diode: "D",
    simple_led: "D",
    simple_transistor: "Q",
    simple_mosfet: "Q",
    simple_fuse: "F",
    simple_switch: "SW",
    simple_push_button: "SW",
    simple_potentiometer: "RV",
    simple_crystal: "Y",
    simple_resonator: "Y",
    simple_pin_header: "J",
    simple_pinout: "J",
    simple_test_point: "TP",
    simple_battery: "BT"
  }

  // 检查是否已经是有效的参考标号格式（如 U1, R2等）
  const referenceDesignatorPattern = /^[A-Za-z]+\d+$/
  function isReferenceDesignator(value: string | undefined): boolean {
    if (!value) return false
    return referenceDesignatorPattern.test(value.trim())
  }

  // 获取组件的前缀
  function getPrefix(component: any): string {
    const ftype = component?.ftype
    if (ftype && referencePrefixByFtype[ftype]) {
      return referencePrefixByFtype[ftype]
    }
    return "U" // 默认前缀
  }

  // 计数器：跟踪每种前缀已使用的编号
  const counters: Record<string, number> = {}

  // 名称映射表：旧名称 -> 新名称
  const nameMap: Record<string, string> = {}

  // 创建原始 circuit.json 的深拷贝（重要：必须深拷贝，否则会修改原始数据）
  const annotatedJson = JSON.parse(JSON.stringify(circuitJson))

  // 第一遍：为所有 source_component 分配参考标号，建立名称映射
  for (const item of annotatedJson) {
    if (item?.type === "source_component" && item?.name) {
      const oldName = item.name
      // 如果名称不是有效的参考标号格式，则分配新的
      if (!isReferenceDesignator(oldName)) {
        const prefix = getPrefix(item)
        if (!counters[prefix]) {
          counters[prefix] = 0
        }
        counters[prefix]++
        const newName = `${prefix}${counters[prefix]}`
        item.name = newName
        nameMap[oldName] = newName
      }
    }
  }

  // 第二遍：更新所有引用旧名称的地方
  for (const item of annotatedJson) {
    if (!item) continue

    // 更新 display_name 中的组件名称引用
    if (item.display_name && typeof item.display_name === "string") {
      let displayName = item.display_name
      // 匹配类似 "PWR_R_DP.pin1" 或 "MCU_ESP32.GPIO7" 的模式
      for (const [oldName, newName] of Object.entries(nameMap)) {
        // 使用正则表达式匹配完整的组件名称（后面跟着点或其他边界）
        const regex = new RegExp(`\\b${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')
        displayName = displayName.replace(regex, newName)
      }
      item.display_name = displayName
    }

    // 更新 text 中的组件名称引用（如标签）
    if (item.text && typeof item.text === "string") {
      let text = item.text
      for (const [oldName, newName] of Object.entries(nameMap)) {
        const regex = new RegExp(`\\b${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')
        text = text.replace(regex, newName)
      }
      item.text = text
    }
  }

  return annotatedJson
}

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
 * 清理PCB文件中的NaN值。
 * circuit-json-to-kicad库在某些情况下会生成包含NaN的走线，
 * 这会导致KiCad无法打开文件。这个函数会移除这些有问题的走线段。
 */
function cleanNaNValues(pcbContent: string): string {
  const lines = pcbContent.split('\n')
  const cleanedLines: string[] = []
  const segmentsToRemove: Set<number> = new Set()

  // 第一步：找到所有包含NaN的segment，标记它们需要移除
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // 如果这一行包含NaN，找到整个segment并标记
    if (line.includes('NaN')) {
      // 向前找到segment的开始
      let j = i
      while (j >= 0 && !lines[j].trim().startsWith('(segment')) {
        j--
      }

      if (j >= 0) {
        // 从j开始，找到segment的结束
        let depth = 0
        for (let k = j; k < lines.length; k++) {
          // 计算括号深度
          for (const char of lines[k]) {
            if (char === '(') depth++
            else if (char === ')') depth--
          }

          // 括号平衡，segment结束
          if (depth === 0) {
            // 标记j到k的所有行需要移除
            for (let m = j; m <= k; m++) {
              segmentsToRemove.add(m)
            }
            break
          }
        }
      }
    }
  }

  // 第二步：只保留没有被标记的行
  for (let i = 0; i < lines.length; i++) {
    if (!segmentsToRemove.has(i)) {
      cleanedLines.push(lines[i])
    }
  }

  return cleanedLines.join('\n')
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

// 对 circuit.json 进行批注处理，为所有组件分配唯一的参考标号
// 这样可以确保每次导出时组件获得一致的参考标号（U1, U2, R1等）
// 而不是问号（U?, R?），从而解决原理图到PCB的同步问题
const annotatedCircuitJson = annotateCircuitJson(circuitJson)

// 1. Convert to KiCad Schematic (.kicad_sch)
console.log("Generating schematic with annotated references...")
const schConverter = new CircuitJsonToKicadSchConverter(annotatedCircuitJson)
schConverter.runUntilFinished()
const schContent = schConverter.getOutputString()
fs.writeFileSync(path.join(outputDir, `${projectName}.kicad_sch`), schContent)
console.log("  -> Schematic generated")

// 2. Convert to KiCad PCB (.kicad_pcb)
const pcbOutputPath = path.join(outputDir, `${projectName}.kicad_pcb`)
if (!forceRegenerate && fs.existsSync(pcbOutputPath)) {
  console.log("  -> PCB file exists, skipping (use --force to regenerate)")
} else {
  const circuitJsonForPcb = includeTraces
    ? annotatedCircuitJson
    : removeTracesAndVias(annotatedCircuitJson)
  console.log(`Generating PCB ${includeTraces ? "with traces" : "without traces"}...`)
  const pcbConverter = new CircuitJsonToKicadPcbConverter(circuitJsonForPcb, {
    projectName,
  })
  pcbConverter.runUntilFinished()
  let pcbContent = pcbConverter.getOutputString()

  // 如果包含走线，清理可能的NaN值（circuit-json-to-kicad库的bug）
  if (includeTraces) {
    const beforeLength = pcbContent.length
    pcbContent = cleanNaNValues(pcbContent)
    const afterLength = pcbContent.length
    if (beforeLength !== afterLength) {
      console.log(`  -> Cleaned ${beforeLength - afterLength} characters containing NaN values`)
    }
  }

  fs.writeFileSync(pcbOutputPath, pcbContent)
  console.log(`  -> PCB generated ${includeTraces ? "(with traces)" : "(traces removed - route manually in KiCad)"}`)
}

// 3. Generate KiCad Project file (.kicad_pro)
console.log("Generating project file...")
const proConverter = new CircuitJsonToKicadProConverter(annotatedCircuitJson, {
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
