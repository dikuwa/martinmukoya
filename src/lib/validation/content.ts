import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));
const stringArray = z.array(z.string().trim().min(1)).default([]);
const siteIds = z.array(z.string().trim().min(1)).default([]);
const siteSlugs = z.array(z.string().trim().min(1)).default([]);
const serviceTypeEnum = z.enum(["WEB_APP", "BOOKING_SYSTEM", "ECOMMERCE", "AI_AUTOMATION", "OTHER"]);
const preferredContactEnum = z.enum(["EMAIL", "PHONE", "WHATSAPP"]);
const leadStatusEnum = z.enum(["NEW", "REVIEWING", "CONTACTED", "QUALIFIED", "WON", "LOST", "ARCHIVED"]);
const contactMessageStatusEnum = z.enum(["NEW", "READ", "REPLIED", "ARCHIVED"]);
export const projectIconKeySchema = z.enum([
  "auto", "industry", "client", "timeline", "role", "deliverables", "problem", "solution", "outcome",
  "products", "speed", "enquiries", "security", "catalogue", "dashboard", "users", "payments",
  "documents", "settings", "automation", "analytics", "website", "mobile", "database", "code", "support", "custom"
]);
const projectListItemSchema = z.object({
  id: z.string().trim().optional(),
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  iconKey: projectIconKeySchema.default("auto"),
  sortOrder: z.number().int().nonnegative().default(0)
});
const galleryImageSchema = z.object({
  id: z.string().trim().optional(),
  url: z.string().trim().min(1),
  alt: z.string().trim().optional(),
  caption: z.string().trim().optional(),
  sortOrder: z.number().int().nonnegative().default(0)
});

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
  eyebrow: z.string().trim().optional(),
  timeline: z.string().trim().optional(),
  role: z.string().trim().optional(),
  deliverables: stringArray,
  stackSummary: z.string().trim().optional(),
  benefits: z.array(projectListItemSchema).default([]),
  capabilities: z.array(projectListItemSchema).default([]),
  coverImage: z.string().trim().optional(),
  coverImageAlt: z.string().trim().optional(),
  coverThumbnails: z.array(z.object({
    url: z.string().trim().min(1),
    alt: z.string().trim().optional(),
    sortOrder: z.number().int().nonnegative().default(0)
  })).default([]),
  gallery: stringArray,
  galleryImages: z.array(galleryImageSchema).default([]),
  techStack: stringArray,
  services: stringArray,
  liveUrl: optionalUrl,
  githubUrl: optionalUrl,
  ctaEyebrow: z.string().trim().optional(),
  ctaTitle: z.string().trim().optional(),
  ctaDescription: z.string().trim().optional(),
  ctaPrimaryLabel: z.string().trim().optional(),
  ctaPrimaryUrl: optionalUrl,
  ctaSecondaryLabel: z.string().trim().optional(),
  ctaSecondaryUrl: optionalUrl,
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

export const manualLeadSchema = z.object({
  name: z.string().trim().min(2, "Contact name is required"),
  company: z.string().trim().optional().default(""),
  email: z.string().trim().email("Enter a valid email address").optional().or(z.literal("")),
  phone: z.string().trim().optional().default(""),
  whatsAppNumber: z.string().trim().optional().default(""),
  preferredContact: preferredContactEnum.default("EMAIL"),
  source: z.enum(["website", "contact-form", "booking-form", "chatbot", "referral", "phone", "WhatsApp", "email", "walk-in", "manual", "other"]).default("manual"),
  serviceType: serviceTypeEnum.default("OTHER"),
  projectGoal: z.string().trim().min(2, "Add a short enquiry summary"),
  message: z.string().trim().optional().default(""),
  internalNotes: z.string().trim().optional().default(""),
  status: leadStatusEnum.default("NEW"),
  siteId: z.string().trim().min(1, "Select a site"),
  linkedProjectId: z.string().trim().optional().or(z.literal("")),
  followUpAt: z.string().trim().optional().or(z.literal("")),
  createAnyway: z.boolean().optional().default(false)
}).superRefine((value, context) => {
  if (!value.email && !value.phone && !value.whatsAppNumber) {
    context.addIssue({ code: "custom", path: ["email"], message: "Enter an email, phone, or WhatsApp number" });
  }
  for (const key of ["phone", "whatsAppNumber"] as const) {
    const phone = value[key];
    if (phone && !/^(?:\+264|0)[0-9\s()-]{6,15}$/.test(phone)) {
      context.addIssue({ code: "custom", path: [key], message: "Use a Namibia number such as 081… or +264…" });
    }
  }
});

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

export const contactMessageUpdateSchema = contactMessageSchema.partial().extend({
  internalNotes: z.string().trim().optional()
});

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
  metadata: z.record(z.string(), z.unknown()).optional()
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
