# Deployment Checklist

Use this checklist for the final Vercel + Cloudflare launch pass.

## 1. Vercel Environment Variables

Copy the values from `.env.local` into Vercel, but change the URL values below for production.

### Production URL Values

```bash
BETTER_AUTH_URL="https://martinmukoya.com"
NEXT_PUBLIC_APP_URL="https://martinmukoya.com"
SITE_URL="https://martinmukoya.com"
SITE_NAME="Martin Mukoya"
```

If launching on a temporary Vercel preview first, use the preview URL for `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL`, then change both to the final domain before production launch.

### Required Secrets

```bash
DATABASE_URL="..."
UPSTASH_REDIS_URL="..."
UPSTASH_REDIS_TOKEN="..."
BETTER_AUTH_SECRET="..."
RESEND_API_KEY="..."
RESEND_FROM_EMAIL="Martin Mukoya <info@martinmukoya.com>"
OPENAI_CHATBOT_API_KEY="..."
OPENAI_CHATBOT_MODEL="gpt-4.1-mini"
OPENAI_DOCUMENTS_API_KEY="..."
OPENAI_DOCUMENTS_MODEL="gpt-4.1"
NEXT_PUBLIC_POSTHOG_KEY="..."
NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"
CLOUDFLARE_R2_ACCESS_KEY_ID="..."
CLOUDFLARE_R2_SECRET_ACCESS_KEY="..."
CLOUDFLARE_R2_ENDPOINT="..."
CLOUDFLARE_R2_BUCKET_NAME="..."
CLOUDFLARE_R2_PUBLIC_DEV_URL="..."
ADMIN_NAME="Martin Mukoya"
ADMIN_EMAIL="info@martinmukoya.com"
ADMIN_PASSWORD="..."
```

### Optional

```bash
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
AI_GATEWAY_API_KEY=""
OPENROUTER_API_KEY=""
OPENROUTER_MODEL="openai/gpt-4o-mini"
UPLOADTHING_TOKEN=""
```

## 2. Pre-Deploy Commands

Run locally before deploy:

```bash
node scripts/check-env.mjs
./node_modules/.bin/eslint
./node_modules/.bin/next build
```

Current status: all three pass locally.

## 3. Production Database

After Vercel env vars are set, run the production database push/seed against the production `DATABASE_URL` only when you are ready:

```bash
pnpm db:push
pnpm db:seed
pnpm db:seed-admin
```

Do not run a force reset on production.

## 4. Cloudflare DNS

After Vercel gives the production domain target:

1. Add `martinmukoya.com` to the Vercel project.
2. Add the required DNS records in Cloudflare.
3. Keep SSL/TLS mode compatible with Vercel, usually `Full`.
4. Wait for Vercel to show the domain as valid.

## 5. Final Production QA

Check these after deployment:

- Home, About, Services, Projects, Blog, Contact, FAQ, Start Project render.
- `/admin` redirects or requires login.
- Admin login works.
- Contact form creates a message and sends email.
- Start Project creates a lead and sends email.
- AI assistant returns a real response.
- AI human handoff opens WhatsApp.
- Admin image upload returns a public R2 image URL.
- PostHog receives a test event.
- `/sitemap.xml` and `/robots.txt` load.
- Mobile nav and chat widget do not overlap form fields.
