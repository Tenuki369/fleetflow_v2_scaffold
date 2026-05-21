# FleetFlow TMS v2

Transportation Management System for small carriers (3-50 trucks). Next.js 15 (App Router), Postgres, Prisma, S3/R2, Stripe, and Clerk.

## Prerequisites

- Node.js 20+
- npm
- A Postgres database (local Docker or hosted: Neon, Supabase, RDS)
- Clerk account with Organizations enabled
- AWS S3 or Cloudflare R2 for document storage
- Stripe account for billing flows

## Environment variables

Copy `.env.example` to `.env.local` for local work. Do not commit real secrets.

The current app reads these values in code today:

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/fleetflow
DIRECT_URL=postgresql://user:pass@localhost:5432/fleetflow

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dispatch

# S3 / R2
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=fleetflow-documents
# Optional for R2 / S3-compatible storage:
# S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com
# Optional for public file-host links:
# S3_PUBLIC_URL=https://docs.fleetflow.app

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional outbound webhook for load status changes
WEBHOOK_URL=

# Optional monitoring toggle
FLEETFLOW_ENABLE_SENTRY=false
```

## Local development

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed   # optional
npm run dev
```

App runs at `http://localhost:3000`.

## Deployment notes

### Vercel

FleetFlow is set up to deploy from GitHub into Vercel preview and staging environments.

1. Import the repo into Vercel as a Next.js project.
2. Leave the root directory at the repo root.
3. Use Node.js 20 or newer.
4. `vercel.json` pins:
   - install command: `npm ci`
   - build command: `npm run db:deploy && npm run build`
5. Add these required env vars to both Preview and Production:
   - `NEXT_PUBLIC_APP_URL`
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `S3_BUCKET`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
6. Add these when they apply:
   - `S3_ENDPOINT` for Cloudflare R2 or another S3-compatible endpoint
   - `S3_PUBLIC_URL` for public file-host links
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `WEBHOOK_URL`
   - `FLEETFLOW_ENABLE_SENTRY`, `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`
7. For preview and staging, set `NEXT_PUBLIC_APP_URL` to the actual Vercel preview URL for the branch. Do not leave it on `localhost`.
8. After the first preview deploy, call `/api/health` and confirm:
   - `status: "ok"`
   - `db: "ok"`
   - `readiness.storage.status` is `ready` or intentionally `needs_config`
   - `readiness.stripe.status` is `ready` or intentionally `needs_config`

### Database (Neon or Supabase)

1. Create a Postgres database.
2. Use the pooled connection string in `DATABASE_URL`.
3. Use the direct connection string in `DIRECT_URL`.
4. On Vercel, `npm run db:deploy` runs during build before `next build`.

### S3 / R2 bucket

1. Create a private bucket and block public access.
2. CORS must allow `PUT` and `GET` from `NEXT_PUBLIC_APP_URL` for the `Content-Type` header.
3. Create an IAM user (or R2 API token) scoped to `s3:PutObject` and `s3:GetObject` on this bucket only.

### Clerk

1. Create an application and enable Organizations.
2. Configure the app URLs to match `NEXT_PUBLIC_APP_URL`.
3. Keep the routes aligned with the current middleware:
   - sign in: `/login`
   - sign up: `/signup`
   - post-auth redirect: `/dispatch`

### Stripe

1. Add a webhook endpoint pointing at `${NEXT_PUBLIC_APP_URL}/api/stripe/webhook`.
2. Subscribe to `invoice.*` and `checkout.session.completed`.
3. Store the signing secret in `STRIPE_WEBHOOK_SECRET`.

## Project structure

```text
app/
  (dashboard)/       Authenticated UI
  api/               Route handlers
components/          Shared React components
lib/
  auth/              Tenancy + RBAC
  storage/           S3 document helpers
prisma/
  schema.prisma      Data model
```

## Multi-tenancy

Every domain row carries `orgId`. The tenancy Prisma extension in `lib/auth/tenancy.ts` injects `orgId` into every query before it hits Postgres - handlers should never construct a raw Prisma client. `getOrgContext()` is the only sanctioned entry point for resolving the active org from a request.
