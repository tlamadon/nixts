#!/usr/bin/env bash
# Generate home-manager option names for type generation
# This script extracts all home-manager option paths from the home-manager documentation

set -e

OUTPUT_FILE="src/homemanager/data/homemanager-options.json"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Generating home-manager options..."

# Primary method: Scrape from official documentation (most reliable and complete)
echo "Scraping options from home-manager documentation website..."
if curl -sL "https://nix-community.github.io/home-manager/options.xhtml" 2>/dev/null | \
  grep -o 'id="opt-[^"]*"' | \
  sed 's/id="opt-//; s/"$//' | \
  sed 's/_name_/<name>/g' | \
  sort -u | \
  jq -R -s 'split("\n") | map(select(length > 0))' > "$OUTPUT_FILE" 2>/dev/null; then

  if [ -s "$OUTPUT_FILE" ]; then
    OPTION_COUNT=$(jq 'length' "$OUTPUT_FILE")
    if [ "$OPTION_COUNT" -gt 100 ]; then
      echo "✓ Successfully scraped $OPTION_COUNT home-manager options from documentation!"
      echo "✓ Home-manager options generated -> $OUTPUT_FILE"
      exit 0
    fi
  fi
fi

echo "Scraping failed, trying local nix evaluation..."

# Fallback method 1: Use the dedicated nix script
if nix-instantiate --eval --strict --json "$SCRIPT_DIR/generate-homemanager-options.nix" 2>/dev/null | jq 'sort' > "$OUTPUT_FILE" 2>/dev/null; then
  if [ -s "$OUTPUT_FILE" ]; then
    OPTION_COUNT=$(jq 'length' "$OUTPUT_FILE")
    echo "✓ Successfully extracted $OPTION_COUNT home-manager options"
    echo "✓ Home-manager options generated -> $OUTPUT_FILE"
    exit 0
  fi
fi

# Fallback method 2: Provide a comprehensive manual set
echo "Warning: Could not extract options from home-manager automatically."
echo "         Using comprehensive manual option list."
echo "         For the full list of 4700+ options, ensure you have internet connectivity"
echo "         so the script can scrape from https://nix-community.github.io/home-manager/"

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
