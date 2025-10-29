# nixts

A TypeScript DSL to build Nix flakes declaratively with full IDE autocomplete support.

## Features

- **Type-safe package names**: Autocomplete for 24,000+ nixpkgs packages and 10,000+ Python packages
- **Builder pattern**: Fluent API for constructing Nix flakes
- **Runtime validation**: Validates package names against actual nixpkgs data
- **TypeScript-first**: Full type safety and IDE support

## Example

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
