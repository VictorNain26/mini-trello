#!/bin/bash
set -e

echo "🚀 Starting Railway build for API..."

# Move to root directory
cd ../..

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile --prefer-offline --prod=false

# Build the API
echo "🔨 Building API..."
pnpm --filter api build

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
cd apps/api
pnpm prisma generate

echo "✅ Build completed successfully!"