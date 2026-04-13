/**
 * EasyEDA part number to tscircuit footprint converter
 *
 * Usage:
 *   npx tsx easyeda-to-footprint.ts <LCSC零件号> [输出目录]
 *
 * Example:
 *   npx tsx easyeda-to-footprint.ts C400235
 *   npx tsx easyeda-to-footprint.ts C400235 ./components/footprints
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

// Round to 3 decimal places
function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

// Parse command line args
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error("Usage: npx tsx easyeda-to-footprint.ts <LCSC零件号> [输出目录]");
  console.error("Example: npx tsx easyeda-to-footprint.ts C400235 ./components/footprints");
  process.exit(1);
}

const partNumber = args[0];
const outputDir = args[1] ? path.resolve(args[1]) : process.cwd();

// Convert part number to PascalCase component name
const componentName = partNumber
  .split(/[-_]/)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join("");

// Create temp directory for soup.json
const tempDir = fs.mkdtempSync(path.join(require("os").tmpdir(), "easyeda-"));
const soupJsonPath = path.join(tempDir, `${partNumber}.soup.json`);

console.log(`\nDownloading: ${partNumber}`);

try {
  // Use easyeda CLI to convert to soup.json
  execSync(`easyeda convert -i "${partNumber}" -o "${soupJsonPath}"`, {
    stdio: "pipe",
  });
} catch (e: any) {
  console.error(`Error: Failed to download ${partNumber}`);
  console.error(`  ${e.message}`);
  process.exit(1);
}

// Read and parse soup.json
const soupJsonContent = fs.readFileSync(soupJsonPath, "utf-8");
const soup = JSON.parse(soupJsonContent);

// Clean up temp file
fs.unlinkSync(soupJsonPath);
fs.rmdirSync(tempDir);

// If soup is not an array, check if it has packageDetail for footprint
if (!Array.isArray(soup)) {
  console.error(`Error: Unexpected soup format for ${partNumber}`);
  console.error("This component may not have a PCB footprint.");
  process.exit(1);
}

// Types for soup.json elements
interface PcbPlatedHole {
  type: "pcb_plated_hole";
  shape: string;
  outer_diameter: number;
  hole_diameter: number;
  x: number;
  y: number;
  layers: string[];
  port_hints: string[];
}

interface PcbHole {
  type: "pcb_hole";
  hole_diameter: number;
  x: number;
  y: number;
}

// Extract data from soup
const platedHoles = soup.filter(
  (el: any): el is PcbPlatedHole => el.type === "pcb_plated_hole"
);
const holes = soup.filter((el: any): el is PcbHole => el.type === "pcb_hole");

console.log(`Converting: ${partNumber}`);
console.log(`Component name: ${componentName}`);
console.log(`Plated holes (pins): ${platedHoles.length}`);
console.log(`Holes (mounting): ${holes.length}`);

if (platedHoles.length === 0 && holes.length === 0) {
  console.error(`\nWarning: No holes found in footprint.`);
  console.error("This may be an SMT component without through-hole pads.");
}

// Generate footprint data file content
const footprintDataContent = `/**
 * ${componentName} Footprint Data
 * Auto-generated from EasyEDA (${partNumber})
 *
 * Generated: ${new Date().toISOString()}
 */

export const ${componentName}FootprintData: Array<{
  portHints: string[];
  pcbX: number;
  pcbY: number;
  width: number;
  height: number;
  holeDiameter: number;
  shape: "rect";
}> = [
${platedHoles
  .map(
    (hole, i) => `  {
    portHints: ${JSON.stringify(hole.port_hints || [`pin${i + 1}`])},
    pcbX: ${round(hole.x)},
    pcbY: ${round(hole.y)},
    width: ${round(hole.outer_diameter)},
    height: ${round(hole.outer_diameter)},
    holeDiameter: ${round(hole.hole_diameter)},
    shape: "rect" as const,
  }`
  )
  .join(",\n")}
];
${
  holes.length > 0
    ? `
export const ${componentName}MountingHole = {
  pcbX: ${round(holes[0].x)},
  pcbY: ${round(holes[0].y)},
  diameter: ${round(holes[0].hole_diameter)},
};
`
    : ""
}
`;

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write footprint data file
const footprintDataPath = path.join(outputDir, `${componentName}.ts`);
fs.writeFileSync(footprintDataPath, footprintDataContent);
console.log(`\nGenerated: ${footprintDataPath}`);

console.log("\nDone!");
