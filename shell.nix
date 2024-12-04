{ pkgs ? import <nixpkgs> {} }:

# List of required environment variables
let
  requiredVars = [ "APPLICATION_ID" ];
  envFile = ./.env;  # Path to the .env file
  envFileContent = builtins.readFile envFile;
  envLines = pkgs.lib.strings.splitString "\n" envFileContent;
  envVars = builtins.concatStringsSep ", " envLines;

  # Function to validate the .env file
  validateEnv = let
    # Read the content of the .env file

    # Find missing environment variables
	missingVars = builtins.filter (var: builtins.match (var) envVars == null) requiredVars;
	stringMissingVars = builtins.concatStringsSep ", " missingVars;
  in
    if builtins.length missingVars > 0 then
      throw "Missing required environment variables: ${stringMissingVars}"
    else
      "echo Everythings fine";
in

pkgs.mkShell {
  name = "env-checker";

  # Dependencies (you can add more as needed)
  buildInputs = [ pkgs.coreutils ];

  # Shell hook to validate .env and export variables
  shellHook = ''
    # Validate the .env file and required variables
	${validateEnv}

    # If validation passes, load environment variables from the .env file
    export $(grep -v '^#' $envFile | xargs)

    echo ".env file validation successful. All required variables are present."
  '';
}
