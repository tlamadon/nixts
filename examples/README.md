# Examples

This directory contains examples demonstrating various features of nixts.

## Running Examples

Use `tsx` to run any example:

```bash
npx tsx examples/autocomplete-demo.ts
npx tsx examples/composition-styles.ts
```

## Available Examples

### [autocomplete-demo.ts](autocomplete-demo.ts)

Demonstrates IDE autocomplete features for package names:
- Autocomplete for Python packages (`withPythonPackages`)
- Autocomplete for nixpkgs packages (`withPackages`)
- Type safety and validation

### [composition-styles.ts](composition-styles.ts)

Comprehensive guide to different composition patterns:

1. **Callback Style** - Declarative, nested DSL approach
2. **Returned Builder Instance** - Flexible approach for conditional logic
3. **External Composition** - Reusable shell configurations
4. **Hybrid Approach** - Combining multiple patterns
5. **Factory Pattern** - DRY configurations with templates

### [homemanager-demo.ts](homemanager-demo.ts)

Demonstrates home-manager configuration builder:
- Creating home-manager configurations with the `HomeManagerBuilder`
- Configuring programs (git, bash, neovim, tmux, etc.)
- Setting up packages and environment variables
- Integrating home-manager into flakes
- Combining dev shells and home-manager configurations
- Using custom home-manager modules
- Reusable home configuration patterns

## Creating Your Own Examples

Feel free to create your own example files in this directory to experiment with nixts features. All TypeScript files here can be run directly with `tsx`.
