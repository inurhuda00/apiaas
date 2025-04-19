#!/bin/bash

# Load environment variables from .env file if it exists
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Set default environment variables if not set
export APP_URL=${APP_URL:-http://localhost:3000}
export DATABASE_URL=${DATABASE_URL:-postgres://postgres:postgres@localhost:5432/apiaas}
export NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL:-http://localhost:8787}
export BACKEND_URL=${BACKEND_URL:-http://localhost:8787}
export AUTH_SECRET=${AUTH_SECRET:-local-dev-secret-key-for-jwt-tokens-123456}
export POLAR_ACCESS_TOKEN=${POLAR_ACCESS_TOKEN:-dummy-token}
export POLAR_WEBHOOK_SECRET=${POLAR_WEBHOOK_SECRET:-dummy-secret}
export POLAR_WORKSPACE_ID=${POLAR_WORKSPACE_ID:-dummy-id}
export PRODUCT_ID=${PRODUCT_ID:-dummy-product-id}
export SKIP_ENV_VALIDATION=true

# Run the seed script
echo "Running seed script with environment variables..."
pnpm db:seed 