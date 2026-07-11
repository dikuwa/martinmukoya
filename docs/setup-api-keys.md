# API Keys Setup Guide

This project works locally with the keys in `.env.local`. For deployment, paste the same values into Vercel project environment variables.

## Required Before Launch

### 1. Supabase Database
- Go to: https://supabase.com/dashboard/projects
- Open your project.
- Go to `Project Settings` -> `Database`.
- Copy the transaction pooler connection string.
- Paste it as:

```bash
DATABASE_URL="postgresql://..."
```

### 2. Upstash Redis
- Go to: https://console.upstash.com/redis
- Open your Redis database.
- Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
- Paste them as:

```bash
UPSTASH_REDIS_URL="https://..."
UPSTASH_REDIS_TOKEN="..."
```

### 3. Better Auth Secret
- Generate a long random secret here: https://generate-secret.vercel.app/32
- Paste it as:

```bash
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"
```

For production, change `BETTER_AUTH_URL` to the live website URL.

### 4. Resend Email
- Go to: https://resend.com/api-keys
- Create an API key.
- Paste it as:

```bash
RESEND_API_KEY="..."
RESEND_FROM_EMAIL="Martin Mukoya <info@martinmukoya.com>"
```

For production emails from `info@martinmukoya.com`, also verify the domain in Resend:
https://resend.com/domains

### 5. OpenAI
- Go to: https://platform.openai.com/api-keys
- Create an API key.
- Paste it as:

```bash
OPENAI_CHATBOT_API_KEY="..."
OPENAI_CHATBOT_MODEL="gpt-4.1-mini"
OPENAI_DOCUMENTS_API_KEY="..."
OPENAI_DOCUMENTS_MODEL="gpt-4.1"
```

### 6. Public Website URL
For local development:

```bash
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

For production, use the final live website URL.

## Needed For Admin Image Uploads

### Cloudflare R2
- Go to: https://dash.cloudflare.com/
- Open `R2 Object Storage`.
- Create a bucket.
- Create an R2 API token.
- Copy the S3 endpoint, access key, secret key, and bucket name.
- For `CLOUDFLARE_R2_PUBLIC_DEV_URL`, open the bucket, go to `Settings`, then enable either:
  - `Public Development URL` and copy the `https://pub-....r2.dev` URL, or
  - a custom public domain if you connected one.
- Paste them as:

```bash
CLOUDFLARE_R2_ACCESS_KEY_ID="..."
CLOUDFLARE_R2_SECRET_ACCESS_KEY="..."
CLOUDFLARE_R2_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
CLOUDFLARE_R2_BUCKET_NAME="..."
CLOUDFLARE_R2_PUBLIC_DEV_URL="https://..."
```

If these are missing, the site still runs, but admin image uploads will fail.

## Recommended But Optional

### PostHog Analytics
- Go to: https://us.posthog.com/project/settings
- Open `Project Settings`.
- Copy the `Project API key`. It is public/client-safe and usually starts with `phc_`.
- Paste it as:

```bash
NEXT_PUBLIC_POSTHOG_KEY="..."
NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"
```

Use `https://eu.i.posthog.com` instead if your PostHog project is in the EU region.

### GitHub Login
Only needed if you want GitHub sign-in in addition to email/password.

- Go to: https://github.com/settings/developers
- Create an OAuth App.
- Callback URL for local:

```text
http://localhost:3000/api/auth/callback/github
```

- Paste values as:

```bash
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

For production, create/update the callback URL using the live domain:

```text
https://your-domain.com/api/auth/callback/github
```

## Admin Account

Used by the seed script:

```bash
ADMIN_NAME="Martin Mukoya"
ADMIN_EMAIL="info@martinmukoya.com"
ADMIN_PASSWORD="..."
```

After changing the admin email or password, run:

```bash
pnpm db:seed:admin
```
