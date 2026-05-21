> ⚠️ Template only. Not legal advice. Have an attorney licensed in your jurisdiction review before publishing. Placeholders are wrapped in `[BRACKETS]`.

# FleetFlow TMS — Privacy Policy

**Effective Date: [EFFECTIVE_DATE]**

This Privacy Policy explains how **[LEGAL_ENTITY_NAME]** ("FleetFlow," "we") collects, uses, and shares personal information in connection with the FleetFlow TMS service (the "Service"). It applies to our website, web app, PWA, and APIs.

## 1. Scope

FleetFlow currently serves **US-based** trucking carriers and their drivers and customers. Personal information is processed in the United States. We don't offer the Service to individuals outside the US, and we don't currently process information subject to GDPR. If you're outside the US, please don't use the Service.

This policy covers information about:

- **Account users** — owners, dispatchers, admins, and back-office staff of carrier customers;
- **Drivers** — drivers added to a carrier account who use the PWA to acknowledge loads;
- **Carrier customers' contacts** — shipper/broker contact data uploaded by carriers;
- **Website visitors**.

For information processed **on behalf of a carrier customer**, FleetFlow acts as a service provider/processor. The carrier is the controller and its own privacy notice governs the underlying relationship with drivers and customers; this policy describes our practices.

## 2. What We Collect

**Account information.** Name, business name, email, phone, role, hashed authentication credentials (via Clerk), MFA settings, and account preferences.

**Billing information.** Plan, billing address, last 4 of card and brand (we don't see or store full payment card numbers — Stripe handles payment data; we operate within PCI DSS SAQ-A scope).

**Customer-uploaded data.** Records and documents you upload or generate — loads, BOLs, PODs, rate confirmations, invoices, contact lists, driver records, vehicle data, and notes.

**Driver location data.** When a driver is actively assigned to a load and acknowledges it in the PWA, we may collect coarse or precise location at the moments the driver interacts with the load (e.g., accept, in-transit, delivered). We do **not** continuously track drivers in the background; location capture is tied to driver-initiated events in the PWA.

**Usage and device data.** IP address, browser/device type, OS, pages viewed, feature usage, timestamps, referrers, error reports, and similar telemetry collected via cookies and our analytics/observability tools.

**Communications.** Messages you send to support, feedback, and survey responses.

## 3. How We Use It

We use personal information to:

- provide, operate, secure, and improve the Service;
- authenticate users, prevent fraud and abuse, and enforce our Terms;
- process payments and manage billing;
- send transactional emails (receipts, alerts, security notices) and, with permission or where allowed, product updates;
- respond to support requests;
- generate aggregated and de-identified analytics about Service usage;
- comply with legal obligations and respond to lawful requests.

We **don't** sell personal information, share it for cross-context behavioral advertising, or use Customer Data to train AI models for the benefit of other customers or third parties.

## 4. Legal Bases (where applicable)

For users in jurisdictions that require a legal basis, we rely on: performance of a contract (delivering the Service); legitimate interests (securing and improving the Service, fraud prevention); consent (where required, e.g., certain cookies); and compliance with legal obligations.

## 5. Sharing

We share personal information with the following categories of recipients:

**Subprocessors / service providers** (current list):

| Provider | Purpose |
|---|---|
| **AWS** *(or **Cloudflare R2**)* | Object storage for uploaded documents |
| **Neon** | Managed PostgreSQL database hosting |
| **Vercel** | Application hosting and edge delivery |
| **Clerk** | Authentication and user management |
| **Stripe** | Payment processing |
| **Resend** | Transactional email delivery |
| **Sentry** | Error monitoring |
| **PostHog** | Product analytics |
| **Inngest** | Background job processing |

We maintain a current list at **[SUBPROCESSOR_PAGE_URL]**. Each subprocessor is bound by contractual confidentiality and security obligations.

**Affiliates** under common control, under equivalent privacy commitments.

**Legal and safety.** To comply with law or valid legal process, to enforce our Terms, or to protect rights, property, or safety of FleetFlow, our customers, or others.

**Business transfers.** In connection with a merger, acquisition, financing, or sale of assets, subject to continued protection of personal information.

We **do not sell personal information** and have not sold or "shared" (as defined under CCPA/CPRA) personal information in the past 12 months.

## 6. Retention

We retain personal information for as long as needed to provide the Service and as outlined in our Data Retention policy:

- **Active subscription:** Customer Data is retained indefinitely while the account is active.
- **Cancellation grace period:** **90 days** read-write access remains available so you can export.
- **Archive period:** After the grace period, the account moves to **1 year read-only**, accessible by request.
- **Deletion:** After the archive period, Customer Data is deleted from production systems within 30 days; encrypted backups expire on their normal rolling schedule (typically up to 35 days thereafter).
- **Billing and tax records** are retained as long as legally required.

You can request earlier deletion as described below.

## 7. Security

We take reasonable and appropriate measures to protect personal information, including:

- TLS 1.2+ in transit (TLS 1.3 where supported);
- Encryption at rest for databases and object storage;
- Role-based access control with least-privilege defaults;
- MFA required for FleetFlow staff with production access;
- Audit logging of administrative actions;
- Vulnerability management and dependency scanning;
- Annual third-party penetration testing;
- SOC 2 Type II in progress — target report date **[SOC2_TARGET]**.

No system is perfectly secure. You're responsible for keeping your credentials safe and configuring your account appropriately.

## 8. Your Choices

If you have an account, you can access, correct, or delete information through account settings, or contact your account owner. For end users (drivers, shipper contacts) whose data is in a carrier's account, we generally route requests through the carrier as the controller of that data. You may also email **privacy@[DOMAIN]** with:

- **Access** — a copy of personal information we hold about you;
- **Correction** — fix inaccurate information;
- **Deletion** — delete personal information, subject to legal and contractual retention;
- **Portability** — receive your information in a portable format.

We'll verify your identity and respond within timelines required by applicable law.

## 9. Cookies and Analytics

We use first-party and limited third-party cookies for authentication, preferences, security, and product analytics (PostHog). You can control cookies through your browser. We honor Global Privacy Control signals where required.

## 10. Children

The Service is a B2B carrier product not directed to children. We don't knowingly collect personal information from anyone **under 18**. If you believe we have, contact us and we'll delete it.

## 11. California Disclosures (CCPA/CPRA)

In the prior 12 months we have collected the following categories of personal information: identifiers, commercial information, internet/network activity, geolocation (driver event-based), professional/employment information, and inferences from the foregoing. We collect from you, from your authorized users, automatically through your use of the Service, and from service providers. We use it for the purposes in Section 3 and disclose it to the recipients in Section 5.

We **do not sell** personal information and **do not share** it for cross-context behavioral advertising. California residents may request access, deletion, correction, and to limit use of sensitive personal information, and may designate an authorized agent. We won't discriminate against you for exercising these rights. To submit a request, email **privacy@[DOMAIN]**.

## 12. Changes

We may update this policy. For material changes, we'll provide notice in-product or by email at least **30 days** before the change takes effect (unless a shorter period is required by law).

## 13. Contact

**[LEGAL_ENTITY_NAME]**
Privacy: **privacy@[DOMAIN]**
Mail: **[MAILING_ADDRESS]**
