import { db } from "@/lib/db";
import { headers } from "next/headers";

export const DEFAULT_SITE_SLUG = "martin-mukoya";
export const FLEXTECH_SITE_SLUG = "flextech-media";

export const seedSites = [
  {
    name: "Martin Mukoya",
    slug: DEFAULT_SITE_SLUG,
    primaryDomain: "martinmukoya.com",
    aliases: ["www.martinmukoya.com", "localhost", "127.0.0.1"]
  },
  {
    name: "FlexTech Media",
    slug: FLEXTECH_SITE_SLUG,
    primaryDomain: "flextech-media.com",
    aliases: ["www.flextech-media.com", "flextech-media.localhost"]
  }
] as const;

function normalizeHost(host: string | null) {
  return host?.split(":")[0]?.toLowerCase() ?? "";
}

export async function getSiteBySlug(slug?: string | null) {
  return db.site.findUnique({ where: { slug: slug || DEFAULT_SITE_SLUG } });
}

export async function getDefaultSite() {
  return getSiteBySlug(DEFAULT_SITE_SLUG);
}

export async function getCurrentSite() {
  const headerStore = await headers();
  const host = normalizeHost(headerStore.get("x-forwarded-host") ?? headerStore.get("host"));

  if (!host) return getDefaultSite();

  const site = await db.site.findFirst({
    where: {
      OR: [
        { primaryDomain: host },
        { aliases: { has: host } },
        { slug: host.split(".")[0] }
      ]
    }
  });

  return site ?? getDefaultSite();
}

export async function getSiteFilter(siteSlug?: string | null) {
  if (!siteSlug || siteSlug === "all") return {};
  const site = await getSiteBySlug(siteSlug);
  return site ? { siteId: site.id } : { siteId: "__missing_site__" };
}

export async function getSiteConnection(siteSlug?: string | null) {
  const site = await getSiteBySlug(siteSlug);
  return site ? { connect: { id: site.id } } : undefined;
}

type SiteAssignment = {
  connect?: Array<{ id: string } | { slug: string }>;
  set?: Array<{ id: string } | { slug: string }>;
};

export function siteAssignment(siteIds?: string[], siteSlugs?: string[], mode: "connect" | "set" = "connect"): SiteAssignment | undefined {
  const ids = siteIds?.filter(Boolean) ?? [];
  const slugs = siteSlugs?.filter(Boolean) ?? [];

  if (ids.length > 0) {
    return { [mode]: ids.map((id) => ({ id })) };
  }

  if (slugs.length > 0) {
    return { [mode]: slugs.map((slug) => ({ slug })) };
  }

  return undefined;
}
