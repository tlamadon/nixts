# Home Manager Integration

This directory contains home-manager integration for nixts, including type definitions and option extraction.

## Directory Structure

```
homemanager/
├── data/
│   └── homemanager-options.json   # Extracted home-manager option names
├── types/
│   └── homemanager-options.d.ts   # Generated TypeScript types
└── README.md
```

## Generating Home Manager Options

The home-manager options are automatically extracted from the official documentation, providing **4700+ complete option coverage**.

### Automatic Extraction (Recommended)

Simply run:
```bash
npm run generate:homemanager
```

This command:
1. **Primary method**: Scrapes all 4701 options from the official home-manager documentation
   - Source: `https://nix-community.github.io/home-manager/`
   - **No local home-manager installation required**
   - Only needs internet connectivity
   - Most reliable and complete method
   - Covers ALL home-manager modules and options

2. **Fallback method**: Uses local Nix evaluation if scraping fails
   - Requires home-manager in NIX_PATH or as a channel
   - Falls back to curated list of 70 common options if all else fails

### Complete Option Coverage

The extracted 4701 options include:
- **Core options**: `home.*` (username, homeDirectory, stateVersion, packages, etc.)
- **Programs**: `programs.*` for 200+ programs
  - Development: git, neovim, vim, vscode, emacs
  - Shells: bash, zsh, fish, nushell
  - Terminal: tmux, alacritty, kitty, wezterm
  - And many more...
- **Services**: `services.*` (gpg-agent, syncthing, dunst, etc.)
- **Accounts**: `accounts.*` (email, calendar, contacts)
- **XDG settings**: `xdg.*` (configHome, dataHome, stateHome, etc.)
- **File management**: `home.file.*` for declarative file management
- **Session variables**: `home.sessionVariables.*`

## Type Generation

After extracting options, generate TypeScript types:

```bash
npm run generate:types
```

This creates `homemanager-options.d.ts` with the `HomeManagerOptionName` type that provides autocomplete for option names.

## Usage in Code

The `HomeManagerBuilder` provides a fluent API for building home-manager configurations:

```typescript
import { HomeManagerBuilder } from "nixts";

const home = new HomeManagerBuilder("myuser")
  .withHomeDirectory("/home/myuser")
  .withStateVersion("24.05")
  .withPackages(["git", "vim", "tmux"])
  .enableProgram("git", {
    enable: true,
    userName: "My Name",
    userEmail: "me@example.com"
  });
```

See [examples/homemanager-demo.ts](../../examples/homemanager-demo.ts) for comprehensive examples.

## Updating Options

To get the latest options:

1. Update the extraction (pulls from latest documentation):
   ```bash
   npm run generate:homemanager
   ```

2. Regenerate TypeScript types:
   ```bash
   npm run generate:types
   ```

3. Rebuild the project:
   ```bash
   npm run build
   ```

Or run all at once:
```bash
npm run generate && npm run build
```

The scraper will automatically fetch the latest options from the official home-manager documentation.
