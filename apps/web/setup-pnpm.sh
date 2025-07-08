#!/bin/bash
set -e

echo "🔧 Setting up pnpm..."

# Enable corepack (built-in with Node.js 16+)
corepack enable

# Prepare and activate pnpm
corepack prepare pnpm@latest --activate

# Verify pnpm is working
pnpm --version

echo "✅ pnpm setup complete!"