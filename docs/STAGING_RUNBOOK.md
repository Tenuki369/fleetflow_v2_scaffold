# Staging Release Runbook

Use this runbook when promoting FleetFlow to staging or when re-verifying an existing staging deploy.

## What this covers

- Safe local checks that do not need live provider credentials.
- Database migration and optional demo-data steps for staging.
- Manual smoke coverage against the routes and flows that currently ship.
- A clear split between what can be proven locally and what still needs real staging credentials.

## Safe commands

Run these from the repo root:

- `npm run release:preflight` - unit tests, Prisma validation, Prisma client generation, and TypeScript.
- `npm run release:check` - full preflight plus the production build.
- `npm run staging:health` - pings `/api/health` on `APP_URL` or `NEXT_PUBLIC_APP_URL`, defaulting to `http://localhost:3000`.

## Required staging environment

Minimum env expected by the deployed app:

- `DATABASE_URL` - pooled application connection string.
- `DIRECT_URL` - direct Postgres connection string for Prisma migrations.
- `NEXT_PUBLIC_APP_URL` - canonical staging URL.
- Clerk staging keys with Organizations enabled.
- S3 or R2 staging bucket credentials and bucket name.
- Stripe staging secret key and webhook signing secret.

## 1. Capture the release candidate

Before touching staging, record:

1. Branch name.
2. Commit SHA.
3. Target staging URL.
4. Whether this is a fresh staging database or an existing one.

## 2. Local preflight

1. Confirm the workspace is on the intended branch and commit.
2. Run `npm install` if dependencies changed.
3. Run `npm run release:check`.

Exit rule: tests pass, Prisma validates, TypeScript passes, and the production build succeeds locally.

## 3. Database deploy

### Fresh staging database

1. Confirm `DATABASE_URL` and `DIRECT_URL` both point at staging.
2. Run `npm run db:deploy`.
3. Only run `npm run db:seed` if staging needs demo records for walkthroughs.

Notes:

- `db:seed` is demo data for smoke work. It is not the real first-org bootstrap path.
- Real operator setup for a fresh org is handled in-app through `/onboarding`.

### Existing staging database without Prisma migration history

Only use this when the schema is already present and replaying the initial migration would be wrong.

1. Take a backup or snapshot first.
2. Run `npx prisma migrate resolve --applied 20260515120000_init`.
3. Run `npm run db:deploy`.

## 4. Deployed-app verification

1. Set `APP_URL` to the staging origin if it differs from `NEXT_PUBLIC_APP_URL`.
2. Run `npm run staging:health`.
3. Confirm the response reports `status: "ok"` and `db: "ok"`.

If health fails, stop here and fix deploy or database connectivity before manual smoke.

## 5. Manual staging smoke

Use a real staging user account. For a brand-new org, start with `/onboarding`; otherwise sign in and land on `/dispatch`.

### Auth and shell

1. Sign in successfully.
2. For a new org, create the first organization through `/onboarding`.
3. Confirm the authenticated shell loads and redirects into `/dispatch`.
4. Confirm top-level navigation works for `/dispatch`, `/loads`, `/directory`, and `/invoices`.

### Core operational flow

1. In `/directory`, create one customer, one driver, and one truck if seed data is not present.
2. In `/loads/new`, create a load linked to those records.
3. Open the saved load in `/loads/[id]`.
4. Edit the load and confirm the update persists.
5. Move the load through the available status actions until it reaches delivered or invoiced state.

### Invoicing

1. Generate an invoice from a delivered load.
2. Confirm the invoice appears on the load detail view and in `/invoices`.
3. Exercise at least one valid invoice status transition, such as draft to sent or sent to paid.

### Documents

1. Upload one small PDF or image from the load detail view.
2. Confirm the upload completes.
3. Download the uploaded document through the app.

### Negative checks

1. Confirm form validation appears for an obvious bad input, such as a delivery date before pickup.
2. Confirm duplicate truck unit numbers are rejected within the same org.
3. Confirm duplicate load reference numbers are rejected within the same org.

## 6. Credential-gated checks

These still require real staging integrations:

- Clerk sign-in and organization bootstrap with hosted auth.
- S3 or R2 presign, upload, and download against the real bucket.
- Stripe webhook delivery and replay handling against `/api/stripe/webhook`.
- Production-like callback URLs, bucket permissions, and webhook secrets.

Record the exact date, operator, and result of each of these once a credentialed person runs them.

## 7. Rollback notes

- Application rollback: redeploy the previous known-good build.
- Database rollback: restore the staging backup taken before `db:deploy`.
- If `db:seed` was used only for smoke data, remove those records manually unless the migration itself also needs rollback.
