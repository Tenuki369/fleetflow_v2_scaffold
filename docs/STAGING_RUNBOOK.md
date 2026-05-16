# Staging Release Runbook

Use this checklist before promoting FleetFlow staging.

## Required Environment

- `DATABASE_URL`: pooled application connection string used by Prisma Client.
- `DIRECT_URL`: direct database connection string used by Prisma migrations.
- App secrets for Clerk, Stripe, and S3 must point at staging resources.

## Preflight

1. Confirm the deploy is using the intended branch and commit.
2. Run `npm install` if dependencies changed.
3. Run `npm run release:check`.

`release:check` validates the Prisma schema, regenerates the Prisma client through the build script, and runs the Next.js production build.

## Database Deploy

For a new empty staging database:

1. Confirm `DATABASE_URL` and `DIRECT_URL` both target staging.
2. Run `npm run db:deploy`.
3. Run `npm run db:seed` only when staging needs demo data.

For a staging database that already has this schema but no Prisma migration history, baseline first instead of replaying the initial migration:

1. Back up the database.
2. Run `prisma migrate resolve --applied 20260515120000_init`.
3. Run `npm run db:deploy`.

## Smoke Test

1. Start the deployed app.
2. Sign in with a staging user.
3. Confirm tenant-scoped pages load for loads, customers, drivers, trucks, documents, invoices, and audit logs.
4. Create and remove one non-production test record if seed data is not available.

## Rollback Notes

Application rollback should use the previous known-good build. Database rollback requires restoring the staging backup taken before migration deploy.
