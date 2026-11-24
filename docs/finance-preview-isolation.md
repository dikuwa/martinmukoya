# MARTINMUKOYA / FlexTech finance preview isolation

## Current release gate

The Vercel project historically assigned the same `DATABASE_URL` and many other secret variables to **Production and Preview**. A Preview must never execute financial writes against production Supabase.

The `src/lib/database-isolation.ts` guard denies DB access in `VERCEL_ENV=preview` unless:
- `PREVIEW_DATABASE_ISOLATED=true` is explicitly configured; and
- `DATABASE_URL` is a valid PostgreSQL URL **not** pointing at the production Supabase project.

This is a **fail-closed safety gate, not proof of isolation**. No flag should be set before independent inspection of the target DB and secrets. Production is unaffected by the guard. Until the staging DB is provided, DB-dependent Preview routes will intentionally fail rather than read or mutate production.

## No-charge hosted database route

One possible independent option is the [Aiven free PostgreSQL tier](https://aiven.io/docs/products/postgresql/concepts/pg-free-tier); verify the provider's current free quota and available region before signup. Aiven account creation/connection is an owner action. Do not sign up for a paid plan or use any existing unrelated application database.

1. Create a dedicated **free** PostgreSQL service (no production data or credentials).
2. Connect to the staging server securely and migrate the schema with the verified Prisma migration sequence. Apply RLS/security SQL only within this staging server. Seed synthetic test sites, customers, and administrator.
3. In **Vercel Preview scoped only to branch `codex/finance-payment-concurrency`**, configure new values for `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` as appropriate for staging. Do not overwrite or remove Production targets. Disable/replace any Preview email, Redis, storage, social-login, and API credentials also shared with production before executing potentially side-effecting tests. Retain Vercel authentication protections.
4. Only after independently verifying the staging connection targets a fresh DB, set the Preview-only `PREVIEW_DATABASE_ISOLATED=true`. Redeploy the exact PR commit to pick up branch-scoped configuration.
5. Run both site identities through authenticated mobile/desktop E2E against the **actual Vercel Preview**: customer, lead, service, invoice/quote, PDF, concurrent payment 201+409, reversal, void prevention, and unsent reminder preparation.
6. Verify all GitHub CI jobs, Vercel build, RLS, actual deployment commit, rollback reference, and production backup before authorizing merge or release.

## Evidence available before this gate

- GitHub PR #16 has existing CI, isolated Mac Postgres, and hosted HTTPS tunnel acceptance evidence recorded in its PR conversation.
- The two tunnel identities passed 34/34 finance API checks with synthetic data.
- Two no-JavaScript fallback regression tests passed.
- Temporary public tunnels have been shut down; the isolated Mac database is preserved offline.

The temporary HTTPS tunnels are **not** equivalent to a Vercel Preview wired to its own hosted PostgreSQL. No claim of completed Vercel Preview acceptance should be made until step 5 passes.

## Control Room verification — 22 November 2026

- Draft PR #16 remote head `a1e3031` remains unmerged. A local-only follow-up commit `bab85e5` serializes Prisma Decimal-containing values before passing customer, service and booking form props across Server/Client Component boundaries. **Not pushed**: current Vercel Preview environment still carries a Production/Preview shared `DATABASE_URL` target, and hosted database isolation is unverified.
- On the local PR worktree, changed-file ESLint and TypeScript passed, and **118/118 unit/security tests passed**. All six database-isolation guard checks passed.
- Disposable PostgreSQL 15 baseline recreation, additive finance migration and `anon`/`authenticated` API-role denial passed. This is not a production migration.
- Authenticated synthetic Chrome E2E passed **2/2** after the serialization patch: customer creation, duplicate matching, service catalogue editing/archive/restore, quotation/invoice and PDF, concurrent payment acceptance/conflict, reversals, void protection, reminder preparation, and mobile dark-theme workflow. Next.js Decimal serialization warnings: **0** in the final test-server log. The disposable test database was stopped by the runner afterward.
- The connected Supabase organization is Free with two active projects (`martin_mukoya` and `autoagent`); no separate branch exists. Neon is on a usage-billed Launch organization. Neither should be expanded or repurposed without a verified no-charge path.
- Aiven Free PostgreSQL is a documented no-credit-card, $0 managed PostgreSQL option (`https://aiven.io/free-postgresql-database`). Account creation/authorization is an owner action; no Aiven account is currently connected to the Mac or ChatGPT. Once connected, confirm plan/quotas, provision a dedicated staging service, test migration and compatibility, configure PR-branch-only Vercel Preview credentials and non-production integrations, verify the destination, then enable `PREVIEW_DATABASE_ISOLATED=true` and run authenticated hosted acceptance.
- **Release gate remains HOLD**. No production database access, migrations, merges, production deployments, or customer communications were performed. Do not present prior tunnel testing or local E2E as Vercel Preview acceptance.
