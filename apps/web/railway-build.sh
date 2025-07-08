#!/bin/bash
set -e

echo "🚀 Starting Railway build for Web..."

# Move to root directory
cd ../..

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile --prefer-offline --ignore-scripts

# Build the web app
echo "🔨 Building Web app..."
pnpm --filter @mini-trello/web build

echo "✅ Build completed successfully!"