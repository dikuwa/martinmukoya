# Canonical SEO Setup

This project uses the Next.js App Router, so canonical tags are generated with the Metadata API in `generateMetadata()`.

## Environment

Add these public base URLs in `.env.local` and Vercel:

```bash
NEXT_PUBLIC_SITE_URL="https://martinmukoya.com"
NEXT_PUBLIC_FLEXTECH_SITE_URL="https://flextech-media.com"
NEXT_PUBLIC_APP_URL="https://martinmukoya.com"
```

`NEXT_PUBLIC_SITE_URL` is the primary canonical site. `NEXT_PUBLIC_FLEXTECH_SITE_URL` is the agency site base URL. `NEXT_PUBLIC_APP_URL` remains as the legacy app URL fallback for existing integrations.

## App Router

Reusable helpers live in `src/lib/seo.ts`.

Public pages call `withCanonical(metadata, path, siteSlug)` inside `generateMetadata()`. This adds:

- `metadataBase`
- self-referencing canonical by default
- `og:url` matching the canonical URL
- `robots: index, follow`

Shared duplicate detail pages, such as project and blog entries reused on FlexTech, call:

```ts
withCanonical(metadata, `/projects/${slug}`, site.slug, {
  canonicalSiteSlug: canonicalSiteForSharedContent(site.slug)
});
```

That makes FlexTech copies canonicalize to the Martin Mukoya URL while Martin pages remain self-canonical.

Utility routes such as `/admin`, `/auth/sign-in`, `/auth/sign-up`, and `/login` use:

```ts
export const metadata: Metadata = {
  robots: noIndexRobots
};
```

## Pages Router Equivalent

If this project used `pages/`, place the helper in `lib/seo.ts` and use `next/head` per page:

```tsx
import Head from "next/head";
import { canonicalUrl } from "@/lib/seo";

export default function AboutPage() {
  const canonical = canonicalUrl("/about", "martin-mukoya");

  return (
    <>
      <Head>
        <link rel="canonical" href={canonical} />
        <meta property="og:url" content={canonical} />
        <meta name="robots" content="index, follow" />
      </Head>
      <main>{/* page content */}</main>
    </>
  );
}
```

For a noindex utility page:

```tsx
<Head>
  <meta name="robots" content="noindex, nofollow" />
</Head>
```
