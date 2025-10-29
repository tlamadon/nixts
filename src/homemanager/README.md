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

The home-manager options can be extracted automatically or use a curated fallback list.

### Automatic Extraction

The script tries two methods to extract options:

1. **Using NIX_PATH** (requires home-manager in channels):
   ```bash
   nix-channel --add https://github.com/nix-community/home-manager/archive/release-24.05.tar.gz home-manager
   nix-channel --update
   npm run generate:homemanager
   ```

2. **Using Nix Flakes** (requires experimental features):
   ```bash
   npm run generate:homemanager
   ```
   This will fetch home-manager from GitHub directly.

### Manual Fallback

If automatic extraction fails, the script uses a curated list of 70+ common home-manager options including:
- Core options (`home.username`, `home.homeDirectory`, etc.)
- Program configurations (`programs.git.*`, `programs.bash.*`, etc.)
- Service configurations (`services.gpg-agent.*`)
- XDG settings

This fallback list covers the most commonly used options and is sufficient for most use cases.

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

## Extending the Option List

To add more options to the fallback list, edit:
- `scripts/generate-homemanager-options.sh` (the fallback section)

To use the full auto-extracted list:
1. Set up home-manager in your Nix environment
2. Run `npm run generate:homemanager`
3. Run `npm run generate:types`

The extracted list will contain hundreds of options covering all home-manager modules.
