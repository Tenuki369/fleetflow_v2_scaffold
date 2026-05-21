# FleetFlow Launch Day Runbook

This is the control sheet for the day we move from "ready to test" to "ready to trust." It gives the launch owner one path from preflight through go or hold.

## Launch roles

- Launch owner: runs this checklist and calls go or hold
- Engineering owner: fixes blockers and confirms rollback options
- Ops validator: runs the dispatcher flow
- Accounting validator: runs invoice checks

## Launch ladder

Move top to bottom. Do not skip ahead.

### 1. Freeze the candidate

- confirm branch, commit SHA, and PR
- confirm no unreviewed changes are waiting outside the candidate
- confirm the deployment target is the intended staging or production project

### 2. Confirm preflight

- latest `release:check` passed
- migrations are known and reviewed
- required env values are present in the target environment
- auth, storage, and Stripe owners are reachable during the launch window

### 3. Validate deployed health

- open `/api/health`
- confirm database is healthy
- confirm storage reports ready or expected configuration status
- confirm Stripe reports ready or expected configuration status

If health is degraded for database, stop. If storage or Stripe are intentionally not in scope for the release, note that explicitly before continuing.

### 4. Run the operator flow

Use [QA_RUNBOOK.md](./QA_RUNBOOK.md) in order. Minimum required pass:

- onboarding or sign-in
- directory setup
- load creation and update
- load status progression
- document upload and retrieval
- invoice generation and status change

### 5. Make the call

Call `GO` only if:

- health is clean enough for the planned scope
- the operator flow passed
- no blocker exists in auth, tenant boundaries, storage, billing, or data integrity
- rollback steps are understood by the engineering owner

Call `HOLD` if any blocker exists or if the team cannot prove the workflow in the target environment.

## Blocker triage

Use this severity split during launch:

- `P0`: auth broken, tenant leak, data corruption, unexpected 500, document loss, invoice corruption
- `P1`: workflow completes only with engineering help, major UI confusion, severe slowness
- `P2`: cosmetic issue, wording cleanup, minor layout issue

Any `P0` is an automatic hold. Any unresolved `P1` should default to hold unless the launch owner and engineering owner both agree it is outside the launch path.

## Rollback reminders

- app rollback: redeploy the previous known-good build
- database rollback: restore the snapshot taken before migration or deploy
- smoke data cleanup: remove launch-only test records if they should not remain

## Launch record

Fill this in during the launch window:

| Item | Value |
| --- | --- |
| Environment | |
| URL | |
| Branch | |
| Commit SHA | |
| Launch owner | |
| Engineering owner | |
| Start time | |
| Decision time | |
| Final call | `GO` / `HOLD` |
| Notes | |
