import pkgs from "./data/python-packages.json" assert { type: "json" };

export const PythonPackages = new Set(pkgs as string[]);

export function validatePythonPackages(names: string[]): string[] {
  return names.filter(name => !PythonPackages.has(name));
}
