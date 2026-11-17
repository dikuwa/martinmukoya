# Production security rollout — 17 November 2026

The security fixes are deployed at https://www.martinmukoya.com and published to
`dikuwa/martinmukoya` main. RLS was applied separately from the application release.
No production schema push, seed or reset was used.

## Protection applied

- All notification methods and settings GET endpoints require admin authorization
  before work. Public pages retain their server-side settings consumers.
- Existing chat sessions require the matching visitor token for AI messages and
  lead linking; unknown sessions fail without replacement or token disclosure.
- Shared document page/API/PDF/action/legacy paths check status and revocation.
  Voiding and receipt reversal revoke shares in the same financial transaction.
- New share credentials use 192 random bits. Regeneration rotates the unique share
  row and invalidates its financial legacy credential. Analytics recursively
  redacts shared-link URLs/referrers/properties, preserves PostHog's API key,
  disables recording, and uses `Referrer-Policy: no-referrer`.
- Missing/unhealthy Redis fails closed. IP extraction trusts only validated
  Vercel-controlled headers; another hosting platform needs its own trusted proxy
  configuration before deployment.
- pnpm 10.12.4 has a tracked lockfile and frozen Vercel/CI installation. CI uses
  isolated PostgreSQL, Redis and synthetic credentials, creates a usable test
  admin account, and pins a Playwright-supported Ubuntu runner.

## Supabase and existing links

Verified the actual production runtime targets `ujuxpamgzerbksmqbxqj` as
`postgres`, owns all 32 public tables, has all required DML privileges independent
of PUBLIC, and bypasses RLS. A temporary admin-only candidate diagnostic was used
for this check, then its deployment was deleted; the diagnostic route is absent
from the live release (404). Production Redis also passed a real limiter check.

Applied `secure_public_tables`: RLS enabled for all 32 public tables, PUBLIC and
API table/column grants revoked, restrictive API deny policies added. Effective
privileges confirm anon/authenticated cannot SELECT, INSERT, UPDATE, DELETE,
TRUNCATE, REFERENCES, TRIGGER or MAINTAIN protected tables. Both roles have no
parent-role memberships or RLS bypass. Direct REST probes for User, Session,
Account, Lead, ContactMessage, SiteSetting and SharedDocument return 401.
**Security Advisor now reports zero security findings.** No unrelated public
tables, views or security-definer functions were found. No Data API traffic was
observed in the audited 24-hour logs; repository access is through server Prisma.

Rotated all **23** weak share codes and cleared associated legacy financial
credentials. **9** valid shares remain enabled with new tokens; **14** shares are
disabled because they were already disabled or their documents are non-shareable.
Old links no longer work. Replacement links are available to administrators;
client delivery was not automated. See [shared-link-rollout.md](shared-link-rollout.md).

## Verification

- 83/83 unit/regression tests pass, including authorization, chat ownership,
  document public routes, transaction revocation, token rotation, analytics and
  rate-limit errors/configuration/limits/IP spoofing.
- Disposable Docker PostgreSQL 17 RLS integration passes: model coverage,
  repeatability, absent tables, table/column grants, existing permissive policies,
  trusted access, denied API operations and inherited TRUNCATE fail-closed checks.
- TypeScript, production build and lint pass; lint retains 40 warnings. Clean
  frozen installation succeeds, including Prisma generation on the Vercel build.
- **46/46 production application checks pass**: anonymous/nonadmin guards for every
  notification method/settings, admin reads/login, contact and lead submissions,
  own AI/human chat and messages, missing/wrong credentials and lead linking.
- Production synthetic document tests pass: financial/business pages, APIs, real
  PDFs, legacy paths, old/void/revoked denial, financial/business accept/decline
  persistence, authenticated void and receipt reversal with database verification.
- Real Chrome browser smoke passes: home, contact, start-project and admin login;
  admin signed out. Browser interception observed three PostHog requests and zero
  occurrences of a synthetic shared-link token in URLs or payloads.
- All synthetic users, submissions, chats, notifications, analytics, sites,
  bookings, documents, shares and payments were removed; exact-ID/marker readback
  verified cleanup. Destructive bulk notification actions were tested locally,
  not against existing production notifications.

GitHub workflow results are recorded in [CI runs](https://github.com/dikuwa/martinmukoya/actions/workflows/ci.yml).
After future authorized `prisma db push` operations, reapply `pnpm db:secure` and
extend its allowlist for new application and implicit relation tables, as detailed
in [deployment-checklist.md](deployment-checklist.md).
