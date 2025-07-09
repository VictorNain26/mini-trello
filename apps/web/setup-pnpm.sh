#!/bin/bash
set -e

echo "🔧 Setting up pnpm..."

# Check if pnpm is already available
if command -v pnpm &> /dev/null; then
    echo "pnpm already installed: $(pnpm --version)"
else
    echo "Installing pnpm via npm..."
    # Install pnpm via npm with specific version
    npm install -g pnpm@9.15.1 --force
fi

# Verify pnpm is working
pnpm --version

echo "✅ pnpm setup complete!"