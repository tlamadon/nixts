# nixts

A TypeScript DSL to build Nix flakes declaratively with full IDE autocomplete support.

## Features

- **Type-safe package names**: Autocomplete for 24,000+ nixpkgs packages and 10,000+ Python packages
- **Flexible composition**: Three different composition styles for maximum flexibility
- **Builder pattern**: Fluent API for constructing Nix flakes
- **Runtime validation**: Validates package names against actual nixpkgs data
- **TypeScript-first**: Full type safety and IDE support

## Quick Start

```ts
import { FlakeBuilder } from "nixts";

const flake = new FlakeBuilder()
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
  .addDevShell("pyenv", shell =>
    shell
      .withPackages(["git", "curl"])      // Autocomplete for 24k+ nixpkgs packages
      .withPythonPackages(["numpy", "pandas"])  // Autocomplete for 10k+ Python packages
  )
  .build();

console.log(flake);
```

## Composition Patterns

nixts supports three different composition styles to fit your workflow:

### 1. Callback Style (Declarative)

Best for simple, inline configurations:

```ts
const flake = new FlakeBuilder()
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
  .addDevShell("python-env", (shell) => {
    shell
      .withPythonPackages(["numpy", "pandas"])
      .withPackages(["git", "curl"]);
  })
  .build();
```

### 2. Returned Builder Instance (Flexible)

Best for conditional logic or progressive configuration:

```ts
const flake = new FlakeBuilder()
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05");

// addDevShell returns the DevShellBuilder when called without callback
const mlShell = flake
  .addDevShell("ml-env")
  .withPythonPackages(["tensorflow", "torch"]);

// Add conditional packages
if (process.env.GPU_ENABLED) {
  mlShell.withPackages(["cudatoolkit"]);
}

console.log(flake.build());
```

### 3. External Composition (Reusable)

Best for sharing configurations across projects:

```ts
import { FlakeBuilder, DevShellBuilder } from "nixts";

// Define reusable configurations
function createNodeDevShell(name: string): DevShellBuilder {
  return new DevShellBuilder(name)
    .withPackages(["nodejs", "yarn", "git"]);
}

function createPythonDataScienceShell(name: string): DevShellBuilder {
  return new DevShellBuilder(name)
    .withPythonPackages(["numpy", "pandas", "jupyter"])
    .withPackages(["git", "python3"]);
}

// Compose using pre-built shells
const flake = new FlakeBuilder()
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
  .addDevShellBuilder(createNodeDevShell("frontend"))
  .addDevShellBuilder(createPythonDataScienceShell("data-science"))
  .build();
```

See [examples/composition-styles.ts](examples/composition-styles.ts) for more advanced patterns including hybrid approaches and factory patterns.

## Autocomplete in Action

When you type `withPackages([` or `withPythonPackages([`, your IDE will show autocomplete suggestions for all available packages from nixpkgs. This includes:

- **`withPackages`**: All top-level nixpkgs packages (git, curl, python3, nodejs, etc.)
- **`withPythonPackages`**: All Python packages from `python3Packages` (numpy, pandas, tensorflow, etc.)

## Generating Package Data

To update the package lists and type definitions from your local nixpkgs:

```bash
# Generate all package data and types
npm run generate

# Or run individual steps:
npm run generate:python      # Extract Python package names
npm run generate:nixpkgs     # Extract all nixpkgs package names
npm run generate:types       # Generate TypeScript type definitions
```

This will:
1. Query your local nixpkgs installation for package names
2. Save the package lists to `src/nixpkgs/data/*.json`
3. Generate TypeScript type definitions for autocomplete
