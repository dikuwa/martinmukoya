# Pre-Deploy Review Report

Date: 2026-05-17  
Project: Martin Mukoya Portfolio  
Stack: Next.js 16, TypeScript, Prisma v7, Supabase/Postgres, Better Auth, Upstash Redis, Resend, OpenAI, PostHog, Cloudflare R2

## Executive Summary

- Critical issues: 0
- High priority issues: 0 open, 3 addressed during review
- Medium priority issues: 3 open
- Low priority issues: 3 open

The app is in a good pre-deploy state for local QA. `pnpm lint`, `pnpm build`, `pnpm env:check`, and route smoke checks pass. Core local environment values are present. Production image uploads still need Cloudflare R2 keys, and external analytics still needs a PostHog project key.

## Critical Issues

No Critical issues found.

## High Priority Issues Addressed

### 1. Public Analytics Ingest Was Not Rate-Limited

Location: `src/app/api/analytics-events/route.ts`

Risk/Impact: Public page and CTA tracking posts to `/api/analytics-events`. Without rate limiting, a bot could create excessive database writes and noisy analytics.

Fix applied:
- Added `getClientIp()` and `rateLimit()`.
- Limit is now 120 analytics events per IP per hour.
- Returns `429` when exceeded.

Expected improvement: Reduces spam write risk and protects the analytics table from noisy public abuse.

### 2. Analytics Trend Query Could Grow Over Time

Location: `src/app/admin/analytics/page.tsx`

Risk/Impact: The conversion trend originally loaded all matching conversion events for an all-time dashboard view. This is fine for seeded data, but grows poorly after launch.

Fix applied:
- Trend calculations now use the selected date range.
- If viewing all-time summaries, the trend graph only reads the latest 30 days.

Expected improvement: Keeps dashboard trend work bounded as analytics data grows.

### 3. Chat Widget Was Eagerly Loaded In Public Shell

Location: `src/components/navigation/public-shell.tsx`

Risk/Impact: The AI chat widget is interactive and should not be part of the initial public page bundle when visitors may never open it.

Fix applied:
- Moved `AIChatbot` behind `next/dynamic` with `ssr: false`.

Expected improvement: Smaller initial client work for public pages while preserving chat behavior.

## Medium Priority Issues

### 1. Cloudflare R2 Keys Missing Locally

Location: `.env.local`, checked via `pnpm env:check`

Impact: Admin image uploads will fail until R2 credentials are added.

Action:
- Fill these values:
  - `CLOUDFLARE_R2_ACCESS_KEY_ID`
  - `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
  - `CLOUDFLARE_R2_ENDPOINT`
  - `CLOUDFLARE_R2_BUCKET_NAME`
  - `CLOUDFLARE_R2_PUBLIC_DEV_URL`

Guide: `docs/setup-api-keys.md`

### 2. PostHog Key Missing

Location: `.env.local`, checked via `pnpm env:check`

Impact: Internal analytics still works, but external PostHog analytics will not receive events.

Action:
- Add `NEXT_PUBLIC_POSTHOG_KEY`.
- Keep `NEXT_PUBLIC_POSTHOG_HOST` as the correct region host.

### 3. Browser Automation Was Partially Blocked

Location: Browser plugin session

Impact: Node-based route smoke checks passed, but the Browser plugin had a stale refused-connection page and blocked navigation from that data URL. This is a tooling/session issue, not an app failure.

Action:
- Re-run visual QA in a fresh browser session before final deployment.
- Manually check mobile home, start-project, contact, chat, and admin pages.

## Low Priority Issues

### 1. Redis Tag Invalidation Uses SCAN

Location: `src/lib/cache.ts`

Impact: Current `SCAN` invalidation is acceptable at small scale. At higher traffic or many cache keys, invalidation could become slower.

Future improvement:
- Maintain explicit Redis sets per tag, or use a versioned tag key strategy.

### 2. Production Security Headers Are Conservative But No CSP Yet

Location: `next.config.ts`

Impact: Basic security headers are present: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`. A full CSP is not yet configured because inline structured data and third-party analytics need careful allowances.

Future improvement:
- Add a production Content Security Policy after final domains and analytics/storage hosts are confirmed.

### 3. AI Chat Error Logging Could Be More Structured

Location: `src/app/api/ai-chat/route.ts`

Impact: Error logs are useful during setup but could be cleaner in production.

Future improvement:
- Replace raw `console.error` calls with structured logger helpers that redact provider response bodies.

## Verification Performed

Commands:

```bash
pnpm env:check
pnpm lint
pnpm build
```

Route smoke checks:

```text
/ 200
/start-project 200
/contact 200
/admin/chat 200
/sitemap.xml 200
/robots.txt 200
```

## Security Checklist

- Admin routes are protected by Better Auth session and role checks.
- Admin API mutations use `requireAdmin()`.
- Contact, lead, AI chat, and analytics endpoints have rate limiting.
- File upload endpoint requires admin access.
- File upload endpoint validates image type and size.
- Secrets are not printed by `pnpm env:check`.
- Basic security headers are configured.
- Sitemap and robots are present.

## Deployment Readiness

Ready for final staging QA once these are done:

1. Add Cloudflare R2 credentials if admin image uploads are required before launch.
2. Add PostHog key if external analytics is required before launch.
3. Set production values in Vercel:
   - `NEXT_PUBLIC_APP_URL`
   - `BETTER_AUTH_URL`
   - all required secrets from `.env.example`
4. Run database push/seed against the production database.
5. Verify Resend domain so emails send from `info@martinmukoya.com`.
6. Run one fresh browser visual QA pass on mobile and desktop.
