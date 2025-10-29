/**
 * Composition Styles Examples
 *
 * This example demonstrates three different ways to compose dev shells:
 * 1. Callback-style (original, most concise for simple cases)
 * 2. Returned builder instance (flexible, allows further modification)
 * 3. External builder (best for reusable configurations)
 */

import { FlakeBuilder, DevShellBuilder } from "../src/index.js";

// ============================================================================
// Style 1: Callback-style (original, nested declarative DSL)
// ============================================================================
// Best for: Simple, inline configurations
const flake1 = new FlakeBuilder()
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
  .withDescription("Example using callback style")
  .addDevShell("python-env", (shell) => {
    shell
      .withPythonPackages(["numpy", "pandas", "scikit-learn"])
      .withPackages(["git", "curl"])
      .withSystem("x86_64-linux");
  });

console.log("=== Style 1: Callback ===");
console.log(flake1.build());
console.log();

// ============================================================================
// Style 2: Returned builder instance (flexibility)
// ============================================================================
// Best for: When you need to modify the shell after creation or apply
//          conditional logic
const flake2 = new FlakeBuilder()
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
  .withDescription("Example using returned builder instance");

// addDevShell now returns the DevShellBuilder instance!
const mlShell = flake2
  .addDevShell("ml-environment")
  .withPythonPackages(["tensorflow", "torch", "numpy"])
  .withPackages(["git", "python3"]);

// You can continue modifying the shell later
if (process.env.GPU_ENABLED) {
  mlShell.withPackages(["cudatoolkit"]);
}

// Or add more python packages conditionally
const extraPackages = ["matplotlib", "jupyter"];
mlShell.withPythonPackages(extraPackages);

console.log("=== Style 2: Returned Builder ===");
console.log(flake2.build());
console.log();

// ============================================================================
// Style 3: External composition (reusable configurations)
// ============================================================================
// Best for: Sharing common configurations across projects or teams

// Define reusable shell configurations
function createNodeDevShell(name: string): DevShellBuilder {
  return new DevShellBuilder(name)
    .withPackages(["nodejs", "yarn", "git"])
    .withSystem("x86_64-linux");
}

function createPythonDataScienceShell(name: string): DevShellBuilder {
  return new DevShellBuilder(name)
    .withPythonPackages([
      "numpy",
      "pandas",
      "scikit-learn",
      "matplotlib",
      "jupyter",
      "seaborn",
    ])
    .withPackages(["git", "python3"])
    .withSystem("x86_64-linux");
}

// Compose using external builders
const flake3 = new FlakeBuilder()
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
  .withDescription("Example using external composition")
  .addDevShellBuilder(createNodeDevShell("frontend"))
  .addDevShellBuilder(createPythonDataScienceShell("data-science"));

console.log("=== Style 3: External Composition ===");
console.log(flake3.build());
console.log();

// ============================================================================
// Style 4: Hybrid approach (combining all styles)
// ============================================================================
// Best for: Complex projects with both shared and custom configurations

const baseBackendShell = new DevShellBuilder("backend")
  .withPackages(["postgresql", "redis", "git"])
  .withPythonPackages(["django", "celery", "psycopg2"]);

const flake4 = new FlakeBuilder()
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
  .withDescription("Hybrid composition example")
  // Use external builder for the base
  .addDevShellBuilder(baseBackendShell)
  // Use callback style for simple inline shells
  .addDevShell("testing", (shell) => {
    shell
      .withPythonPackages(["pytest", "pytest-cov", "pytest-django"])
      .withPackages(["git"]);
  });

// You can also use the returned instance with addDevShell
const frontendShell = flake4.addDevShell("frontend-dev");
frontendShell
  .withPackages(["nodejs", "yarn", "chromium"])
  .withSystem("x86_64-linux");

console.log("=== Style 4: Hybrid Approach ===");
console.log(flake4.build());
console.log();

// ============================================================================
// Style 5: Factory pattern for DRY configurations
// ============================================================================

class DevShellTemplates {
  static commonPackages = ["git", "curl", "jq", "ripgrep"] as const;

  static withCommonTools(builder: DevShellBuilder): DevShellBuilder {
    return builder.withPackages([...this.commonPackages]);
  }

  static createFullStackShell(name: string): DevShellBuilder {
    const shell = new DevShellBuilder(name)
      .withPackages(["nodejs", "postgresql", "redis"])
      .withPythonPackages(["django", "fastapi"]);

    return this.withCommonTools(shell);
  }
}

const flake5 = new FlakeBuilder()
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
  .withDescription("Factory pattern example")
  .addDevShellBuilder(
    DevShellTemplates.createFullStackShell("full-stack-app")
  );

console.log("=== Style 5: Factory Pattern ===");
console.log(flake5.build());
