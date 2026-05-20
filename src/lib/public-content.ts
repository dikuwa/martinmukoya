import { db } from "@/lib/db";
import type { PublicSiteConfig } from "@/lib/public-site-config";

export type PublicProject = PublicSiteConfig["projects"][number];
export type PublicBlogPost = PublicSiteConfig["blogPosts"][number];
export type PublicTestimonial = PublicSiteConfig["testimonials"][number];
export type PublicFAQ = PublicSiteConfig["faqs"][number];

function contentParagraphs(content: string) {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs.length > 0 ? paragraphs : [content];
}

export async function getPublicContent(site: PublicSiteConfig, siteId?: string | null) {
  if (!siteId) {
    return {
      projects: site.projects,
      featuredProjects: site.projects.filter((project) => project.featured),
      blogPosts: site.blogPosts,
      testimonials: site.testimonials,
      faqs: site.faqs
    };
  }

  const [dbProjects, dbBlogPosts, dbTestimonials, dbFaqs] = await Promise.all([
    db.project.findMany({
      where: { published: true, sites: { some: { id: siteId } } },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }]
    }),
    db.blogPost.findMany({
      where: { published: true, sites: { some: { id: siteId } } },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
    }),
    db.testimonial.findMany({
      where: { published: true, sites: { some: { id: siteId } } },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }]
    }),
    db.fAQ.findMany({
      where: { published: true, sites: { some: { id: siteId } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    })
  ]);

  const projects = dbProjects.length > 0
    ? dbProjects.map((project): PublicProject => ({
      title: project.title,
      slug: project.slug,
      summary: project.summary,
      description: project.description,
      problem: project.problem,
      solution: project.solution,
      outcome: project.outcome || "The build created a cleaner path from visitor intent to business follow-up.",
      clientType: project.clientType || "Business",
      industry: project.industry || "Digital systems",
      coverImage: project.coverImage || "/assets/hero-images/webp/hero-image.webp",
      gallery: project.gallery.length > 0 ? project.gallery : [project.coverImage || "/assets/hero-images/webp/hero-image.webp"],
      techStack: project.techStack,
      services: project.services,
      liveUrl: project.liveUrl || `/projects/${project.slug}`,
      githubUrl: project.githubUrl || "https://github.com/",
      featured: project.featured
    }))
    : site.projects;

  const blogPosts = dbBlogPosts.length > 0
    ? dbBlogPosts.map((post): PublicBlogPost => ({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      category: post.category || "Updates",
      tags: post.tags,
      coverImage: post.coverImage || "/assets/backgrounds/webP/brand-01.webp",
      publishedAt: (post.publishedAt || post.createdAt).toISOString(),
      content: contentParagraphs(post.content)
    }))
    : site.blogPosts;

  const testimonials = dbTestimonials.length > 0
    ? dbTestimonials.map((testimonial): PublicTestimonial => ({
      clientName: testimonial.clientName,
      role: testimonial.role || "Client",
      company: testimonial.company || site.brandName,
      quote: testimonial.quote,
      image: testimonial.image || "/assets/testimonials/testimonials.png"
    }))
    : site.testimonials;

  const faqs = dbFaqs.length > 0
    ? dbFaqs.map((faq): PublicFAQ => ({
      question: faq.question,
      answer: faq.answer
    }))
    : site.faqs;

  return {
    projects,
    featuredProjects: projects.filter((project) => project.featured),
    blogPosts,
    testimonials,
    faqs
  };
}
