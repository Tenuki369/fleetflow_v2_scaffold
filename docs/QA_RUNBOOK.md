# FleetFlow QA Runbook

This is the operator-facing validation path for a launch candidate. Use it to answer one question: can a real team sign in, create work, move that work through dispatch and billing, and finish without hitting auth, data, or workflow breaks?

For day-of-release coordination, pair this with [LAUNCH_DAY_RUNBOOK.md](./LAUNCH_DAY_RUNBOOK.md). For the release gate summary, use [GO_LIVE_CHECKPOINTS.md](./GO_LIVE_CHECKPOINTS.md).

## Who runs this

- QA or launch owner: drives the run, records results, decides pass or fail
- Dispatcher proxy: validates the dispatch workflow
- Accounting proxy: validates invoice state changes

Minimum accounts ready before starting:

- `OWNER` user for onboarding and org-level setup
- `DISPATCHER` user for daily operations
- `ACCOUNTING` user for invoice actions
- `DRIVER` user if driver-specific access needs verification

## Evidence to capture

Record these for every run:

- branch name
- commit SHA
- environment name and base URL
- operator name
- start time and end time
- pass or fail for each step
- exact route, role, and error text for any failure

Use [STAGING_SMOKE_RESULTS.md](./STAGING_SMOKE_RESULTS.md) as the permanent record.

## Preflight

Do not start the manual run until all of these are true:

- `npm run qa:quick` passed
- `npm run qa:launch` passed
- target environment is reachable
- database migrations are applied
- sign-in works for at least one known user
- storage credentials exist if document upload is in scope
- Stripe credentials and webhook secret exist if invoice lifecycle is in scope

Stop immediately if any preflight item fails.

## Test data to use

Use one clean set of values so the run is easy to replay and audit:

- customer: `Launch Test Logistics`
- truck: `FF-9001`
- driver: `Taylor Launch`
- load reference: `LAUNCH-001`
- invoice amount: use the load's generated value
- document type: `BOL`, then `POD` if running a second upload

If those values already exist in the same org, append the date or a short suffix.

## Manual validation flow

Run the steps in this exact order.

| Step | Role | Route | Action | Expected result |
| --- | --- | --- | --- | --- |
| 1 | `OWNER` | `/onboarding` or sign-in entry | Sign in and create the first org if the account has no membership | User lands in `/dispatch` with an owner membership and no redirect loop |
| 2 | `OWNER` | `/dispatch` | Verify the shell loads | Navigation to `/dispatch`, `/loads`, `/directory`, and `/invoices` works |
| 3 | `DISPATCHER` | `/directory` | Create customer `Launch Test Logistics` | Customer saves once, appears in the list, and does not duplicate unexpectedly |
| 4 | `DISPATCHER` | `/directory` | Create truck `FF-9001` | Truck saves once and appears in the truck list |
| 5 | `DISPATCHER` | `/directory` | Create driver `Taylor Launch` and assign truck `FF-9001` | Driver saves, assigned truck persists, no cross-org validation errors |
| 6 | `DISPATCHER` | `/loads/new` | Create load `LAUNCH-001` using the test customer, driver, and truck | Load saves, opens its detail page, and shows the linked records |
| 7 | `DISPATCHER` | `/loads/[id]` | Edit one non-critical field such as notes, rate, or appointment time | Change persists after refresh |
| 8 | `DISPATCHER` | `/loads/[id]` | Move the load through valid status actions until delivered | Only legal next states are available, and the selected state persists |
| 9 | `DISPATCHER` | `/loads/[id]` | Upload one `BOL` document | Upload finishes, document appears in the list, and the document type badge is correct |
| 10 | `DISPATCHER` | `/loads/[id]` | Download the uploaded document | Download opens or redirects cleanly with no 401, 403, or 500 |
| 11 | `ACCOUNTING` | `/loads/[id]` or `/invoices` | Generate the invoice from the delivered load | Invoice is created once and appears in both the load view and invoice list |
| 12 | `ACCOUNTING` | `/invoices` | Move the invoice through one valid lifecycle path: `DRAFT -> SENT -> PAID` | Each transition succeeds once, timestamps update, and invalid reopen actions are unavailable |
| 13 | `DRIVER` | assigned load route or status action surface | Confirm the assigned driver can only act on the assigned load | Assigned load is accessible; unrelated loads are not actionable |

## Negative checks

Run these after the happy path while still in the same org:

| Check | Where | Input | Expected result |
| --- | --- | --- | --- |
| Invalid delivery date | `/loads/new` or `/loads/[id]` | Set delivery before pickup | UI or API rejects the change |
| Duplicate truck | `/directory` | Create `FF-9001` again | Duplicate is blocked in the same org |
| Duplicate load reference | `/loads/new` | Create `LAUNCH-001` again | Duplicate is blocked in the same org |
| Invalid document type or unsupported file | document upload | Upload unsupported file or bad type selection | Upload is rejected without breaking the page |
| Illegal invoice transition | `/invoices` | Try to reopen `PAID` or `VOID` | Action is blocked |

## What to watch during the run

Treat any of these as a launch blocker:

- sign-in failure or redirect loop
- missing org membership after onboarding
- data saved to the wrong org
- unexpected 500 response
- document upload completes without a saved record
- invoice generates twice from one load
- driver can act on another driver's load
- broken navigation between core views

Treat these as high-priority but not automatic launch blockers unless they stop the workflow:

- unreadable tables at laptop width
- copy that hides the next action
- validation messages that are technically correct but unclear
- slow page transitions that exceed a normal operator wait

## Pass and fail rules

Pass only when all of these are true:

- every step in the manual validation flow completes
- every negative check behaves correctly
- no auth, tenant, billing, storage, or 500-level issue appears
- the operator can move through the run without extra engineering guidance

Fail immediately if any core flow cannot be completed or if any blocker above appears.

## Reporting

At the end of the run, update [STAGING_SMOKE_RESULTS.md](./STAGING_SMOKE_RESULTS.md) with:

- verified commit SHA
- environment URL
- timestamped pass or fail per step
- failures with exact repro and visible error text
- final recommendation: go live, hold for fixes, or rerun after env repair
