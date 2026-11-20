# Client & finance workflows — release handoff (20 November 2026)

Repository: `dikuwa/martinmukoya`
Feature branch: `feat/customer-finance-20261120`
Isolated worktree: `/Users/stunna/Dev/martinmukoya-finance`
Baseline: `0aa349d6e1a7c00a12d12be6d69a9d9652caa9ec`

## Delivered

- Shared customer directory using the pre-existing `Contact` table (no duplicate customer master).
- Client contact, WhatsApp, address, town, notes, stage, search, editing and duplicate-contact detection.
- Quick one-off service and service catalogue, using `Booking.kind=SERVICE` to reuse document/payment architecture without requiring an admin to create a project manually.
- Existing customer can initiate a full project with details prefilled.
- Quotes and invoices inherit quick-job descriptions and default amounts.
- FlexTech Media preferred as issuer for new quick jobs; personal issuer remains selectable, and issuer lookup resolves real site IDs.
- Open balances, overdue count, per-customer invoice/payment summaries and partial-payment entry.
- Contextual payment reminder text and invoice link. WhatsApp/email actions launch user-controlled composers; preparation history is not proof of delivery.
- New private finance tables and additive migration with an RLS deny policy and revoked API grants.

## Tests completed

- Prisma schema validation and Prisma Client generation: pass.
- TypeScript: pass.
- Production build: pass.
- Unit/access-control: 108/108 pass.
- Real Chrome E2E against isolated PostgreSQL: 1/1 pass, including customer creation, quick job, invoice issue, partial payment and balance reconciliation.
- Additive migration from a clean recreation of the committed baseline: pass on disposable PostgreSQL 15.
- RLS, column grants, and `anon`/`authenticated` query-denial checks: pass.

## Important pre-release actions

1. Verify an approved backup and production database revision; avoid blind `prisma db push`.
2. Inspect existing Prisma migration ledger. The repo's historical migrations are not a complete clean-database bootstrap. The isolated test therefore recreated the committed schema before applying the new feature migration.
3. On the approved target, apply only `prisma/migrations/20261120000000_customer_finance_workflows/migration.sql` through the established database change process. It contains both schema changes and RLS protections in one transaction.
4. Recheck the two new tables' RLS and effective API privileges. `scripts/secure-client-finance-tables.sql` is idempotent and fail-closed.
5. Complete staging browser verification with actual domain routing for `martinmukoya.com` and `flextech-media.com`, PDF output and document shares before promoting to production.
6. Promote only after migration has succeeded, then verify an existing quotation, existing receipt, lead, project and new customer in both sites. Keep a rollback plan.

**No production migration, customer communication, merge or production deployment was carried out as part of development or testing.**
