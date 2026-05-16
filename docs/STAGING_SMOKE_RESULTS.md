# Staging Smoke Results

- Date: 2026-05-16
- Branch: `codex/merge-fleetflow-handoff`
- Commit: `0e3d8df1a34cd299325714868c195b96803f7ef1`
- Draft PR: https://github.com/Tenuki369/fleetflow_v2_scaffold/pull/1
- Target platform: Vercel
- Preview URL: not created yet
- Overall status: blocked before deployment

## What was verified

### Repository state

- Working tree clean on `codex/merge-fleetflow-handoff`
- Branch pushed to `origin`
- Draft PR opened against `main`

### Local release gate

`npm run release:check` passed with safe placeholder `DATABASE_URL` and `DIRECT_URL` values in the shell.

- 24 unit tests passing
- Prisma schema validate passing
- Prisma client generate passing
- TypeScript passing
- Next.js production build passing

## Deployment attempt

### Vercel account state

- Connected Vercel team found: `gbeee's projects` (`team_HTA8gGQ61Aj352MihEIoWkux`)
- Existing Vercel projects visible to the connector: `trades`
- No linked `.vercel/project.json` exists in the repo
- No FleetFlow Vercel project exists yet for this repository

### Blocker

Deployment could not proceed from this environment because all three required write surfaces were unavailable:

1. The available Vercel connector can read teams, projects, deployments, and docs, but it does not expose project creation or environment-variable mutation in this session.
2. The local Vercel CLI is not installed (`vercel` command missing).
3. `npx vercel` could not bootstrap the CLI in this sandbox because npm registry access and cache writes are restricted here.

Because the project does not yet exist in Vercel, there is no preview deployment URL to verify.

## Smoke flow status

| Flow | Status | Notes |
| --- | --- | --- |
| `GET /api/health` | Not run | No preview deployment URL exists yet |
| Onboarding | Not run | Blocked on Vercel project creation and Clerk staging env |
| Document upload | Not run | Blocked on preview deploy plus storage envs |
| Invoice lifecycle | Not run | Blocked on preview deploy plus database and Stripe envs |
| Dispatch assignment | Not run | Blocked on preview deploy plus authenticated staging session |

## Required staging environment

These are the non-secret keys that must exist before smoke can run cleanly on Vercel:

- Database:
  - `DATABASE_URL`
  - `DIRECT_URL`
- App URL:
  - `NEXT_PUBLIC_APP_URL`
- Clerk:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
  - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- Storage:
  - `AWS_REGION`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `S3_BUCKET`
  - `S3_ENDPOINT` when using R2
  - `S3_PUBLIC_URL` if download URLs should use a public host
- Stripe:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Optional operational keys:
  - `WEBHOOK_URL`
  - `SENTRY_DSN`
  - `NEXT_PUBLIC_SENTRY_DSN`
  - `FLEETFLOW_ENABLE_SENTRY`

Note: the app uses Clerk, not NextAuth. `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are not part of this codepath.

## Recommended next step

1. Create or import a Vercel project for `Tenuki369/fleetflow_v2_scaffold` named `fleetflow-v2`.
2. Add the required preview environment variables above.
3. Set the Vercel build command to run migrations before `next build`, for example:
   - `npm run db:deploy && npm run build`
4. Trigger a preview deployment from `codex/merge-fleetflow-handoff`.
5. Re-run the five smoke flows in `docs/STAGING_RUNBOOK.md` and append the actual preview URL, timestamps, and pass/fail results here.
