import { DevShellBuilder } from "./devShellBuilder.js";
import { HomeManagerBuilder } from "./homeManagerBuilder.js";

export class FlakeBuilder {
  private inputs: Record<string, string> = {};
  private devShells: DevShellBuilder[] = [];
  private homeConfigurations: HomeManagerBuilder[] = [];
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

  /**
   * Add a home-manager configuration using callback-style DSL
   * @param username - Username for the home-manager configuration
   * @param fn - Callback function to configure the home
   * @returns this for method chaining
   */
  addHomeConfiguration(username: string, fn: (b: HomeManagerBuilder) => void): this;

  /**
   * Add a home-manager configuration and return the builder instance
   * @param username - Username for the home-manager configuration
   * @returns The HomeManagerBuilder instance for further chaining
   */
  addHomeConfiguration(username: string): HomeManagerBuilder;

  // Implementation
  addHomeConfiguration(username: string, fn?: (b: HomeManagerBuilder) => void): this | HomeManagerBuilder {
    const b = new HomeManagerBuilder(username);
    this.homeConfigurations.push(b);

    if (fn) {
      fn(b);
      return this; // Return FlakeBuilder for continued chaining
    }

    return b; // Return HomeManagerBuilder for external configuration
  }

  /**
   * Add a home-manager configuration using an existing builder instance
   * Useful for external composition and reusable home configurations
   * @param builder - Pre-configured HomeManagerBuilder instance
   * @returns this for method chaining
   */
  addHomeConfigurationBuilder(builder: HomeManagerBuilder): this {
    this.homeConfigurations.push(builder);
    return this;
  }

  build(): string {
    const inputLines = Object.entries(this.inputs)
      .map(([n, u]) => `    ${n}.url = "${u}";`)
      .join("\n");

    const shells = this.devShells.map(s => s.toNix()).join("\n");

    // Build home-manager configurations
    const homeConfigs = this.homeConfigurations.map(hm => {
      const username = hm.getUsername();
      const modules = hm.getModules();
      const modulesList = modules.length > 0
        ? modules.map(m => `        ${m}`).join("\n") + "\n"
        : "";

      return `      ${username} = home-manager.lib.homeManagerConfiguration {
        pkgs = nixpkgs.legacyPackages.x86_64-linux;
        modules = [
${modulesList}          {
${hm.toNix()}
          }
        ];
      };`;
    }).join("\n");

    // Determine which outputs to include
    const hasDevShells = this.devShells.length > 0;
    const hasHomeConfigs = this.homeConfigurations.length > 0;

    let outputsSection = "";

    if (hasDevShells && hasHomeConfigs) {
      outputsSection = `  outputs = { self, nixpkgs, home-manager }: let
    pkgs = import nixpkgs { system = "x86_64-linux"; };
  in {
    devShells.x86_64-linux = {
${shells}
    };

    homeConfigurations = {
${homeConfigs}
    };
  };`;
    } else if (hasDevShells) {
      outputsSection = `  outputs = { self, nixpkgs }: let
    pkgs = import nixpkgs { system = "x86_64-linux"; };
  in {
    devShells.x86_64-linux = {
${shells}
    };
  };`;
    } else if (hasHomeConfigs) {
      outputsSection = `  outputs = { self, nixpkgs, home-manager }:
  {
    homeConfigurations = {
${homeConfigs}
    };
  };`;
    } else {
      outputsSection = `  outputs = { self, nixpkgs }: {};`;
    }

    return `{
  description = "${this.description}";
  inputs = {
${inputLines}
  };

${outputsSection}
}`;
  }
}
