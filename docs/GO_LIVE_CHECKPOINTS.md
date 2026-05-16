# FleetFlow go-live checkpoints

This is the release spine for taking FleetFlow from "feature work in progress" to a production launch that can survive real operations.

## Release cadence

Every major slice moves through the same gates before it is considered launch-ready:

1. Build the feature behind the existing auth and tenant model.
2. Run local validation.
3. Check operational behavior with representative data.
4. Review performance impact.
5. Run QA against the user-facing workflow.
6. Only then promote to staging and production.

## Gate 1: Test checkpoints

- `npm exec tsc -- --noEmit`
- `npm run build`
- Seeded local smoke pass against:
  - `/dispatch`
  - `/loads`
  - `/loads/new`
  - `/loads/[id]`
  - `/directory`
  - `/invoices`
- API smoke pass:
  - `GET /api/health`
  - `GET/POST /api/loads`
  - `GET/PATCH /api/loads/[id]`
  - `GET/POST /api/loads/[id]/invoice`
  - `GET/POST /api/customers`
  - `GET/POST /api/drivers`
  - `GET/POST /api/trucks`

Exit rule: no type errors, no build errors, and no handler returning unexpected 500s under seeded data.

## Gate 2: Validation checkpoints

- Org scoping confirmed on every new route and table mutation.
- Role checks confirmed for:
  - `OWNER`
  - `DISPATCHER`
  - `ACCOUNTING`
  - `DRIVER`
- Audit log entry created for every create/update path touching operational data.
- Required business validations confirmed:
  - load delivery date cannot precede pickup date
  - duplicate truck unit numbers blocked per org
  - duplicate load reference numbers blocked per org
  - optional relationships remain nullable without breaking forms

Exit rule: data integrity holds under normal usage and obvious bad inputs.

## Gate 3: Performance checkpoints

- Dashboard and directory pages render against at least 100 seeded records per table without obvious UI lag.
- Route handlers keep bounded queries:
  - use `take`
  - use indexed filters where available
  - avoid unbounded includes
- No page introduces N+1 fetching in the render path.
- No page should exceed a practical operator wait threshold of roughly 2 seconds on seeded local data.

Exit rule: dispatcher-facing views stay comfortably usable at small production scale.

## Gate 4: QA checkpoints

- Manual workflow pass:
  - create customer
  - create truck
  - create driver and assign truck
  - create load using those records
  - edit load
  - move load through status flow
  - verify invoice visibility
- Empty states verified.
- Validation errors shown in UI for bad form input.
- Table views remain readable on laptop-width screens.
- No broken navigation between core views.

Exit rule: a dispatcher can complete the main operational flow without guidance.

## Gate 5: Staging checkpoints

- Production-like env values configured for:
  - Postgres
  - Clerk
  - Stripe
  - storage bucket
- Prisma migrations applied successfully.
- Seed/bootstrap process creates an initial org and owner path safely.
- Document presign flow tested against real storage.
- Stripe webhook tested with replay/idempotency.

Exit rule: staging behaves like production, not like a local demo.

## Gate 6: Production readiness checkpoints

- Error monitoring enabled.
- Backup and rollback plan written down.
- Legal docs linked in the product footer or auth flow as needed.
- Billing, auth callbacks, and storage permissions verified on the live domain.
- Known launch limitations captured in a short operator handoff note.

Exit rule: there is an owner for launch-day monitoring and a fallback plan if something breaks.

## Current status

- Completed:
  - build/typecheck baseline
  - load create/edit workflow
  - loads and invoices workspaces
  - customer/driver/truck directory foundation
  - load document upload workflow
  - draft invoice generation from delivered loads
- In progress:
  - onboarding/bootstrap path for the first real org
  - invoice send/pay/void lifecycle actions
- Not started:
  - staging shakeout
  - production monitoring
  - launch-day rollback checklist
