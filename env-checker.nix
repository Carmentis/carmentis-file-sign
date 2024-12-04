{ requiredVars, envFile ? ".env" }:

# Read the .env file into a string
let
  envFileContent = builtins.readFile envFile;
  missingVars = builtins.filter (var: builtins.match (".*^" + var + "=.*") envFileContent == null) requiredVars;
in
  if builtins.length missingVars > 0 then
    throw "Missing required environment variables: ${missingVars}"
  else
    null
