# Vercel Staging Runbook

Use this runbook when creating the first FleetFlow Vercel preview/staging deployment or when re-verifying an existing one.

## What this runbook owns

- Vercel project setup and deploy settings
- required environment variables for preview/staging
- database migration behavior during build
- post-deploy health and smoke verification
- rollback posture for staging-only incidents

## Local release gate before any deploy

Run these from the repo root before touching Vercel:

- `npm run release:preflight` - tests, Prisma validate, Prisma generate, typecheck
- `npm run release:check` - full preflight plus a production build

Exit rule: do not deploy if `release:check` fails.

## 1. One-time Vercel project setup

Create or import a Vercel project for this repo with these settings:

1. Framework preset: Next.js
2. Root directory: repo root
3. Install command: `npm ci`
4. Build command: `npm run db:deploy && npm run build`
5. Node.js version: 20 or newer

`vercel.json` in the repo now encodes the install and build commands so the dashboard does not need custom drift-prone overrides.

## 2. Required preview/staging environment

Set these in the Vercel Preview environment before the first smoke run:

### Required for app boot and auth

- `NEXT_PUBLIC_APP_URL`
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`

Recommended route values:

- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dispatch`

### Required for document storage

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET`

Add only when using an S3-compatible endpoint such as R2:

- `S3_ENDPOINT`
- `S3_PUBLIC_URL`

### Required for invoice and billing checks

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Optional but recommended:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Optional operational envs

- `WEBHOOK_URL`
- `FLEETFLOW_ENABLE_SENTRY`
- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`

Keep optional future-use envs like Neon automation, PostHog, Inngest, Upstash, BetterStack, and Resend out of Vercel until the corresponding feature is actually being exercised.

## 3. Preview URL rule

`NEXT_PUBLIC_APP_URL` must match the deployed staging URL. Do not leave it on `localhost`.

For a branch-based staging flow:

1. trigger the first preview deployment
2. capture the resulting Vercel preview URL
3. save that URL into `NEXT_PUBLIC_APP_URL` for the Preview environment
4. redeploy the branch so health checks and webhook URLs reflect the real host

## 4. Database deployment rule

Vercel runs `npm run db:deploy && npm run build` during build.

That means:

- `DIRECT_URL` must be valid during Vercel build
- migration history must already be correct for the target database
- destructive rollback is not part of this path

Use `npm run db:seed` only when staging explicitly needs demo walkthrough data. It is not part of the default deploy.

If the target database already has the schema but is missing Prisma migration history:

1. take a backup first
2. resolve the baseline migration as applied
3. rerun the build/deploy path

## 5. Post-deploy verification

After Vercel reports a successful deploy:

1. open `/api/health`
2. confirm:
   - `status` is `ok`
   - `db` is `ok`
   - `commit` matches the release candidate
   - `readiness.storage.status` is `ready` unless storage is intentionally not configured
   - `readiness.stripe.status` is `ready` unless Stripe is intentionally not configured
3. run `npm run staging:health` locally with `APP_URL` set to the deployed origin if you want a repeatable terminal check

Stop here if health is degraded.

## 6. Manual smoke sequence

Use a real staging user account.

### Auth and shell

1. sign in
2. create the first org through `/onboarding` if this is a fresh staging database
3. verify redirect to `/dispatch`
4. verify navigation to `/loads`, `/directory`, and `/invoices`

### Core ops path

1. create a customer, driver, and truck in `/directory`
2. create a load in `/loads/new`
3. edit that load from the detail page
4. move the load through its status actions
5. assign it to the intended driver and truck

### Invoicing

1. generate an invoice from a delivered load
2. verify it appears on the load detail page and `/invoices`
3. move it through a valid status transition such as draft to sent or sent to paid

### Documents

1. upload one small PDF or image from the load detail page
2. verify the upload completes
3. download the same document

### Negative checks

1. delivery date before pickup is rejected
2. duplicate truck unit number is rejected in-org
3. duplicate load reference number is rejected in-org

## 7. Record the outcome

After each staging verification pass, update `docs/STAGING_SMOKE_RESULTS.md` with:

- date and operator
- branch and commit
- preview URL
- pass/fail by flow
- any blocking errors and next action

## 8. Rollback posture

- app rollback: redeploy the previous known-good Vercel deployment
- database rollback: restore the staging backup taken before a risky migration
- smoke/demo data rollback: remove seeded records manually if they were only created for staging verification
