import { DevShellBuilder } from "./devShellBuilder.js";

export class FlakeBuilder {
  private inputs: Record<string, string> = {};
  private devShells: DevShellBuilder[] = [];
  private description: string = "";

  withInput(name: string, url: string): this {
    this.inputs[name] = url;
    return this;
  }

  withDescription(desc: string): this {
    this.description = desc;
    return this;
  }

  addDevShell(name: string, fn: (b: DevShellBuilder) => void): this {
    const b = new DevShellBuilder(name);
    fn(b);
    this.devShells.push(b);
    return this;
  }

  build(): string {
    const inputLines = Object.entries(this.inputs)
      .map(([n, u]) => `    ${n}.url = "${u}";`)
      .join("\n");

    const shells = this.devShells.map(s => s.toNix()).join("\n");

    return `{
  description = "${this.description}";
  inputs = {
${inputLines}
  };

  outputs = { self, nixpkgs }: let
    pkgs = import nixpkgs { system = "x86_64-linux"; };
  in {
    devShells.x86_64-linux = {
${shells}
    };
  };
}`;
  }
}
