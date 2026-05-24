import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { detectSlugFromHost, getSiteBaseUrl } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const siteSlug = detectSlugFromHost(host);
  const baseUrl = getSiteBaseUrl(siteSlug);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"]
    },
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
