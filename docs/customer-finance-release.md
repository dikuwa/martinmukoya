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
2. Follow the migration assurance and recovery procedure below. The repository's historical migrations assume an existing database.
3. Deploy pending migrations through the approved database change process after verifying the target ledger and schema.
4. Recheck the two new tables' RLS and effective API privileges. `scripts/secure-client-finance-tables.sql` is idempotent and fail-closed.
5. Complete staging browser verification with actual domain routing for `martinmukoya.com` and `flextech-media.com`, PDF output and document shares before promoting to production.
6. Promote only after migration has succeeded, then verify an existing quotation, existing receipt, lead, project and new customer in both sites.

## Migration assurance

The `migration-assurance` CI job reconstructs the versioned pre-finance schema at `0aa349d6e1a7c00a12d12be6d69a9d9652caa9ec` on disposable PostgreSQL. It seeds both identities and linked synthetic records, verifies the historical SQL files match the pinned revision, records those migrations as applied, and installs the baseline API-role restrictions. The first `prisma migrate deploy` must preserve every existing row and column value. The gate checks schema parity, foreign keys, payment-key uniqueness, issuer snapshots, and effective API grants. A second deploy must preserve the resulting row data, schema shape, and migration ledger.

To reproduce, use a checkout without `.env.local`, with dependencies installed and a fresh PostgreSQL instance on loopback. Create an empty database named `migration_assurance` and provide a disposable role that can create roles and owns the database. Run `bash tests/migrations/assurance.sh` with its loopback `DATABASE_URL`. CI uses synthetic records and credentials exclusively. Passing the gate does not establish the actual production revision.

## Forward-only recovery

1. Before deployment, verify a restorable backup or point-in-time recovery point. On the approved target, inspect `prisma migrate status` and reconcile the ledger and schema with the expected starting revision. For manually applied SQL, compare the actual schema, constraints, data changes and security settings with each migration before recording it as applied. Rehearse any reconciliation on an isolated copy first.
2. If deployment fails, stop promotion and preserve the migration name, Prisma error, ledger logs, and database state. Back up that state before attempting repair. Compare the actual objects and data with the migration SQL to determine exactly what committed.
3. If the failed migration fully rolled back, address the cause, mark the failed attempt rolled back with `prisma migrate resolve --rolled-back <migration>`, then rerun `prisma migrate deploy`. If changes committed partially, rehearse an approved forward repair that completes the missing changes. Verify the final schema, data and grants before recording the migration with `prisma migrate resolve --applied <migration>` and deploying the remaining history. See [Prisma's failed migration recovery guide](https://www.prisma.io/docs/orm/prisma-migrate/workflows/patching-and-hotfixing).
4. Correct successfully applied changes with a new migration. Preserve published snapshots and leave historical business snapshots with unknown issuers null. Recheck ledger status, affected rows, constraints, grants, and smoke tests before resuming promotion. Treat any restore or point-in-time recovery as a separate incident decision because it can discard later writes.

**No production migration, customer communication, merge or production deployment was carried out as part of development or testing.**
