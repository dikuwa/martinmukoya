# Martin Mukoya Portfolio — Build Phases

## Phase 1 — Foundation
**Goal:** Project scaffolded, design system applied, env files created, database connected, Redis cache configured, auth working, and public shell ready.

### Tasks
- [ ] Initialize Next.js 16 project with TypeScript, Tailwind v4, shadcn/ui, App Router, ESLint, and pnpm.
- [ ] Create `.env.example` and `.env.local` with every required env var for Database, Redis, Better Auth, Resend, Vercel AI SDK, PostHog, and file storage.
- [ ] Add `.env.local` to `.gitignore`.
- [ ] Set up Prisma v7 with Neon PostgreSQL, Prisma config, generated client, and initial schema.
- [ ] Set up Upstash Redis cache client in `src/lib/cache.ts` with `getCachedOrFetch()` and `invalidateTag()` wrappers. Add `@upstash/redis` to dependencies.
- [ ] Apply `design-style-guide.md` tokens to `globals.css` using Tailwind v4 CSS-first `@theme` directive. Do not create `tailwind.config.ts` unless required by a dependency.
- [ ] Add fonts using `next/font` with Inter Tight for display headings and Inter for body.
- [ ] Create root layout with metadata, QueryClientProvider, ThemeProvider using next-themes, Toaster, and dark-first default theme.
- [ ] Build public layout shell: top contact/status bar, sticky nav, logo slot, desktop nav, CTA, theme switcher, and mobile bottom nav.
- [ ] Build admin layout shell: protected sidebar, admin nav, user section, page header, breadcrumbs, and mobile admin drawer.
- [ ] Build shared components: Section, Container, Button variants, Badge, StatCard, EmptyState, SkeletonCard, ErrorBoundary, PageHeader, CopyCodeButton.
- [ ] Install JB Better Auth UI: `pnpm dlx shadcn@latest add https://better-auth-ui.desishub.com/r/auth-components.json`.
- [ ] Integrate installed auth files into existing routes without overwriting custom layouts.
- [ ] Configure Better Auth env vars: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, optional GitHub OAuth keys.
- [ ] Create admin-only auth logic and protected route middleware for `/admin`.
- [ ] Seed first admin user from env variables.
- [ ] Build custom 404, error, global loading, and admin loading pages.
- [ ] Verify login, logout, protected routes, theme switching, public nav, and mobile bottom nav.

### Dependencies
- Neon database created and `DATABASE_URL` set.
- Upstash Redis database created and `UPSTASH_REDIS_URL` plus `UPSTASH_REDIS_TOKEN` set.
- Resend account created and `RESEND_API_KEY` set.
- PostHog project created and public key/host set.
- File storage provider selected: Cloudflare R2 preferred, UploadThing acceptable.

---

## Phase 2 — Public Portfolio Experience
**Goal:** Complete public-facing marketing site with strong conversion flow and responsive design.

### Tasks
- [ ] Build homepage sections in order: Hero, TechStackStrip, ServicesPreview, FeaturedProjects, WhyWorkWithMe, Testimonials, AboutPreview, FAQPreview, ContactCTA.
- [ ] Hero must use circular profile image from `/assets/hero-images` if available, otherwise a typed placeholder avatar.
- [ ] Add green availability indicator and availability copy from SiteSetting.
- [ ] Build social icon row for GitHub, LinkedIn, Facebook, Email, and WhatsApp using one consistent icon set.
- [ ] Build service cards for Web Applications, Booking Systems, E-commerce, and AI Automations & Integrations with faded number/icon treatment.
- [ ] Build responsive project cards with image, title, summary, tech tags, live link, GitHub link, and case study link.
- [ ] Build `/projects` with filters by service type and featured status.
- [ ] Build `/projects/[slug]` case study page with sections: Overview, Problem, Solution, Features, Results, Tech Stack, Gallery, CTA.
- [ ] Build `/services` with plain-English service explanations, who each service is for, common problems solved, and CTA.
- [ ] Build `/about` with image grid/card layout and business-first personal story.
- [ ] Build `/contact` with contact info, form, WhatsApp CTA, and location set to Namibia.
- [ ] Build FAQ section/page using accordion UI.
- [ ] Add subtle Framer Motion entrance animations using transform and opacity only.
- [ ] Add parallax only to decorative background assets and hero layers, not to content that affects readability.
- [ ] Optimize all images with `next/image`, aspect ratios, blur placeholders where possible, and responsive sizes.
- [ ] Add SEO metadata to all public pages.

