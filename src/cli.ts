#!/usr/bin/env node

import { spawn } from "child_process";
import { existsSync, writeFileSync } from "fs";
import { resolve, dirname, basename, extname, join } from "path";
import { fileURLToPath } from "url";

const VERSION = "0.1.0";

interface CliOptions {
  command: "build" | "init" | "help" | "version";
  inputFile?: string;
  outputFile?: string;
  watch?: boolean;
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    command: "help",
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      options.command = "help";
      break;
    } else if (arg === "--version" || arg === "-v") {
      options.command = "version";
      break;
    } else if (arg === "build") {
      options.command = "build";
      i++;
      if (i < args.length && !args[i].startsWith("-")) {
        options.inputFile = args[i];
        i++;
      }
    } else if (arg === "init") {
      options.command = "init";
      i++;
      if (i < args.length && !args[i].startsWith("-")) {
        options.inputFile = args[i];
        i++;
      }
    } else if (arg === "-o" || arg === "--output") {
      i++;
      if (i < args.length) {
        options.outputFile = args[i];
        i++;
      }
    } else if (arg === "--watch" || arg === "-w") {
      options.watch = true;
      i++;
    } else if (!arg.startsWith("-")) {
      // Assume it's the input file if no command specified
      if (!options.inputFile) {
        options.command = "build";
        options.inputFile = arg;
      }
      i++;
    } else {
      console.error(`Unknown option: ${arg}`);
      options.command = "help";
      break;
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
nixts - TypeScript DSL for building Nix flakes

Usage:
  nixts build <file.ts> [options]    Build a Nix flake from TypeScript file
  nixts init [file.ts]               Create a starter template
  nixts --help, -h                   Show this help message
  nixts --version, -v                Show version

Options:
  -o, --output <file.nix>            Specify output file name
  -w, --watch                        Watch mode (not yet implemented)

Examples:
  nixts build my-flake.ts            Creates my-flake.nix
  nixts build config.ts -o flake.nix Creates flake.nix
  nixts init my-config.ts            Creates a starter template

Your TypeScript file should export the flake as default or log it:

  import { FlakeBuilder } from "nixts";

  const flake = new FlakeBuilder()
    .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
    .addDevShell("default", (shell) => {
      shell.withPackages(["git", "nodejs"]);
    })
    .build();

  console.log(flake);
`);
}

function printVersion(): void {
  console.log(`nixts v${VERSION}`);
}

async function executeTypeScriptFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Use tsx to execute the TypeScript file
    const tsxProcess = spawn("npx", ["tsx", filePath], {
      stdio: ["inherit", "pipe", "pipe"],
      shell: true,
    });

    let stdout = "";
    let stderr = "";

    tsxProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    tsxProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    tsxProcess.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Execution failed with code ${code}:\n${stderr}`));
      } else {
        resolve(stdout.trim());
      }
    });

    tsxProcess.on("error", (err) => {
      reject(new Error(`Failed to execute TypeScript file: ${err.message}`));
    });
  });
}

async function buildFlake(inputFile: string, outputFile?: string): Promise<void> {
  const resolvedInput = resolve(process.cwd(), inputFile);

  if (!existsSync(resolvedInput)) {
    console.error(`Error: Input file not found: ${inputFile}`);
    process.exit(1);
  }

  const ext = extname(resolvedInput);
  if (ext !== ".ts" && ext !== ".tsx") {
    console.error(`Error: Input file must be a TypeScript file (.ts or .tsx)`);
    process.exit(1);
  }

  console.log(`Building Nix flake from: ${inputFile}`);

  try {
    const output = await executeTypeScriptFile(resolvedInput);

    if (!output) {
      console.error(
        "Error: No output generated. Make sure your TypeScript file logs the flake output using console.log()"
      );
      process.exit(1);
    }

    // Determine output file name
    const resolvedOutput =
      outputFile ||
      join(
        dirname(resolvedInput),
        basename(resolvedInput, ext) + ".nix"
      );

    writeFileSync(resolvedOutput, output, "utf-8");
    console.log(`✓ Generated: ${resolvedOutput}`);
  } catch (err) {
    console.error("Error building flake:");
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(err);
    }
    process.exit(1);
  }
}

function initTemplate(outputFile?: string): void {
  const template = `import { FlakeBuilder } from "nixts";

// Create a basic flake with a development shell
const flake = new FlakeBuilder()
  .withDescription("My Nix flake built with nixts")
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
  .addDevShell("default", (shell) => {
    shell
      .withPackages([
        "git",
        "nodejs",
        "python3",
      ])
      .withPythonPackages([
        "numpy",
        "pandas",
      ]);
  })
  .build();

// Output the generated flake
console.log(flake);
`;

  const fileName = outputFile || "flake.ts";
  const resolvedOutput = resolve(process.cwd(), fileName);

  if (existsSync(resolvedOutput)) {
    console.error(`Error: File already exists: ${fileName}`);
    console.error("Please choose a different name or remove the existing file.");
    process.exit(1);
  }

  writeFileSync(resolvedOutput, template, "utf-8");
  console.log(`✓ Created template: ${fileName}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Edit ${fileName} to customize your flake`);
  console.log(`  2. Run: nixts build ${fileName}`);
  console.log(`  3. Use the generated .nix file with: nix develop`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  switch (options.command) {
    case "help":
      printHelp();
      break;
    case "version":
      printVersion();
      break;
    case "build":
      if (!options.inputFile) {
        console.error("Error: No input file specified\n");
        printHelp();
        process.exit(1);
      }
      if (options.watch) {
        console.error("Error: Watch mode is not yet implemented");
        process.exit(1);
      }
      await buildFlake(options.inputFile, options.outputFile);
      break;
    case "init":
      initTemplate(options.inputFile);
      break;
    default:
      printHelp();
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
