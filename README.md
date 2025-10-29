# nixts

A TypeScript DSL to build Nix flakes declaratively.

## Example

```ts
import { FlakeBuilder } from "nixts";

const flake = new FlakeBuilder()
  .withInput("nixpkgs", "github:NixOS/nixpkgs/nixos-24.05")
  .addDevShell("pyenv", shell =>
    shell
      .withPackages(["git", "curl"])
      .withPythonPackages(["numpy", "pandas"])
  )
  .build();

console.log(flake);
```

## Generating Python package list

```bash
npm run generate:python
```

This updates `src/nixpkgs/data/python-packages.json`.
