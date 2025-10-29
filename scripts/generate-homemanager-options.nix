# Script to extract all home-manager option paths
# This generates a JSON list of all available option paths

let
  pkgs = import <nixpkgs> {};
  lib = pkgs.lib;

  # Try to load home-manager from multiple sources
  hmPath =
    if builtins.pathExists <home-manager>
    then <home-manager>
    else if builtins.pathExists (pkgs.path + "/nixos/modules/home-manager")
    then pkgs.path + "/nixos/modules/home-manager"
    else throw "home-manager not found. Please add home-manager to your nix channels or NIX_PATH";

  # Load home-manager modules
  hmLib = import (hmPath + "/modules/lib/stdlib-extended.nix") pkgs.lib;

  # Create a minimal evaluation to extract options
  eval = hmLib.evalModules {
    modules = [
      (hmPath + "/modules/modules.nix")
      {
        # Dummy configuration to satisfy module system
        config = {
          _module.args = {
            pkgs = pkgs;
            osConfig = {};
            format = "unknown";
          };
        };
      }
    ];
  };

  # Recursively collect all option paths
  collectOptions = prefix: opts:
    lib.concatLists (
      lib.mapAttrsToList (name: value:
        let
          path = if prefix == "" then name else "${prefix}.${name}";
        in
        if value ? _type && value._type == "option"
        then [ path ]
        else if lib.isAttrs value && !value ? _type
        then collectOptions path value
        else []
      ) opts
    );

  allOptions = collectOptions "" eval.options;

in
  # Return sorted list
  lib.sort (a: b: a < b) allOptions
