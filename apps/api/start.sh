#!/bin/bash
set -e

echo "🚀 Starting Mini-Trello API..."

# Navigate to API directory
cd apps/api

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "🌟 Starting server..."
node dist/index.js