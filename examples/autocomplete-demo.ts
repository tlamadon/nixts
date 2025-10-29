/**
 * Autocomplete Demo
 *
 * This example demonstrates IDE autocomplete for nixpkgs packages.
 * Try typing the following in your IDE to see autocomplete in action:
 *
 * 1. Type: devShell.withPythonPackages(["num..."])
 *    Expected: IDE suggests "numpy", "numba", "numexpr", etc.
 *
 * 2. Type: devShell.withPackages(["git", "cur..."])
 *    Expected: IDE suggests "curl", "curlie", etc.
 *
 * 3. Try invalid packages (TypeScript will show errors):
 *    devShell.withPythonPackages(["not-a-real-package"])
 */

import { DevShellBuilder } from "../src/builders/devShellBuilder.js";

// Create a development shell with autocomplete support
const devShell = new DevShellBuilder("ml-environment")
  // Type "numpy" and press Ctrl+Space to see all Python packages
  .withPythonPackages([
    "numpy",
    "pandas",
    "scikit-learn",
    "matplotlib",
    "jupyter",
    "tensorflow",
  ])
  // Type "git" and press Ctrl+Space to see all nixpkgs packages
  .withPackages([
    "git",
    "curl",
    "jq",
    "ripgrep",
    "fd",
  ])
  .withSystem("x86_64-linux");

console.log(devShell.toNix());
