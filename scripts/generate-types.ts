#!/usr/bin/env node
/**
 * Generate TypeScript type definitions from Nix package data
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function generatePackageTypes(
  inputFile: string,
  outputFile: string,
  typeName: string
) {
  // Read package data
  const data = JSON.parse(readFileSync(inputFile, "utf-8")) as string[];

  // Sort for consistency
  data.sort();

  // Generate type definition with proper formatting
  let typeContent = `/**
 * Auto-generated type definitions for Nix packages
 * Generated from: ${inputFile}
 * Total packages: ${data.length}
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * Run 'npm run generate:types' to regenerate
 */

`;

  // For very large type unions, we need to be careful with TypeScript's limits
  // TypeScript can handle large unions, but IDE performance might suffer
  // We'll generate the type as a union of string literals

  if (data.length > 0) {
    typeContent += `export type ${typeName} =\n`;

    // Generate union type with proper formatting (one per line for readability)
    const lines = data.map((pkg, idx) => {
      const isLast = idx === data.length - 1;
      return `  | "${pkg}"${isLast ? ";" : ""}`;
    });

    typeContent += lines.join("\n");
  } else {
    typeContent += `export type ${typeName} = string;`;
  }

  // Write output
  writeFileSync(outputFile, typeContent, "utf-8");
  console.log(`✓ Generated ${typeName} with ${data.length} packages -> ${outputFile}`);
}

// Generate Python package types
const pythonPackagesInput = resolve(
  __dirname,
  "../src/nixpkgs/data/python-packages.json"
);
const pythonPackagesOutput = resolve(
  __dirname,
  "../src/nixpkgs/types/python-packages.d.ts"
);

generatePackageTypes(
  pythonPackagesInput,
  pythonPackagesOutput,
  "PythonPackageName"
);

// Generate nixpkgs package types
const nixpkgsPackagesInput = resolve(
  __dirname,
  "../src/nixpkgs/data/nixpkgs-packages.json"
);
const nixpkgsPackagesOutput = resolve(
  __dirname,
  "../src/nixpkgs/types/nixpkgs-packages.d.ts"
);

generatePackageTypes(
  nixpkgsPackagesInput,
  nixpkgsPackagesOutput,
  "NixpkgsPackageName"
);

console.log("\n✓ Type generation complete!");
