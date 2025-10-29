/**
 * Home Manager Configuration Examples
 *
 * This example demonstrates how to use the HomeManagerBuilder to create
 * home-manager configurations that can be integrated into Nix flakes.
 */

import { FlakeBuilder, HomeManagerBuilder } from "../src/index.js";

// ============================================================================
// Example 1: Simple home-manager configuration with callback style
// ============================================================================
console.log("=== Example 1: Simple Home Manager Configuration ===");

const flake1 = new FlakeBuilder()
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
  .withInput("home-manager", "github:nix-community/home-manager/release-24.05")
  .withDescription("Simple home-manager configuration example")
  .addHomeConfiguration("myuser", (home) => {
    home
      .withHomeDirectory("/home/myuser")
      .withStateVersion("24.05")
      .withPackages(["git", "vim", "tmux", "htop", "curl"])
      .enableProgram("bash", {
        enable: true,
        bashrcExtra: "export EDITOR=vim",
      })
      .enableProgram("git", {
        enable: true,
        userName: "My Name",
        userEmail: "myemail@example.com",
      });
  });

console.log(flake1.build());
console.log("\n");

// ============================================================================
// Example 2: Advanced configuration with multiple programs
// ============================================================================
console.log("=== Example 2: Advanced Configuration ===");

const flake2 = new FlakeBuilder()
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
  .withInput("home-manager", "github:nix-community/home-manager/release-24.05")
  .withDescription("Advanced home-manager with multiple programs");

const homeConfig = flake2
  .addHomeConfiguration("developer")
  .withHomeDirectory("/home/developer")
  .withStateVersion("24.05")
  .withPackages([
    "git",
    "neovim",
    "tmux",
    "ripgrep",
    "fd",
    "bat",
    "exa",
    "fzf",
    "jq",
  ])
  .enableProgram("git", {
    enable: true,
    userName: "Developer",
    userEmail: "dev@example.com",
    extraConfig: {
      init: { defaultBranch: "main" },
      pull: { rebase: true },
    },
  })
  .enableProgram("tmux", {
    enable: true,
    baseIndex: 1,
    escapeTime: 0,
    keyMode: "vi",
  })
  .enableProgram("neovim", {
    enable: true,
    defaultEditor: true,
    viAlias: true,
    vimAlias: true,
  })
  .setHomeConfig("sessionVariables", {
    EDITOR: "nvim",
    PAGER: "less",
    MANPAGER: "nvim +Man!",
  });

console.log(flake2.build());
console.log("\n");

// ============================================================================
// Example 3: Combined dev shell and home-manager configuration
// ============================================================================
console.log("=== Example 3: Combined DevShell and Home Manager ===");

const flake3 = new FlakeBuilder()
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
  .withInput("home-manager", "github:nix-community/home-manager/release-24.05")
  .withDescription("Flake with both dev shells and home-manager")
  // Add a dev shell
  .addDevShell("python-dev", (shell) => {
    shell
      .withPythonPackages(["numpy", "pandas", "jupyter"])
      .withPackages(["git", "python3"]);
  })
  // Add a home-manager configuration
  .addHomeConfiguration("dataScientist", (home) => {
    home
      .withHomeDirectory("/home/datascientist")
      .withStateVersion("24.05")
      .withPackages([
        "git",
        "vim",
        "python3",
        "jupyter",
        "vscode",
      ])
      .enableProgram("git", {
        enable: true,
        userName: "Data Scientist",
        userEmail: "ds@example.com",
      })
      .enableProgram("bash", {
        enable: true,
        shellAliases: {
          ll: "ls -la",
          gs: "git status",
          gd: "git diff",
        },
      });
  });

console.log(flake3.build());
console.log("\n");

// ============================================================================
// Example 4: External composition with reusable home configurations
// ============================================================================
console.log("=== Example 4: External Composition ===");

// Define reusable home configurations
function createDeveloperHome(username: string): HomeManagerBuilder {
  return new HomeManagerBuilder(username)
    .withStateVersion("24.05")
    .withPackages([
      "git",
      "neovim",
      "tmux",
      "ripgrep",
      "fd",
      "bat",
    ])
    .enableProgram("git", {
      enable: true,
      extraConfig: {
        init: { defaultBranch: "main" },
        pull: { rebase: true },
      },
    })
    .enableProgram("neovim", {
      enable: true,
      defaultEditor: true,
      viAlias: true,
      vimAlias: true,
    });
}

function createMinimalHome(username: string): HomeManagerBuilder {
  return new HomeManagerBuilder(username)
    .withStateVersion("24.05")
    .withPackages(["git", "vim", "curl"])
    .enableProgram("bash", { enable: true });
}

const flake4 = new FlakeBuilder()
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
  .withInput("home-manager", "github:nix-community/home-manager/release-24.05")
  .withDescription("Reusable home configurations")
  .addHomeConfigurationBuilder(
    createDeveloperHome("dev1").withHomeDirectory("/home/dev1")
  )
  .addHomeConfigurationBuilder(
    createDeveloperHome("dev2").withHomeDirectory("/home/dev2")
  )
  .addHomeConfigurationBuilder(
    createMinimalHome("minimal").withHomeDirectory("/home/minimal")
  );

console.log(flake4.build());
console.log("\n");

// ============================================================================
// Example 5: With custom modules
// ============================================================================
console.log("=== Example 5: With Custom Modules ===");

const flake5 = new FlakeBuilder()
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
  .withInput("home-manager", "github:nix-community/home-manager/release-24.05")
  .withDescription("Home-manager with custom modules")
  .addHomeConfiguration("advanced", (home) => {
    home
      .withHomeDirectory("/home/advanced")
      .withStateVersion("24.05")
      .withPackages(["git", "vim"])
      .addModule("./modules/custom-programs.nix")
      .addModule("./modules/custom-services.nix")
      .enableProgram("git", {
        enable: true,
        userName: "Advanced User",
        userEmail: "advanced@example.com",
      });
  });

console.log(flake5.build());
console.log("\n");

console.log("=== Usage Instructions ===");
console.log("To use these configurations:");
console.log("1. Save the output to a flake.nix file");
console.log("2. Run 'nix flake update' to fetch inputs");
console.log("3. For dev shells: 'nix develop .#<shell-name>'");
console.log("4. For home-manager: 'home-manager switch --flake .#<username>'");
console.log("5. Or build: 'nix build .#homeConfigurations.<username>.activationPackage'");
