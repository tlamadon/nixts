import type { NixpkgsPackageName } from "../nixpkgs/types/nixpkgs-packages.js";
import type {
  HomeManagerOptions,
  ProgramName,
  ServiceName
} from "../homemanager/types/homemanager-config.js";

/**
 * Home Manager configuration options
 */
export interface HomeManagerConfig {
  username?: string;
  homeDirectory?: string;
  stateVersion?: string;
  packages?: string[];
  programs?: Record<string, any>;
  services?: Record<string, any>;
  home?: Record<string, any>;
}

/**
 * Deep partial type to allow partial configuration at any level
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Builder for Home Manager configurations
 *
 * Provides a fluent API for creating home-manager configurations that can be
 * integrated into Nix flakes.
 *
 * @example
 * ```ts
 * const homeConfig = new HomeManagerBuilder("myuser")
 *   .withHomeDirectory("/home/myuser")
 *   .withStateVersion("24.05")
 *   .withPackages(["git", "vim", "tmux"])
 *   .enableProgram("bash", {
 *     enable = true;
 *     bashrcExtra = "export EDITOR=vim";
 *   });
 * ```
 */
export class HomeManagerBuilder {
  private username: string;
  private homeDirectory?: string;
  private stateVersion: string = "24.05";
  private packages: string[] = [];
  private programs: Record<string, any> = {};
  private services: Record<string, any> = {};
  private homeConfig: Record<string, any> = {};
  private modules: string[] = [];

  constructor(username: string) {
    this.username = username;
  }

  /**
   * Set the home directory path
   */
  withHomeDirectory(path: string): this {
    this.homeDirectory = path;
    return this;
  }

  /**
   * Set the state version for home-manager
   * @param version - Home Manager state version (e.g., "24.05", "23.11")
   */
  withStateVersion(version: string): this {
    this.stateVersion = version;
    return this;
  }

  /**
   * Add packages to the home environment
   */
  withPackages(pkgs: NixpkgsPackageName[]): this {
    this.packages.push(...pkgs);
    return this;
  }

  /**
   * Enable and configure a program
   * @param name - Program name (e.g., "git", "vim", "bash")
   * @param config - Program-specific configuration
   */
  enableProgram(name: ProgramName, config: any = { enable: true }): this {
    this.programs[name] = config;
    return this;
  }

  /**
   * Enable and configure a service
   * @param name - Service name
   * @param config - Service-specific configuration
   */
  enableService(name: ServiceName, config: any = { enable: true }): this {
    this.services[name] = config;
    return this;
  }

  /**
   * Set arbitrary home-manager configuration
   * @param path - Configuration path (e.g., "file", "sessionVariables")
   * @param value - Configuration value
   */
  setHomeConfig(path: string, value: any): this {
    this.homeConfig[path] = value;
    return this;
  }

  /**
   * Set any home-manager option with full type hints
   * @param path - Option path (e.g., "programs.git.enable", "home.sessionVariables")
   * @param value - Option value
   *
   * @example
   * ```ts
   * builder.set("programs.git.enable", true)
   *   .set("programs.git.userName", "John Doe")
   *   .set("home.sessionVariables", { EDITOR: "vim" })
   * ```
   */
  set<K extends keyof HomeManagerOptions>(
    path: K,
    value: DeepPartial<HomeManagerOptions[K]>
  ): this {
    const parts = (path as string).split('.');

    if (parts[0] === 'programs' && parts.length >= 2) {
      const programName = parts[1];
      if (parts.length === 2) {
        this.programs[programName] = value;
      } else {
        if (!this.programs[programName]) {
          this.programs[programName] = {};
        }
        const subPath = parts.slice(2).join('.');
        this.setNestedValue(this.programs[programName], subPath, value);
      }
    } else if (parts[0] === 'services' && parts.length >= 2) {
      const serviceName = parts[1];
      if (parts.length === 2) {
        this.services[serviceName] = value;
      } else {
        if (!this.services[serviceName]) {
          this.services[serviceName] = {};
        }
        const subPath = parts.slice(2).join('.');
        this.setNestedValue(this.services[serviceName], subPath, value);
      }
    } else if (parts[0] === 'home' && parts.length >= 2) {
      const subPath = parts.slice(1).join('.');
      this.setNestedValue(this.homeConfig, subPath, value);
    } else {
      // For top-level options like stateVersion, username, etc.
      const rootPath = parts[0];
      if (rootPath === 'home') {
        Object.assign(this.homeConfig, value);
      }
    }

    return this;
  }

  /**
   * Helper method to set nested values in an object
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }

  /**
   * Add a custom home-manager module path
   * @param modulePath - Path to the module file
   */
  addModule(modulePath: string): this {
    this.modules.push(modulePath);
    return this;
  }

  /**
   * Build the configuration AST
   */
  buildAst(): HomeManagerConfig {
    return {
      username: this.username,
      homeDirectory: this.homeDirectory,
      stateVersion: this.stateVersion,
      packages: this.packages,
      programs: this.programs,
      services: this.services,
      home: this.homeConfig,
    };
  }

  /**
   * Convert object to Nix attribute set notation
   */
  private toNixValue(value: any, indent: number = 0): string {
    const indentStr = "  ".repeat(indent);
    const nextIndentStr = "  ".repeat(indent + 1);

    if (typeof value === "string") {
      return `"${value}"`;
    } else if (typeof value === "number") {
      return String(value);
    } else if (typeof value === "boolean") {
      return value ? "true" : "false";
    } else if (Array.isArray(value)) {
      if (value.length === 0) return "[]";
      const items = value.map(v => `${nextIndentStr}${this.toNixValue(v, indent + 1)}`).join("\n");
      return `[\n${items}\n${indentStr}]`;
    } else if (typeof value === "object" && value !== null) {
      const entries = Object.entries(value);
      if (entries.length === 0) return "{}";
      const items = entries
        .map(([k, v]) => `${nextIndentStr}${k} = ${this.toNixValue(v, indent + 1)};`)
        .join("\n");
      return `{\n${items}\n${indentStr}}`;
    }
    return "null";
  }

  /**
   * Generate Nix configuration code
   */
  toNix(): string {
    const parts: string[] = [];

    // Basic home configuration
    parts.push(`    home.username = "${this.username}";`);

    if (this.homeDirectory) {
      parts.push(`    home.homeDirectory = "${this.homeDirectory}";`);
    }

    parts.push(`    home.stateVersion = "${this.stateVersion}";`);

    // Packages
    if (this.packages.length > 0) {
      const pkgsList = this.packages.map(p => `pkgs.${p}`).join(" ");
      parts.push(`    home.packages = with pkgs; [ ${pkgsList} ];`);
    }

    // Programs
    Object.entries(this.programs).forEach(([name, config]) => {
      const nixConfig = this.toNixValue(config, 2).replace(/^{\n/, "").replace(/\n    }$/, "");
      parts.push(`    programs.${name} = {\n${nixConfig}\n    };`);
    });

    // Services
    Object.entries(this.services).forEach(([name, config]) => {
      const nixConfig = this.toNixValue(config, 2).replace(/^{\n/, "").replace(/\n    }$/, "");
      parts.push(`    services.${name} = {\n${nixConfig}\n    };`);
    });

    // Additional home config
    Object.entries(this.homeConfig).forEach(([path, value]) => {
      parts.push(`    home.${path} = ${this.toNixValue(value, 1)};`);
    });

    return parts.join("\n");
  }

  /**
   * Get the username for this configuration
   */
  getUsername(): string {
    return this.username;
  }

  /**
   * Get the list of custom modules
   */
  getModules(): string[] {
    return this.modules;
  }
}
