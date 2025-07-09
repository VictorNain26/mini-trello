#!/bin/bash
set -e

# Install pnpm globally using npm (force if exists)
npm install -g pnpm@latest --force

# Verify installation
pnpm --version

# Install dependencies
pnpm install --frozen-lockfile

# Run build
pnpm build