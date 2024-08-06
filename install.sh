#!/bin/sh

# Check root permissions
if [ "$(id -u)" -ne 0 ]; then
  echo "Please run as root."
  exit 1
fi

mv .env .env.bak

# Install the required packages
echo ">> Installing the required packages..."
bun install >/dev/null

# Build the application
echo ">> Building the application..."
bun build:bun >/dev/null

# Add the shebang
echo "#!/usr/bin/env bun" | cat - bin/bun/index.js >temp && mv temp bin/bun/index.js

# Make the application executable
sudo chmod +x bin/bun/index.js

# Create a symbolic link
if [ -f /usr/local/bin/docker-updater ]; then
  rm /usr/local/bin/docker-updater
fi
ln -s "$(pwd)/bin/bun/index.js" /usr/local/bin/docker-updater

mv .env.bak .env

# Display the success message
echo ">> The application has been installed successfully."
