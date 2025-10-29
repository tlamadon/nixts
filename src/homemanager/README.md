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
npm run generate:homemanager:types
```

This creates:
- `homemanager-config.d.ts` - Full type definitions for all home-manager options
- `ProgramName` type - Autocomplete for 351 programs
- `ServiceName` type - Autocomplete for 160 services
- `HomeManagerOptions` interface - Complete configuration structure

## Usage in Code

The `HomeManagerBuilder` provides a fluent API with **full type hints** for all 4,701 home-manager options:

### Basic Usage

```typescript
import { HomeManagerBuilder } from "nixts";

const home = new HomeManagerBuilder("myuser")
  .withHomeDirectory("/home/myuser")
  .withStateVersion("24.05")
  .withPackages(["git", "vim", "tmux"])
  // Type-safe program names with autocomplete for all 351 programs
  .enableProgram("git", {
    enable: true,
    userName: "My Name",
    userEmail: "me@example.com"
  })
  // Type-safe service names with autocomplete for all 160 services
  .enableService("syncthing", { enable: true });
```

### Advanced Usage with Full Type Hints

The `set()` method provides autocomplete for **all** home-manager options:

```typescript
const home = new HomeManagerBuilder("developer")
  .withStateVersion("24.05")
  // Full autocomplete for all top-level options
  .set("programs", {
    git: { enable: true, userName: "Dev" },
    neovim: { enable: true, defaultEditor: true },
    tmux: { enable: true, baseIndex: 1 }
  })
  .set("home", {
    sessionVariables: { EDITOR: "nvim" },
    shellAliases: { ll: "ls -la" }
  })
  .set("services", {
    "gpg-agent": { enable: true }
  });
```

### Type Safety Benefits

1. **Autocomplete** - IntelliSense shows all 351 programs and 160 services
2. **Type checking** - Catch typos at compile time (e.g., "giit" will error)
3. **Documentation** - Hover over options to see inline docs
4. **Refactoring** - Rename with confidence across your codebase

See these examples for more:
- [examples/homemanager-demo.ts](../../examples/homemanager-demo.ts) - Basic examples
- [examples/homemanager-typed-demo.ts](../../examples/homemanager-typed-demo.ts) - Type-safe examples

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
