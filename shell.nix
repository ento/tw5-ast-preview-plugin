let
  nurPkgs = builtins.fetchTarball {
    url = "https://github.com/ento/nur-packages/archive/85463ec.tar.gz";
    # nix-prefetch-url --unpack --type sha256 $url
    sha256 = "0ngikqx8kdxdldczlff5wjqc34wfqf613fy9ml7f24hnh8lsc5ga";
  };
  #nurPkgs = ../nur-packages/default.nix;
  pkgs = import <nixpkgs> {
    config = {
      packageOverrides = pkgs: {
        nur = import nurPkgs { inherit pkgs; };
      };
    };
  };
in
pkgs.mkShell {
  buildInputs = with pkgs; [
    nur.tw5-devtools
  ];
}