### Dependencies
- Phase 1 complete.
- Asset folders available or placeholder fallbacks created.

---

## Phase 3 — Data Models, API Routes, and Seed Data
**Goal:** Core database schema, route handlers, caching, and realistic starter content implemented.

### Tasks
- [ ] Define Prisma schema for User, Account, Session, Project, BlogPost, Lead, ContactMessage, Testimonial, FAQ, ChatSession, ChatMessage, AnalyticsEvent, and SiteSetting.
- [ ] Run database migration: `pnpm db:push && pnpm db:generate`.
- [ ] Create `prisma/seed.ts` with realistic records: 8+ projects, 12+ blog posts, 8+ testimonials, 12+ FAQs, 30+ analytics events, 15+ example leads/messages, and default site settings.
- [ ] Add scripts: `db:push`, `db:generate`, `db:seed`, `db:studio`.
- [ ] Build API route handlers with Zod validation and Redis caching for public GET routes.
- [ ] Build mutation routes that invalidate relevant Redis cache tags.
- [ ] Create endpoints for projects, blog posts, testimonials, FAQs, leads, contact messages, analytics events, and site settings.
- [ ] Add server-side pagination, filtering, sorting, and search for admin list endpoints.
- [ ] Verify every public GET route caches via Redis and every mutation invalidates related tags.

### Dependencies
- Phase 1 complete.

---

## Phase 4 — Admin Dashboard and CRUD
**Goal:** Martin can manage all portfolio content, leads, and analytics from a protected dashboard.

### Tasks
- [ ] Install JB Data Table: `pnpm dlx shadcn@latest add https://jb.desishub.com/r/data-table.json`.
- [ ] Build `/admin` overview with stat cards: total leads, new leads, project views, CTA clicks, blog views, WhatsApp clicks, and conversion rate.
- [ ] Build `/admin/projects` data table with search, service filters, published filter, featured filter, pagination, and row actions.
- [ ] Build project create/edit forms using React Hook Form and Zod validation.
- [ ] Build `/admin/blog` data table with published/draft filter, category filter, search, pagination, and row actions.
- [ ] Build blog create/edit form with rich content editor or MDX editor, code block support, copy-code support, image upload, tags, SEO title, SEO description, slug, and published status.
- [ ] Build `/admin/leads` with status filters, service filters, budget filters, and lead source filters.
- [ ] Build lead detail page with form answers, internal notes, source, status update, and quick contact links.
- [ ] Build `/admin/messages` for contact form submissions.
- [ ] Build testimonials CRUD.
- [ ] Build FAQs CRUD.
- [ ] Build `/admin/settings` for contact details, availability status, social links, homepage copy, and CTA labels.
- [ ] Wrap data-fetching sections in Suspense and ErrorBoundary.
- [ ] Add empty states and loading skeletons for all admin pages.
- [ ] Ensure all admin pages respect protected auth state.

### Dependencies
- Phase 3 complete.

---

## Phase 5 — Lead Capture, Email, and Notifications
**Goal:** Contact forms, project intake, lead notifications, and follow-up workflows are production-ready.

### Tasks
- [ ] Install and configure Resend and React Email.
- [ ] Build contact form route with spam protection, Zod validation, and rate limiting using Redis.
- [ ] Build Start Project multi-step form with service type, business goal, budget range, timeline, website/app status, contact details, and message.
- [ ] Store all submissions as Lead or ContactMessage records.
- [ ] Send new lead notification to `info@martinmukoya.com`.
- [ ] Send optional confirmation email to the visitor using plain, professional language.
- [ ] Track analytics events for form started, step completed, form submitted, WhatsApp clicked, email clicked, and CTA clicked.
- [ ] Add success screens with next steps and WhatsApp CTA.
- [ ] Add admin lead status workflow: NEW, REVIEWING, CONTACTED, QUALIFIED, WON, LOST, ARCHIVED.

### Dependencies
- Phase 3 complete.
- Resend verified domain or test sender configured.

---

## Phase 6 — AI Assistant and Human Handover
**Goal:** Visitors can ask questions, get service guidance, and hand over to Martin when ready.

