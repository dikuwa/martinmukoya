# Security review — 17 November 2026

Implemented on `fix/security-review-20261117`. Application rollout and live RLS
application are separate operations. No application deployment, live RLS change,
share-link migration, schema push, seed or reset was performed by this task.

## Application changes

- Every notification handler checks admin authorization before work; settings GET
  endpoints also require admin. Existing public pages use server-side helpers and
  do not need a new public settings API.
- Existing chat sessions require their matching visitor token for AI chat and lead
  linking. Unknown sessions fail without replacement or token disclosure; the
  client sends its stored token.
- All shared document access paths check document state and revocation. Financial
  void/reversal revokes shares in the same transaction. New credentials have 192
  random bits. Regeneration updates the unique share row and retires the legacy
  financial credential. See [shared-link-rollout.md](shared-link-rollout.md).
- Share URLs and named credentials are recursively redacted from analytics;
  PostHog's own API token is preserved. Recording is disabled and referrers use
  `no-referrer`.
- Rate limiting fails closed with controlled errors on missing/unhealthy Redis.
  Only validated Vercel-controlled IP headers are trusted. Other hosts share a
  bucket and require a configured trusted-proxy design before deploying there.
- pnpm 10.12.4 lockfile is tracked; npm lockfile removed, CI pins pnpm, Vercel uses
  frozen pnpm installation. CommonJS hooks have a narrow `require` lint override.

## Verification

- Unit/regression suite: 83/83 pass, synthetic/stubbed providers and database.
  Includes every notification method for anonymous/nonadmin/admin; settings;
  own/wrong/missing/unknown chat credentials; AI and human/lead handoff; public
  document GET/download/accept/decline; transaction revocation and legacy token
  rotation; analytics redaction; rate limiting missing/error/normal/exceeded/IP.
- `bash tests/rls.integration.sh`: pass in disposable Docker PostgreSQL 17.
  Covers model allowlist, absent tables, idempotence, direct/column grants,
  existing permissive policy, trusted BYPASSRLS role, denied API operations,
  inherited TRUNCATE fail-closed behavior.
- TypeScript: pass. Production build: pass. Full lint: no errors, 40 warnings.
- Clean temporary pnpm 10.12.4 frozen install: pass (`--ignore-scripts`);
  normal installed client generation/build checked separately.
- Built app HTTP checks: home/contact/start-project/sign-in return 200; all eight
  anonymous notification/settings operations return 401; real admin login and
  protected count/settings reads succeed; test session signed out.
- Live homepage/sign-in read-only HTTP checks return 200. No production contact,
  lead, document mutation or browser submission test was performed. Full
  production browser and submission QA remains a rollout requirement.

## Separate RLS rollout remains pending

Confirmed Supabase project `martin_mukoya` (`ujuxpamgzerbksmqbxqj`), healthy.
Security Advisor reported **31 RLS-disabled public tables**; `User` already had RLS
and two permissive policies. The prepared migration protects all 32 known tables,
including `User`, four implicit relation tables and `_prisma_migrations`.
No unrelated public tables, views or security-definer functions were found.
`anon` and `authenticated` had neither BYPASSRLS nor parent-role memberships.

The local `.env.local` connection targets this project as `postgres`, owns all
32 tables, has required privileges independently of PUBLIC, and bypasses RLS.
Vercel production DATABASE_URL is sensitive and cannot be pulled, so the
**deployed role and other consumers are still unconfirmed**. Do not infer the
production role from local or owner-tool access. Confirm those facts, follow the
preflight in [deployment-checklist.md](deployment-checklist.md), then apply the
migration and rerun advisor/effective-privilege/API and production application QA.
Until then the live 31-table finding remains unresolved.
