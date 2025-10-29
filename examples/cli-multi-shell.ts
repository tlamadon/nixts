import { FlakeBuilder } from "../src/index.js";

// Multiple development shells for different purposes
const flake = new FlakeBuilder()
  .withDescription("Project with multiple development environments")
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
  .addDevShell("frontend", (shell) => {
    shell.withPackages([
      "nodejs",
      "yarn",
      "git",
    ]);
  })
  .addDevShell("backend", (shell) => {
    shell.withPackages([
      "go",
      "postgresql",
      "redis",
      "git",
    ]);
  })
  .addDevShell("data", (shell) => {
    shell
      .withPackages([
        "python3",
        "git",
      ])
      .withPythonPackages([
        "pandas",
        "numpy",
        "sqlalchemy",
      ]);
  })
  .build();

console.log(flake);
