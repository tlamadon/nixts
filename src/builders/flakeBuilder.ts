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

  /**
   * Add a dev shell using callback-style DSL (returns FlakeBuilder for chaining)
   * @param name - Name of the dev shell
   * @param fn - Callback function to configure the shell
   * @returns this for method chaining
   */
  addDevShell(name: string, fn: (b: DevShellBuilder) => void): this;

  /**
   * Add a dev shell and return the builder instance for further configuration
   * @param name - Name of the dev shell
   * @returns The DevShellBuilder instance for further chaining
   */
  addDevShell(name: string): DevShellBuilder;

  // Implementation
  addDevShell(name: string, fn?: (b: DevShellBuilder) => void): this | DevShellBuilder {
    const b = new DevShellBuilder(name);
    this.devShells.push(b);

    if (fn) {
      fn(b);
      return this; // Return FlakeBuilder for continued chaining
    }

    return b; // Return DevShellBuilder for external configuration
  }

  /**
   * Add a dev shell using an existing builder instance
   * Useful for external composition and reusable shell configurations
   * @param builder - Pre-configured DevShellBuilder instance
   * @returns this for method chaining
   */
  addDevShellBuilder(builder: DevShellBuilder): this {
    this.devShells.push(builder);
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
