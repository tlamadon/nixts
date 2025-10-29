import { FlakeBuilder } from "../src/index.js";

// Home-manager configuration with programs and packages
const flake = new FlakeBuilder()
  .withDescription("Personal home-manager configuration")
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
  .withInput("home-manager", "github:nix-community/home-manager/release-24.05")
  .addHomeConfiguration("myuser", (home) => {
    home
      .withHomeDirectory("/home/myuser")
      .withStateVersion("24.05")
      .withPackages([
        "git",
        "neovim",
        "tmux",
        "ripgrep",
        "fd",
        "bat",
        "fzf",
      ])
      .enableProgram("git", {
        enable: true,
        userName: "Your Name",
        userEmail: "your.email@example.com",
        extraConfig: {
          init: { defaultBranch: "main" },
          pull: { rebase: false },
        },
      })
      .enableProgram("bash", {
        enable: true,
        enableCompletion: true,
        shellAliases: {
          ll: "ls -la",
          gs: "git status",
          gd: "git diff",
        },
      })
      .set("home", {
        sessionVariables: {
          EDITOR: "nvim",
          VISUAL: "nvim",
        },
      });
  })
  .build();

console.log(flake);
