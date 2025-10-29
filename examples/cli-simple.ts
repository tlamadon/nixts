import { FlakeBuilder } from "../src/index.js";

// Simple development shell for Node.js projects
const flake = new FlakeBuilder()
  .withDescription("Simple Node.js development environment")
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
  .addDevShell("default", (shell) => {
    shell.withPackages([
      "nodejs",
      "yarn",
      "git",
    ]);
  })
  .build();

console.log(flake);
