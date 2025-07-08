#!/bin/bash

# Set Railway environment variables for API service
echo "Setting API environment variables..."
railway service api
railway variables set NODE_ENV=production
railway variables set AUTH_SECRET="$(openssl rand -base64 32)"
railway variables set CLIENT_ORIGIN="https://web-production-b1e9.up.railway.app"
railway variables set PORT=4000

# Switch to web service and set variables
echo "Setting Web environment variables..."
railway service web
railway variables set VITE_API_URL="https://api-production-e29c.up.railway.app"

echo "Environment variables configured!"
echo "API URL: https://api-production-e29c.up.railway.app"
echo "Web URL: https://web-production-b1e9.up.railway.app"