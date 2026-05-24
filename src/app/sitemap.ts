import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { blogPosts, projects } from "@/lib/site-data";
import { canonicalUrl, FLEXTECH_SITE_SLUG, PRIMARY_SITE_SLUG } from "@/lib/seo";

function detectSlugFromHost(host: string | null): string {
  const h = host?.split(":")[0]?.toLowerCase() ?? "";
  if (h.includes(FLEXTECH_SITE_SLUG)) return FLEXTECH_SITE_SLUG;
  if (h.includes("localhost") || h.includes("127.0.0.1")) return PRIMARY_SITE_SLUG;
  return PRIMARY_SITE_SLUG;
}

const publicRoutes = ["/", "/projects", "/services", "/about", "/blog", "/contact", "/faq", "/start-project"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const siteSlug = detectSlugFromHost(host);

  const now = new Date();

  return [
    ...publicRoutes.map((route) => ({
      url: canonicalUrl(route, siteSlug),
      lastModified: now,
      changeFrequency: (route === "/" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: route === "/" ? 1 : 0.8
    })),
    ...projects.map((project) => ({
      url: canonicalUrl(`/projects/${project.slug}`, siteSlug),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: project.featured ? 0.8 : 0.6
    })),
    ...blogPosts.map((post) => ({
      url: canonicalUrl(`/blog/${post.slug}`, siteSlug),
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7
    }))
  ];
}
