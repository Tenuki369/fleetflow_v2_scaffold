# FleetFlow QA runbook

This runbook is the shortest path to answer one question before launch: "Can an operator use FleetFlow end to end without hitting broken auth, broken data rules, or broken core workflows?"

## Scope

Use this for every launch candidate on branch or staging builds. It is intentionally narrow:

- verify the current automated checks pass
- run one seeded local workflow pass
- run one staging smoke pass with real integrations
- record anything that blocks launch

This is not a net-new test plan. It is the executable version of the current launch gate.

## Automated checks

Run these from the repo root in order:

1. `npm run qa:quick`
2. `npm run qa:launch`

What they cover today:

- `qa:quick`: unit coverage in `tests/` plus Prisma schema validation
- `qa:launch`: everything in `qa:quick`, then TypeScript no-emit typecheck, Prisma client generation, and the production build

Exit rule: all commands return cleanly with no test, schema, type, or build failures.

## Local smoke flow

Prereqs:

- local env file present
- database reachable
- Prisma migrations applied
- representative seed data loaded, or enough records to create one customer, truck, driver, and load

Suggested setup order:

1. `npm run db:deploy`
2. `npm run db:seed` if a safe local seed path is available for your environment
3. `npm run dev`

Run this workflow in the browser:

1. Sign in as an `OWNER` or `DISPATCHER`.
2. Open `/dispatch` and confirm the page loads without redirect loops or blank states.
3. Create a customer in `/directory`.
4. Create a truck in `/directory`.
5. Create a driver and assign the truck.
6. Create a load in `/loads/new` using the customer, truck, and driver.
7. Open the new load detail page and edit at least one field.
8. Move the load through the expected status flow.
9. Confirm invoice visibility from the load or `/invoices`.
10. Upload or validate one load document if storage is configured locally.

Check these while you move through the flow:

- no unexpected 500s in the app or API responses
- validation errors appear for obviously bad form input
- org-scoped records do not leak across users or routes
- laptop-width table layouts remain readable
- core navigation between `/dispatch`, `/loads`, `/directory`, and `/invoices` stays intact

Exit rule: the dispatcher flow completes without guidance or data corruption.

## Staging smoke flow

These steps stay manual because they depend on real services and environment wiring:

1. Confirm staging env values are set for Postgres, Clerk, Stripe, and storage.
2. Apply Prisma migrations on staging.
3. Verify sign-in and redirect behavior for the first real org.
4. Repeat the local smoke flow on staging.
5. Test document presign/upload against the real bucket.
6. Replay a Stripe webhook and confirm idempotent handling.
7. Hit `/api/health` and spot-check the core load/customer/driver/truck endpoints for non-500 behavior.

Exit rule: staging behaves like production, including auth, storage, and billing integrations.

## Failure handling

If a check fails:

1. capture the failing command, route, role, and exact repro steps
2. mark whether the issue is local-only, staging-only, or both
3. stop the launch recommendation for any auth, data integrity, billing, storage, or 500-level regression

## Launch recommendation

Recommend go-live only when all three are true:

1. `npm run qa:launch` passes locally
2. the manual local smoke flow passes once cleanly
3. the staging smoke flow passes with real integrations
