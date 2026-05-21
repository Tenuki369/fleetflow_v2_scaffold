# FleetFlow takeover notes

## Source repos

- `Tenuki369/fleetflow_v2_scaffold` is the active application scaffold.
- `Tenuki369/fleetflow-tms` is treated as project/design collateral and WMS handoff material.

## Merge decision

The v2 scaffold is the source of truth because it contains the runnable Next.js app, Prisma schema, auth middleware, API routes, and deployment notes. The WMS repo contributes legal templates and historical planning documents.

## Immediate cleanup completed

- Removed committed `node_modules` from Git tracking.
- Added a root `.gitignore` for dependencies, build output, logs, and local environment files.
- Added these WMS legal templates under `legal/`:
  - `privacy_policy.md`
  - `terms_of_service.md`
  - `data_processing_addendum.md`

## Next priorities

1. Restore a lockfile with `npm install --package-lock-only` or switch intentionally to pnpm.
2. Run typecheck and build after the lockfile is restored.
3. Confirm required services: Postgres, Clerk, S3/R2, Stripe, Sentry, email, analytics.
4. Decide whether the old design collateral files belong in the app repo or should move to a separate product-docs repo.
5. Build the next MVP surface: loads CRUD, driver workflow, document upload, invoicing, and customer onboarding.

## Release checkpoints

- Launch gates now live in `docs/GO_LIVE_CHECKPOINTS.md`.
- Every feature slice should clear test, validation, performance, and QA checkpoints before staging promotion.
