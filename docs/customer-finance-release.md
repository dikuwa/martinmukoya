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

## Production status and migration authority (verified 21 November 2026)

The finance feature has already been released. PR #5 (test harness) was merged as `ce3cd05`; PR #7 (reminder E2E coverage) was merged as `b642dd3`. Both post-merge GitHub build/E2E runs passed, Vercel reported the production deployments Ready, and public sign-in/homepage routes on both domains returned HTTP 200. Signed-in production finance visual QA, including PDF shares and existing customer documents, **remains outstanding**; local synthetic E2E is not a substitute.

**The two November production schema changes were applied and recorded through Supabase's migration history, not Prisma's separate history.** Read-only verification against the authorized `martin_mukoya` Supabase project established:

| Applied Supabase migration | Matching tracked SQL | Integrity evidence |
| --- | --- | --- |
| `20261117024841_secure_public_tables` | `prisma/migrations/20261117000000_secure_public_tables/migration.sql` | Exact byte-for-byte MD5 `9d96067101a0d0ad81eced5fec18e21e` (2,808 bytes) |
| `20261120131953_customer_finance_workflows_20261120` | `prisma/migrations/20261120000000_customer_finance_workflows/migration.sql` | Exact MD5 `1c83f8bb77df07c0cbf25890b85841c3` (3,572 bytes) after removing only the source file's outer `BEGIN;` and `COMMIT;` lines (including their line endings) |

The live schema has the expected finance tables, columns, indexes, foreign keys and restrictive `deny_public_api` policies. All 34 public base tables have RLS enabled; tested `anon`/`authenticated` direct finance-table privileges were denied. Supabase security advisors reported no findings at the time of inspection.

Prisma's `public."_prisma_migrations"` is a **different ledger**: it has 12 entries (nine finished, three rolled back), the newest beginning on 29 October 2026. It contains neither of the November Supabase-tracked changes. This is not evidence that the SQL has failed to run; it **is** a potential hazard if someone later invokes `prisma migrate deploy` or assumes that Prisma's ledger is authoritative for those migrations.

### Safe follow-up procedure

1. Treat Supabase's migration registry as the **verified source of application history for these two November changes**. Before future schema work, choose and document one canonical migration workflow, including how checked-in Prisma SQL is recorded.
2. Before any production schema command, verify an approved backup and migration/drift state using read-only metadata; independently review the exact SQL and expected effects. Never blindly run `prisma db push`, `prisma migrate deploy`, `db:reset` or replay these already-applied SQL files against production.
3. Do **not** insert or edit rows in `_prisma_migrations` or mark migrations resolved as a bookkeeping shortcut. Any explicit ledger reconciliation or migration-system change needs a separate reviewed plan, authority and owner approval.
4. In disposable CI/local databases only, the existing test harness reconstructs the historical Prisma baseline and applies the reviewed SQL. The standard CI `db:push` step runs against disposable Postgres, **not** production.
5. Complete authorized authenticated, **read-only** finance QA on both domains (existing customer directory, quotations, invoices, receipts, PDFs, invoice shares, balances and reminders). Any synthetic live write, email or WhatsApp message requires separate explicit authorization.

Tracking and verification evidence: [GitHub Issue #6](https://github.com/dikuwa/martinmukoya/issues/6). No production data or migration ledgers were modified by these read-only checks.
