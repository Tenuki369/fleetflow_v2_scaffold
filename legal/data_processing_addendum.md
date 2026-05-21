> ⚠️ Template only. Not legal advice. Have an attorney licensed in your jurisdiction review before publishing. Placeholders are wrapped in `[BRACKETS]`.

# FleetFlow TMS — Data Processing Addendum

**Effective Date: [EFFECTIVE_DATE]**

This Data Processing Addendum ("DPA") supplements the agreement between **[LEGAL_ENTITY_NAME]** ("FleetFlow," "Processor") and the customer entity ("Customer," "Controller") for the FleetFlow TMS service (the "Agreement"). In the event of conflict between this DPA and the Agreement on the subject of personal data, this DPA controls.

## 1. Definitions

- **"Customer Data"** has the meaning in the Agreement.
- **"Personal Data"** means Customer Data that identifies or relates to an identifiable natural person, processed by FleetFlow on Customer's behalf.
- **"Processor"** means FleetFlow when processing Personal Data on Customer's behalf; **"Controller"** means Customer.
- **"Sub-processor"** means a third party engaged by FleetFlow to process Personal Data.
- **"Data Subject," "Process/Processing," "Security Incident"** have their ordinary US privacy-law meanings.

## 2. Subject Matter, Duration, Nature, Purpose

**Subject matter.** Provision of the Service to Customer.
**Duration.** The term of the Agreement, plus retention windows in Section 9.
**Nature and purpose.** Hosting, storing, transmitting, securing, and supporting Customer Data so Customer can operate its trucking business.
**Categories of Data Subjects.** Customer's personnel, drivers, and Customer's business contacts (shippers, brokers, consignees).
**Categories of Personal Data.** Identifiers, contact info, role/employment data, account/login data, document content uploaded by Customer (e.g., BOL, POD, rate cons), event-based driver location data tied to load acknowledgments, and Service usage data.

## 3. Processing Instructions

FleetFlow will process Personal Data only (a) to provide and support the Service in accordance with the Agreement and this DPA, (b) per Customer's documented reasonable instructions (the Agreement and standard product configuration constitute such instructions), and (c) as required by law (with notice to Customer where permitted). FleetFlow will inform Customer if, in its opinion, an instruction violates applicable privacy law.

## 4. Confidentiality of Personnel

FleetFlow ensures personnel authorized to process Personal Data are bound by written confidentiality obligations and receive appropriate privacy and security training.

## 5. Security Measures

FleetFlow will maintain a written information security program with technical and organizational measures appropriate to the risk, including at minimum:

- **TLS 1.3** (or TLS 1.2 where 1.3 is not supported by a client) for data in transit;
- **Encryption at rest** for production databases and object storage;
- **Role-based access control** with least-privilege defaults and quarterly access reviews;
- **MFA required** for FleetFlow administrators and any personnel with production access;
- **Audit logging** of administrative and security-relevant events;
- Secure software development practices, dependency scanning, and patching;
- **Annual third-party penetration test**;
- Backup, business continuity, and incident response procedures;
- SOC 2 Type II program in progress — target completion **[SOC2_TARGET]**.

## 6. Sub-processors

Customer generally authorizes FleetFlow to use Sub-processors. As of the Effective Date, FleetFlow's Sub-processors are:

| Sub-processor | Purpose | Region |
|---|---|---|
| AWS (or Cloudflare R2) | Object storage for uploaded documents | US |
| Neon | Managed PostgreSQL | US |
| Vercel | Application hosting | US |
| Clerk | Authentication | US |
| Stripe | Payment processing | US |
| Resend | Transactional email | US |
| Sentry | Error monitoring | US |
| PostHog | Product analytics | US |
| Inngest | Background job processing | US |

The current list is maintained at **[SUBPROCESSOR_PAGE_URL]**. FleetFlow will give Customer **at least 30 days' prior notice** of any new or replacement Sub-processor (by email or in-product, with subscription to the subprocessor page constituting valid notice). Customer may object on reasonable data-protection grounds within that period; if the parties cannot resolve the objection, Customer may terminate the affected portion of the Service for convenience and receive a prorated refund of prepaid unused fees. FleetFlow will impose data-protection obligations on each Sub-processor that are no less protective than those in this DPA and remains liable for Sub-processor acts and omissions to the same extent as for its own.

## 7. Data Subject Requests

Taking into account the nature of the Processing, FleetFlow will provide reasonable assistance — through appropriate technical and organizational measures and the Service's self-service tools — to help Customer respond to verifiable Data Subject requests (access, correction, deletion, portability, and the like). FleetFlow will acknowledge a request for assistance from Customer **within 10 business days**. If FleetFlow receives a request directly from a Data Subject about Customer Data, FleetFlow will not respond substantively and will redirect the Data Subject to Customer, except as required by law.

## 8. Security Incidents

FleetFlow will notify Customer **within 72 hours** after confirming a Security Incident affecting Customer's Personal Data. The notice will include, to the extent then known, a description of the incident, the categories and approximate number of Data Subjects and records affected, likely consequences, and measures taken or proposed. FleetFlow will reasonably cooperate with Customer's investigation and required notifications. Routine unsuccessful login attempts, scans, and pings are not Security Incidents.

## 9. Return and Deletion

On expiration or termination of the Agreement, FleetFlow will handle Customer Data per the retention windows in the Agreement and Privacy Policy: **90-day read-write grace period**, then **1-year read-only archive**, then deletion from production systems within 30 days, with encrypted backups expiring on their normal rolling schedule. Customer may at any time during the grace period export its data through the Service. On Customer's written request after the grace period, FleetFlow will delete Customer Data sooner, subject to legally required retention.

## 10. Audits

Customer acknowledges that FleetFlow serves many similar customers and that broad on-site audit rights aren't practical. FleetFlow will, on written request not more than **once per 12-month period** and subject to NDA:

- provide FleetFlow's most recent SOC 2 report (once available) and a summary of its security program;
- respond to a reasonable security questionnaire; and
- if and only if a regulator requires more, permit a third-party audit by a mutually agreed independent auditor, at Customer's expense, on reasonable advance notice, during business hours, with minimal disruption, and subject to confidentiality.

## 11. International Transfers

The Service is operated in the **United States** and Personal Data is hosted with US-based Sub-processors. FleetFlow does not transfer Personal Data outside the US in connection with the Service. If that changes, FleetFlow will update this DPA and provide notice in accordance with Section 6.

## 12. Liability

Each party's liability under this DPA is subject to the limitations and exclusions of liability in the Agreement, and any liability arising under this DPA counts toward (and does not increase) the aggregate liability cap in the Agreement. Nothing in this DPA expands either party's liability beyond what the Agreement provides.

## 13. Order of Precedence; Miscellaneous

This DPA forms part of, and is governed by, the Agreement. Except as amended by this DPA, the Agreement remains in full force and effect. If any provision is held unenforceable, the rest survives.

**[LEGAL_ENTITY_NAME]**
Contact for data protection matters: **privacy@[DOMAIN]**
