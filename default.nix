{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
    name="filesign-shell";

    buildInputs = [
        pkgs.nodejs_20
    ];

    # Define the shell hook
    shellHook = ''
        # Path to the .env file
        ENV_FILE=".env"

        # Required environment variable
        REQUIRED_VARS="SMTP_HOST SMTP_PASS APPL"

        # Check if the .env file exists
        if [ ! -f "$ENV_FILE" ]; then
          echo "Error: .env file is missing."
          exit 1
        fi

        # Check if all required variables are present
        for var in $REQUIRED_VARS; do
          if ! grep -q "^${var}=" "$ENV_FILE"; then
            echo "Error: Missing required environment variable '${var}' in $ENV_FILE."
            exit 1
          fi
        done

        echo ".env file validation successful. All required variables are present."
    '';
}