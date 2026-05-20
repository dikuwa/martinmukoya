import type { MetadataRoute } from "next";
import { blogPosts, projects } from "@/lib/site-data";
import { absoluteUrl } from "@/lib/seo";

const publicRoutes = ["/", "/projects", "/services", "/about", "/blog", "/contact", "/faq", "/start-project"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...publicRoutes.map((route) => ({
      url: absoluteUrl(route),
      lastModified: now,
      changeFrequency: (route === "/" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: route === "/" ? 1 : 0.8
    })),
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: project.featured ? 0.8 : 0.6
    })),
    ...blogPosts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7
    }))
  ];
}
