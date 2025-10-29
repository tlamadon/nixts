import { validatePythonPackages } from "../nixpkgs/python.js";

export class DevShellBuilder {
  private name: string;
  private system: string = "x86_64-linux";
  private packages: string[] = [];
  private pythonPackages: string[] = [];

  constructor(name: string) {
    this.name = name;
  }

  withPackages(pkgs: string[]): this {
    this.packages.push(...pkgs);
    return this;
  }

  withPythonPackages(pkgs: string[]): this {
    const invalid = validatePythonPackages(pkgs);
    if (invalid.length) {
      throw new Error(`Invalid Python packages: ${invalid.join(", ")}`);
    }
    this.pythonPackages.push(...pkgs);
    return this;
  }

  withSystem(system: string): this {
    this.system = system;
    return this;
  }

  buildAst() {
    return {
      name: this.name,
      system: this.system,
      packages: this.packages,
      pythonPackages: this.pythonPackages,
    };
  }

  toNix(): string {
    const pkgsList = this.packages.map(p => `pkgs.${p}`).join(" ");
    const pyList = this.pythonPackages.map(p => `pkgs.python3Packages.${p}`).join(" ");
    return `      ${this.name} = pkgs.mkShell {
        buildInputs = [ ${pkgsList} ${pyList} ];
      };`;
  }
}
