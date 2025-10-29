/**
 * Home Manager Typed Configuration Example
 *
 * This example demonstrates how to use the HomeManagerBuilder with full type hints
 * for all 4,701 home-manager options.
 */

import { FlakeBuilder, HomeManagerBuilder } from "../src/index.js";

// ============================================================================
// Example: Using the typed `set()` method for full autocomplete
// ============================================================================
console.log("=== Typed Home Manager Configuration ===\n");

const flake = new FlakeBuilder()
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
  .withInput("home-manager", "github:nix-community/home-manager/release-24.05")
  .withDescription("Typed home-manager configuration with autocomplete")
  .addHomeConfiguration("developer", (home) => {
    home
      .withHomeDirectory("/home/developer")
      .withStateVersion("24.05")
      // Traditional methods with type hints for program/service names
      .enableProgram("git", {
        enable: true,
        userName: "Developer Name",
        userEmail: "dev@example.com",
        extraConfig: {
          init: { defaultBranch: "main" },
          pull: { rebase: true },
        },
      })
      .enableProgram("bash", {
        enable: true,
        bashrcExtra: "export EDITOR=vim",
      })
      .enableProgram("neovim", {
        enable: true,
        defaultEditor: true,
        viAlias: true,
        vimAlias: true,
      })
      // Using the new `set()` method with full type hints
      // Try uncommenting and typing "programs." to see autocomplete for all 351 programs!
      .set("programs", {
        tmux: {
          enable: true,
          baseIndex: 1,
          escapeTime: 0,
          keyMode: "vi",
        },
        bat: {
          enable: true,
        },
        fzf: {
          enable: true,
        },
      })
      // Set home configuration options with autocomplete
      .set("home", {
        sessionVariables: {
          EDITOR: "nvim",
          PAGER: "less",
          MANPAGER: "nvim +Man!",
        },
      })
      // The `set()` method provides autocomplete for all top-level options:
      // - accounts (calendar, contact, email)
      // - dconf, editorconfig, fonts, gtk
      // - home, i18n, launchd
      // - nix, nixpkgs, pam
      // - programs, services
      // - wayland, xdg, xsession
      .withPackages([
        "git",
        "neovim",
        "tmux",
        "ripgrep",
        "fd",
        "bat",
        "fzf",
        "jq",
      ]);
  });

console.log(flake.build());
console.log("\n");

// ============================================================================
// Example: Type-safe program names
// ============================================================================
console.log("=== Type-Safe Program Configuration ===\n");

const typedFlake = new FlakeBuilder()
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
  .withInput("home-manager", "github:nix-community/home-manager/release-24.05")
  .addHomeConfiguration("user", (home) => {
    // The enableProgram and enableService methods now only accept valid program/service names
    // Try typing an invalid program name - TypeScript will show an error!
    home
      .enableProgram("firefox", { enable: true })
      .enableProgram("vscode", { enable: true })
      .enableProgram("alacritty", { enable: true })
      .enableService("syncthing", { enable: true });
  });

console.log(typedFlake.build());
console.log("\n");

console.log("=== Benefits of Typed Configuration ===");
console.log("1. Autocomplete for all 351 programs when using enableProgram()");
console.log("2. Autocomplete for all 160 services when using enableService()");
console.log("3. Autocomplete for all top-level options when using set()");
console.log("4. Type safety - catch typos at compile time");
console.log("5. Full IDE support with inline documentation");
console.log("\n");

console.log("=== Available Programs (sample) ===");
console.log("bash, git, neovim, vim, tmux, zsh, fish");
console.log("firefox, chromium, brave");
console.log("vscode, emacs, helix");
console.log("alacritty, kitty, wezterm");
console.log("...and 340+ more!");
console.log("\n");

console.log("=== Available Services (sample) ===");
console.log("syncthing, gpg-agent, ssh-agent");
console.log("dunst, polybar, picom");
console.log("...and 155+ more!");
