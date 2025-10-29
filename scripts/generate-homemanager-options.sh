#!/usr/bin/env bash
# Generate home-manager option names for type generation
# This script extracts all home-manager option paths from the home-manager documentation

set -e

OUTPUT_FILE="src/homemanager/data/homemanager-options.json"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Generating home-manager options..."

# Try method 1: Use the dedicated nix script
if nix-instantiate --eval --strict --json "$SCRIPT_DIR/generate-homemanager-options.nix" 2>/dev/null | jq 'sort' > "$OUTPUT_FILE" 2>/dev/null; then
  if [ -s "$OUTPUT_FILE" ]; then
    OPTION_COUNT=$(jq 'length' "$OUTPUT_FILE")
    echo "✓ Successfully extracted $OPTION_COUNT home-manager options"
    echo "✓ Home-manager options generated -> $OUTPUT_FILE"
    exit 0
  fi
fi

# Try method 2: Use nix flake if available
echo "Trying alternative method using nix flake..."
if command -v nix &> /dev/null; then
  if nix eval --json --impure --expr '
    let
      flake = builtins.getFlake "github:nix-community/home-manager/release-24.05";
      pkgs = import <nixpkgs> {};
      lib = pkgs.lib;

      eval = lib.evalModules {
        modules = flake.nixosModules.home-manager.imports;
        specialArgs = { inherit pkgs; };
      };

      collectOptions = prefix: opts:
        lib.concatLists (lib.mapAttrsToList (name: value:
          let path = if prefix == "" then name else "${prefix}.${name}";
          in
          if value ? _type && value._type == "option"
          then [ path ]
          else if lib.isAttrs value && !value ? _type
          then collectOptions path value
          else []
        ) opts);
    in
      lib.sort (a: b: a < b) (collectOptions "" eval.options)
  ' 2>/dev/null > "$OUTPUT_FILE"; then
    if [ -s "$OUTPUT_FILE" ]; then
      OPTION_COUNT=$(jq 'length' "$OUTPUT_FILE")
      echo "✓ Successfully extracted $OPTION_COUNT home-manager options using flakes"
      echo "✓ Home-manager options generated -> $OUTPUT_FILE"
      exit 0
    fi
  fi
fi

# Fallback: Provide a comprehensive basic set
echo "Warning: Could not extract options from home-manager automatically."
echo "         Using comprehensive manual option list."
echo "         To get the full list, ensure home-manager is in your NIX_PATH:"
echo "         nix-channel --add https://github.com/nix-community/home-manager/archive/release-24.05.tar.gz home-manager"
echo "         nix-channel --update"

cat > "$OUTPUT_FILE" << 'EOF'
[
  "home.username",
  "home.homeDirectory",
  "home.stateVersion",
  "home.packages",
  "home.file",
  "home.sessionVariables",
  "home.sessionPath",
  "home.keyboard",
  "home.language",
  "home.enableNixpkgsReleaseCheck",
  "programs.bash.enable",
  "programs.bash.shellAliases",
  "programs.bash.bashrcExtra",
  "programs.bash.profileExtra",
  "programs.bash.initExtra",
  "programs.git.enable",
  "programs.git.userName",
  "programs.git.userEmail",
  "programs.git.signing",
  "programs.git.aliases",
  "programs.git.extraConfig",
  "programs.git.ignores",
  "programs.git.includes",
  "programs.vim.enable",
  "programs.vim.plugins",
  "programs.vim.settings",
  "programs.vim.extraConfig",
  "programs.neovim.enable",
  "programs.neovim.viAlias",
  "programs.neovim.vimAlias",
  "programs.neovim.defaultEditor",
  "programs.neovim.plugins",
  "programs.neovim.extraConfig",
  "programs.tmux.enable",
  "programs.tmux.baseIndex",
  "programs.tmux.clock24",
  "programs.tmux.escapeTime",
  "programs.tmux.historyLimit",
  "programs.tmux.keyMode",
  "programs.tmux.terminal",
  "programs.tmux.plugins",
  "programs.tmux.extraConfig",
  "programs.zsh.enable",
  "programs.zsh.shellAliases",
  "programs.zsh.initExtra",
  "programs.zsh.oh-my-zsh",
  "programs.fish.enable",
  "programs.fish.shellAliases",
  "programs.fish.shellInit",
  "programs.ssh.enable",
  "programs.ssh.matchBlocks",
  "programs.ssh.extraConfig",
  "programs.gpg.enable",
  "programs.emacs.enable",
  "programs.vscode.enable",
  "programs.direnv.enable",
  "programs.fzf.enable",
  "programs.htop.enable",
  "programs.starship.enable",
  "programs.alacritty.enable",
  "programs.kitty.enable",
  "programs.zoxide.enable",
  "services.gpg-agent.enable",
  "services.gpg-agent.defaultCacheTtl",
  "services.gpg-agent.pinentryFlavor",
  "xdg.enable",
  "xdg.configHome",
  "xdg.dataHome",
  "xdg.cacheHome",
  "xdg.stateHome"
]
EOF

OPTION_COUNT=$(jq 'length' "$OUTPUT_FILE")
echo "✓ Using $OPTION_COUNT manually curated home-manager options"
echo "✓ Home-manager options generated -> $OUTPUT_FILE"
