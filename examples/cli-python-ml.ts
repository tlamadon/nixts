import { FlakeBuilder } from "../src/index.js";

// Machine learning development environment with Python packages
const flake = new FlakeBuilder()
  .withDescription("Python ML development environment")
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
  .addDevShell("default", (shell) => {
    shell
      .withPackages([
        "git",
        "python3",
        "python3Packages.pip",
      ])
      .withPythonPackages([
        "numpy",
        "pandas",
        "scikit-learn",
        "matplotlib",
        "jupyter",
      ]);
  })
  .build();

console.log(flake);
