import type { Metadata } from "next";

export const PRIMARY_SITE_SLUG = "martin-mukoya";
export const FLEXTECH_SITE_SLUG = "flextech-media";

const primarySiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.SITE_URL ??
  "https://martinmukoya.com";

const flexTechSiteUrl = process.env.NEXT_PUBLIC_FLEXTECH_SITE_URL ?? "https://flextech-media.com";

export const siteUrl = normalizeBaseUrl(primarySiteUrl);

const siteBaseUrls: Record<string, string> = {
  [PRIMARY_SITE_SLUG]: siteUrl,
  [FLEXTECH_SITE_SLUG]: normalizeBaseUrl(flexTechSiteUrl)
};

const indexRobots: Metadata["robots"] = {
  index: true,
  follow: true
};

export const noIndexRobots: Metadata["robots"] = {
  index: false,
  follow: false
};

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export function normalizePath(path = "/") {
  if (!path || path === "/") return "/";
  const pathname = path.startsWith("/") ? path : `/${path}`;
  return pathname.replace(/\/+$/, "");
}

export function getSiteBaseUrl(siteSlug?: string | null) {
  return siteBaseUrls[siteSlug || PRIMARY_SITE_SLUG] ?? siteUrl;
}

export function canonicalUrl(path = "/", siteSlug?: string | null) {
  return new URL(normalizePath(path), `${getSiteBaseUrl(siteSlug)}/`).toString();
}

export function canonicalSiteForSharedContent(siteSlug?: string | null, isShared = true) {
  return isShared && siteSlug === FLEXTECH_SITE_SLUG ? PRIMARY_SITE_SLUG : siteSlug;
}

export function withCanonical(
  metadata: Metadata,
  path = "/",
  siteSlug?: string | null,
  options: { canonicalSiteSlug?: string | null; noindex?: boolean } = {}
): Metadata {
  const canonical = canonicalUrl(path, options.canonicalSiteSlug ?? siteSlug);

  return {
    ...metadata,
    metadataBase: new URL(getSiteBaseUrl(siteSlug)),
    alternates: {
      ...(metadata.alternates ?? {}),
      canonical
    },
    openGraph: {
      ...(metadata.openGraph ?? {}),
      url: canonical
    },
    robots: options.noindex ? noIndexRobots : metadata.robots ?? indexRobots
  };
}

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}