### Tasks
- [ ] Install and configure Vercel AI SDK.
- [ ] Create AI system prompt based on Martin’s services, projects, FAQs, process, contact details, and positioning.
- [ ] Build chat widget UI with compact collapsed state, expanded chat panel, clear “Talk to Martin” handover CTA, and mobile-safe layout.
- [ ] Add route handler for AI chat with streaming responses.
- [ ] Add guardrails: no fake pricing guarantees, no pretending to be human, no external actions without explicit user intent.
- [ ] Add lead capture inside chat when user asks about a project, pricing, timeline, booking, or consultation.
- [ ] Store ChatSession and ChatMessage records.
- [ ] Generate admin-readable chat summaries.
- [ ] Create handover flow that suggests WhatsApp or contact form continuation and creates a lead record.
- [ ] Build `/admin/chat` for reviewing sessions and handover status.
- [ ] Rate-limit chat requests with Redis.

### Dependencies
- Phase 5 complete.
- AI provider API key set.

---

## Phase 7 — File Uploads and Media Management
**Goal:** Admin can upload and manage project, blog, testimonial, and hero assets.

### Tasks
- [ ] Install JB File Storage UI: `pnpm dlx shadcn@latest add https://file-storage.desishub.com/r/file-storage.json` if using R2/S3.
- [ ] Configure Cloudflare R2 or selected file upload provider env vars.
- [ ] Build image upload field for projects, blog posts, testimonials, and settings.
- [ ] Validate image type and size.
- [ ] Store image URLs in database records.
- [ ] Add image previews and remove/replace actions.
- [ ] Ensure uploaded images render with `next/image` and defined aspect ratios.

### Dependencies
- Phase 4 complete.

---

## Phase 8 — Analytics and Conversion Tracking
**Goal:** Martin can understand where users come from and which pages/CTAs generate leads.

### Tasks
- [ ] Configure PostHog client and server utilities.
- [ ] Track page views, project views, blog views, CTA clicks, WhatsApp clicks, email clicks, Start Project form starts, form submissions, and AI handovers.
- [ ] Store important conversion events in AnalyticsEvent for dashboard summaries.
- [ ] Build analytics dashboard charts for traffic sources, top pages, CTA performance, lead source, device type, and conversion trend.
- [ ] Add date range filters: 7 days, 30 days, 90 days, all time.
- [ ] Keep analytics privacy-friendly and avoid exposing personal lead details inside aggregate charts.

### Dependencies
- Phase 5 complete.

---

## Phase 9 — Polish, Accessibility, SEO, and Deploy
**Goal:** App is production-ready, fast, accessible, responsive, and live.

### Tasks
- [ ] Run full responsive QA on mobile, tablet, laptop, and desktop.
- [ ] Verify mobile bottom nav does not block form fields or chat widget.
- [ ] Verify keyboard navigation, focus states, aria labels, color contrast, and reduced-motion support.
- [ ] Verify all forms handle loading, success, validation errors, and server errors.
- [ ] Verify all CRUD operations end-to-end.
- [ ] Verify Redis caching and mutation invalidation.
- [ ] Verify auth flows on mobile and desktop.
- [ ] Verify email notifications using Resend.
- [ ] Verify AI chat guardrails and handover flow.
- [ ] Add sitemap, robots.txt, OpenGraph images, Person schema, BlogPosting schema, and WebSite schema.
- [ ] Run bundle analysis and apply `next/dynamic` to heavy editor, charts, AI chat, and admin-only imports.
- [ ] Run pre-deploy code review using `pre-deploy-review.md` from VibeKit. Save output to `pre-deploy-review-report.md`.
- [ ] Address all Critical issues from the review.
- [ ] Set all environment variables in Vercel.
- [ ] Deploy to Vercel.
- [ ] Configure Cloudflare DNS and custom domain.
- [ ] Verify SSL, production auth URL, email domain, sitemap, and forms.

### Production Checklist
- [ ] All env vars set in Vercel.
- [ ] Database migrations applied to production.
- [ ] Admin account created securely.
- [ ] Auth flows work on production URL.
- [ ] Custom domain live with SSL.
- [ ] Emails land in inbox.
- [ ] File uploads work in production.
- [ ] Forms create leads correctly.
- [ ] WhatsApp and email links work.
- [ ] AI assistant works and respects guardrails.
- [ ] 404 and error pages styled.
- [ ] Lighthouse performance, accessibility, best practices, and SEO reviewed.
