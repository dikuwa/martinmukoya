import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));
const stringArray = z.array(z.string().trim().min(1)).default([]);
const siteIds = z.array(z.string().trim().min(1)).default([]);
const siteSlugs = z.array(z.string().trim().min(1)).default([]);
const serviceTypeEnum = z.enum(["WEB_APP", "BOOKING_SYSTEM", "ECOMMERCE", "AI_AUTOMATION", "OTHER"]);
const preferredContactEnum = z.enum(["EMAIL", "PHONE", "WHATSAPP"]);
const leadStatusEnum = z.enum(["NEW", "REVIEWING", "CONTACTED", "QUALIFIED", "WON", "LOST", "ARCHIVED"]);
const contactMessageStatusEnum = z.enum(["NEW", "READ", "REPLIED", "ARCHIVED"]);

export const projectSchema = z.object({
  title: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  summary: z.string().trim().min(10),
  description: z.string().trim().min(10),
  problem: z.string().trim().min(10),
  solution: z.string().trim().min(10),
  outcome: z.string().trim().optional(),
  clientType: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  coverImage: z.string().trim().optional(),
  gallery: stringArray,
  techStack: stringArray,
  services: stringArray,
  liveUrl: optionalUrl,
  githubUrl: optionalUrl,
  caseStudyContent: z.string().trim().min(10),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  authorId: z.string().trim().optional(),
  siteIds,
  siteSlugs
});

export const projectUpdateSchema = projectSchema.partial();

export const blogPostSchema = z.object({
  title: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  excerpt: z.string().trim().min(10),
  content: z.string().trim().min(10),
  coverImage: z.string().trim().optional(),
  tags: stringArray,
  category: z.string().trim().optional(),
  seoTitle: z.string().trim().min(2),
  seoDescription: z.string().trim().min(10),
  published: z.boolean().default(false),
  publishedAt: z.coerce.date().optional(),
  authorId: z.string().trim().optional(),
  siteIds,
  siteSlugs
});

export const blogPostUpdateSchema = blogPostSchema.partial();

export const leadSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  serviceType: serviceTypeEnum,
  budgetRange: z.string().trim().optional(),
  timeline: z.string().trim().optional(),
  projectGoal: z.string().trim().min(10),
  message: z.string().trim().min(10),
  source: z.string().trim().default("website"),
  preferredContact: preferredContactEnum.default("EMAIL"),
  status: leadStatusEnum.default("NEW"),
  internalNotes: z.string().trim().optional(),
  siteId: z.string().trim().optional(),
  siteSlug: z.string().trim().optional()
});

export const leadUpdateSchema = leadSchema.partial();

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  inquiryType: z.string().trim().optional(),
  message: z.string().trim().min(10),
  sourcePage: z.string().trim().optional(),
  status: contactMessageStatusEnum.default("NEW"),
  siteId: z.string().trim().optional(),
  siteSlug: z.string().trim().optional()
});

export const contactMessageUpdateSchema = contactMessageSchema.partial();

export const testimonialSchema = z.object({
  clientName: z.string().trim().min(2),
  role: z.string().trim().optional(),
  company: z.string().trim().optional(),
  quote: z.string().trim().min(10),
  image: z.string().trim().optional(),
  projectId: z.string().trim().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  authorId: z.string().trim().optional(),
  siteIds,
  siteSlugs
});

export const testimonialUpdateSchema = testimonialSchema.partial();

export const faqSchema = z.object({
  question: z.string().trim().min(5),
  answer: z.string().trim().min(10),
  category: z.string().trim().optional(),
  published: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  authorId: z.string().trim().optional(),
  siteIds,
  siteSlugs
});

export const faqUpdateSchema = faqSchema.partial();

export const analyticsEventSchema = z.object({
  eventType: z.string().trim().min(2),
  siteId: z.string().trim().optional(),
  siteSlug: z.string().trim().optional(),
  page: z.string().trim().optional(),
  referrer: z.string().trim().optional(),
  source: z.string().trim().optional(),
  device: z.string().trim().optional(),
  country: z.string().trim().optional(),
  metadata: z.record(z.unknown()).optional()
});

export const siteSettingSchema = z.object({
  siteId: z.string().trim().optional(),
  siteSlug: z.string().trim().optional(),
  key: z.string().trim().min(2),
  value: z.unknown()
});

export const siteSettingUpdateSchema = z.object({
  value: z.unknown()
});
