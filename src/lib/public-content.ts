import { db } from "@/lib/db";
import type { PublicSiteConfig } from "@/lib/public-site-config";

export type ProjectListItem = { id?: string; title: string; description?: string; iconKey?: string; sortOrder?: number };
export type ProjectGalleryImage = { id?: string; url: string; alt?: string; caption?: string; sortOrder?: number };
export type PublicProject = PublicSiteConfig["projects"][number] & {
  eyebrow?: string;
  timeline?: string;
  role?: string;
  deliverables?: string[];
  stackSummary?: string;
  benefits?: ProjectListItem[];
  capabilities?: ProjectListItem[];
  coverImageAlt?: string;
  galleryImages?: ProjectGalleryImage[];
  caseStudyContent?: string;
  ctaEyebrow?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  ctaPrimaryLabel?: string;
  ctaPrimaryUrl?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryUrl?: string;
};
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

function objectArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value.filter((item): item is T => Boolean(item && typeof item === "object")) : [];
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
      eyebrow: project.eyebrow || undefined,
      timeline: project.timeline || undefined,
      role: project.role || undefined,
      deliverables: project.deliverables,
      stackSummary: project.stackSummary || undefined,
      benefits: objectArray<ProjectListItem>(project.benefits),
      capabilities: objectArray<ProjectListItem>(project.capabilities),
      coverImage: project.coverImage || "/assets/hero-images/webp/hero-image.webp",
      coverImageAlt: project.coverImageAlt || undefined,
      gallery: project.gallery.length > 0 ? project.gallery : [project.coverImage || "/assets/hero-images/webp/hero-image.webp"],
      galleryImages: objectArray<ProjectGalleryImage>(project.galleryImages),
      techStack: project.techStack,
      services: project.services,
      liveUrl: project.liveUrl || "",
      githubUrl: project.githubUrl || "",
      caseStudyContent: project.caseStudyContent,
      ctaEyebrow: project.ctaEyebrow || undefined,
      ctaTitle: project.ctaTitle || undefined,
      ctaDescription: project.ctaDescription || undefined,
      ctaPrimaryLabel: project.ctaPrimaryLabel || undefined,
      ctaPrimaryUrl: project.ctaPrimaryUrl || undefined,
      ctaSecondaryLabel: project.ctaSecondaryLabel || undefined,
      ctaSecondaryUrl: project.ctaSecondaryUrl || undefined,
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
