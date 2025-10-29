#!/usr/bin/env tsx

/**
 * Generate TypeScript type definitions from home-manager options
 *
 * This script parses the home-manager-options.json file and generates:
 * 1. Nested interface types for all configuration paths
 * 2. Helper types for specific program and service configurations
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const optionsPath = join(__dirname, '../src/homemanager/data/homemanager-options.json');
const outputPath = join(__dirname, '../src/homemanager/types/homemanager-config.d.ts');

type NestedObject = {
  [key: string]: NestedObject | { __leaf?: boolean };
};

interface ProgramInfo {
  name: string;
  options: string[];
}

function buildNestedStructure(options: string[]): NestedObject {
  const root: NestedObject = {};

  for (const option of options) {
    // Skip template variables like <name>
    if (option.includes('<name>')) continue;

    const parts = option.split('.');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        current[part] = { __leaf: true };
      } else {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part] as NestedObject;
      }
    }
  }

  return root;
}

function extractProgramConfigs(options: string[]): ProgramInfo[] {
  const programMap = new Map<string, Set<string>>();

  for (const option of options) {
    const match = option.match(/^programs\.([^.<]+)\.(.+)$/);
    if (match) {
      const [, programName, optionPath] = match;
      if (!programMap.has(programName)) {
        programMap.set(programName, new Set());
      }
      programMap.get(programName)!.add(optionPath);
    }
  }

  return Array.from(programMap.entries()).map(([name, opts]) => ({
    name,
    options: Array.from(opts).sort()
  }));
}

function extractServiceConfigs(options: string[]): ProgramInfo[] {
  const serviceMap = new Map<string, Set<string>>();

  for (const option of options) {
    const match = option.match(/^services\.([^.<]+)\.(.+)$/);
    if (match) {
      const [, serviceName, optionPath] = match;
      if (!serviceMap.has(serviceName)) {
        serviceMap.set(serviceName, new Set());
      }
      serviceMap.get(serviceName)!.add(optionPath);
    }
  }

  return Array.from(serviceMap.entries()).map(([name, opts]) => ({
    name,
    options: Array.from(opts).sort()
  }));
}

function isValidIdentifier(key: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
}

function quoteKeyIfNeeded(key: string): string {
  return isValidIdentifier(key) ? key : `"${key}"`;
}

function generateInterfaceFromNested(obj: NestedObject, interfaceName: string, indent = 0): string {
  const indentStr = '  '.repeat(indent);
  const lines: string[] = [];

  const keys = Object.keys(obj).sort();

  for (const key of keys) {
    const value = obj[key];
    const isLeaf = value && typeof value === 'object' && '__leaf' in value;
    const quotedKey = quoteKeyIfNeeded(key);

    if (isLeaf) {
      lines.push(`${indentStr}  ${quotedKey}?: any;`);
    } else {
      lines.push(`${indentStr}  ${quotedKey}?: {`);
      const nested = value as NestedObject;
      const nestedKeys = Object.keys(nested).sort();

      for (const nestedKey of nestedKeys) {
        const nestedValue = nested[nestedKey];
        const isNestedLeaf = nestedValue && typeof nestedValue === 'object' && '__leaf' in nestedValue;
        const quotedNestedKey = quoteKeyIfNeeded(nestedKey);

        if (isNestedLeaf) {
          lines.push(`${indentStr}    ${quotedNestedKey}?: any;`);
        } else {
          // For deeper nesting, just use any for now
          lines.push(`${indentStr}    ${quotedNestedKey}?: any;`);
        }
      }

      lines.push(`${indentStr}  };`);
    }
  }

  return `${indentStr}export interface ${interfaceName} {\n${lines.join('\n')}\n${indentStr}}`;
}

function generateProgramTypes(programs: ProgramInfo[]): string {
  const lines: string[] = [];

  lines.push('// Program-specific configuration types');
  lines.push('export type ProgramName =');

  const programNames = programs.map(p => `  | "${p.name}"`);
  lines.push(programNames.join('\n') + ';');
  lines.push('');

  return lines.join('\n');
}

function generateServiceTypes(services: ProgramInfo[]): string {
  const lines: string[] = [];

  lines.push('// Service-specific configuration types');
  lines.push('export type ServiceName =');

  const serviceNames = services.map(s => `  | "${s.name}"`);
  lines.push(serviceNames.join('\n') + ';');
  lines.push('');

  return lines.join('\n');
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function sanitizeInterfaceName(name: string): string {
  // Convert kebab-case and other special chars to PascalCase
  return name
    .split(/[-_]/)
    .map(part => capitalize(part))
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '');
}

function main() {
  console.log('Reading home-manager options...');
  const optionsJson = readFileSync(optionsPath, 'utf-8');
  const options: string[] = JSON.parse(optionsJson);

  console.log(`Found ${options.length} options`);

  console.log('Building nested structure...');
  const nested = buildNestedStructure(options);

  console.log('Extracting program configurations...');
  const programs = extractProgramConfigs(options);
  console.log(`Found ${programs.length} programs`);

  console.log('Extracting service configurations...');
  const services = extractServiceConfigs(options);
  console.log(`Found ${services.length} services`);

  console.log('Generating TypeScript types...');

  const output: string[] = [];

  output.push('/**');
  output.push(' * Auto-generated type definitions for Home Manager configuration');
  output.push(` * Generated from: ${optionsPath}`);
  output.push(` * Total options: ${options.length}`);
  output.push(' *');
  output.push(' * DO NOT EDIT MANUALLY - This file is auto-generated');
  output.push(" * Run 'npm run generate:homemanager:types' to regenerate");
  output.push(' */');
  output.push('');

  // Generate main configuration interface
  output.push('// Main Home Manager configuration structure');
  output.push(generateInterfaceFromNested(nested, 'HomeManagerOptions', 0));
  output.push('');

  // Generate program types
  output.push(generateProgramTypes(programs));

  // Generate service types
  output.push(generateServiceTypes(services));

  writeFileSync(outputPath, output.join('\n'));

  console.log(`✓ Generated types at ${outputPath}`);
  console.log(`  - ${programs.length} programs`);
  console.log(`  - ${services.length} services`);
}

main();
