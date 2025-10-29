export { FlakeBuilder } from "./builders/flakeBuilder.js";
export { DevShellBuilder } from "./builders/devShellBuilder.js";
export { PythonPackages } from "./nixpkgs/python.js";

// Export type definitions for autocomplete
export type { PythonPackageName } from "./nixpkgs/types/python-packages.js";
export type { NixpkgsPackageName } from "./nixpkgs/types/nixpkgs-packages.js";
