# Environment Variables

This document describes the environment variables used in the API service.

## Required Variables

- `DATABASE_URL`: Connection string for the PostgreSQL database
- `AUTH_SECRET`: Secret key for JWT token generation and validation
- `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile secret key for bot protection
- `TURNSTILE_SITE_KEY`: Cloudflare Turnstile site key for bot protection

## Optional Variables

- `ASSET_DOMAIN`: Domain for serving assets (defaults to `assets.mondive.xyz`)
  - Example: `ASSET_DOMAIN=cdn.example.com`
  - This variable is used to construct asset URLs in the format:
    - `https://${ASSET_DOMAIN}/products/${productId}/${type}/${filename}`
  - Change this to use a custom CDN or asset domain

## Deployment Configuration

To set environment variables for development:

1. Add them to the `.dev.vars` file in the `apps/api` directory

For production deployment to Cloudflare Workers:

1. Use the Cloudflare dashboard to set environment variables for your Worker
2. Or use the Wrangler CLI: `npx wrangler secret put ASSET_DOMAIN`

## Updating Existing URLs

If you change the `ASSET_DOMAIN` after uploading files, run the migration script to update existing URLs in the database:

```bash
# Dry run to see what changes would be made without applying them
DRY_RUN=true DATABASE_URL=your_database_url ASSET_DOMAIN=new.domain.com npx tsx src/scripts/update-asset-urls.ts

# Apply the changes
DATABASE_URL=your_database_url ASSET_DOMAIN=new.domain.com npx tsx src/scripts/update-asset-urls.ts
``` 