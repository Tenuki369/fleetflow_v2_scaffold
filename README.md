# FleetFlow TMS v2

Transportation Management System for small carriers (3–50 trucks). Next.js 14 (App Router), Postgres, Prisma, S3/R2, Stripe, Clerk.

## Prerequisites

- Node.js 20+
- pnpm or npm
- A Postgres database (local Docker or hosted: Neon, Supabase, RDS)
- Clerk account for authentication
- AWS or Cloudflare R2 for document storage
- Stripe account for billing

## Environment variables

Create `.env.local` at the project root:

```
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/fleetflow

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# S3 / R2
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=fleetflow-documents
# Optional, for MinIO / R2:
# S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional outbound webhook for load status changes
WEBHOOK_URL=
```

## Local development

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed   # optional
npm run dev
```

App runs at http://localhost:3000.

## Deployment notes

### Vercel
1. Push the repo to GitHub; import in Vercel (auto-detects Next.js).
2. Add every env var above to Production + Preview.
3. Build command runs `prisma generate` first via the `build` script.

### Database (Neon or Supabase)
1. Create a Postgres database.
2. Use the pooled connection string in `DATABASE_URL` (append `?pgbouncer=true&connection_limit=1` for Neon on Vercel).
3. From a workstation with the unpooled URL, run `npx prisma migrate deploy`.

### S3 / R2 bucket
1. Create a private bucket; block all public access.
2. CORS: allow `PUT` and `GET` from `NEXT_PUBLIC_APP_URL` for the `Content-Type` header.
3. Create an IAM user (or R2 API token) scoped to `s3:PutObject` + `s3:GetObject` on this bucket only.

### Clerk
1. Create an application; enable Organizations.
2. Configure sign-in URLs to match `NEXT_PUBLIC_APP_URL`.

### Stripe
1. Add a webhook endpoint pointing at `${NEXT_PUBLIC_APP_URL}/api/stripe/webhook`.
2. Subscribe to `invoice.*` and `checkout.session.completed`.
3. Store the signing secret in `STRIPE_WEBHOOK_SECRET`.

## Project structure

```
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

Every domain row carries `orgId`. The tenancy Prisma extension in `lib/auth/tenancy.ts` injects `orgId` into every query before it hits Postgres — handlers should never construct a raw Prisma client. `getOrgContext()` is the only sanctioned entry point for resolving the active org from a request.
