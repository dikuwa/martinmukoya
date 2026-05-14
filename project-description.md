# Martin Mukoya Portfolio — Project Description

## What This App Does
Martin Mukoya Portfolio is a modern developer portfolio and lead-generation platform for winning freelance clients, business projects, and developer job opportunities. It presents Martin as a practical business-systems developer who helps organizations increase sales, reduce manual work, capture leads, automate workflows, and launch reliable web applications. The site combines public case studies, services, blog SEO, contact forms, AI-assisted chat, and a private admin dashboard for managing content and leads.

## Target Users
- **Primary user:** Namibian business owners, SMEs, clinics, schools, service providers, startups, and organizations that need websites, booking systems, e-commerce systems, automation, or AI integrations that solve real business problems.
- **Secondary user:** Recruiters and hiring managers who want to assess Martin’s technical capability, communication style, project outcomes, and problem-solving approach.
- **Admin user:** Martin, who manages projects, blog posts, testimonials, leads, chat handovers, analytics, and site content from a protected dashboard.

## Core Value Proposition
A conversion-focused portfolio that proves Martin can build practical digital systems that help businesses get more bookings, reduce friction, automate work, and turn visitors into clients.

## User Roles & Permissions
- **Visitor:** Can browse pages, read blogs, view projects, open case studies, start a project request, use WhatsApp/email/contact links, and interact with the AI assistant.
- **Recruiter:** Can browse projects, view technical case studies, open GitHub/live links where available, download or view Martin’s professional profile content, and contact Martin directly.
- **Admin:** Can log in securely, create/edit/delete projects, blog posts, testimonials, FAQs, and service content; view and manage leads; review contact submissions; track analytics; and monitor AI chat handovers.

## Features — Complete List
1. **Conversion-focused landing page** — A bold, minimal homepage with hero image, availability indicator, headline, CTA buttons, social icons, services preview, featured projects, testimonials, FAQs, and contact section.
2. **Responsive dual navigation** — A top contact/status bar with email, phone, availability indicator, and theme switcher; a sticky secondary navigation with logo, page links, and Start Project CTA; plus a mobile bottom navigation for quick access.
3. **Hero section** — Circular profile image from `/assets/hero-images`, green availability dot, strong business-focused headline, subtext, CTAs, social icons, and a faded tech stack row.
4. **Projects listing** — Responsive project cards showing image, app name, description, tech tags, live link, GitHub link, and case study link.
5. **Detailed project case studies** — Each project has its own page explaining the client/business problem, solution, process, features built, tech stack, business outcome, images, and CTA.
6. **Services section** — Cards for Web Applications, Booking Systems, E-commerce, and AI Automations & Integrations, using faded numbers/icons and plain-English benefit-focused descriptions.
7. **Technical blog** — SEO-friendly blog section for articles, tutorials, business technology insights, and developer notes, with tags, categories, images, code blocks, and copyable code snippets.
8. **Blog editor in dashboard** — Rich editor or MDX editor with support for headings, images, links, code blocks, syntax highlighting, SEO title, meta description, slug, tags, and published/draft status.
9. **Start Project multi-step form** — Guided modal/form that collects service type, business goal, budget range, timeline, current website/app status, contact details, and project description.
10. **Contact form** — Simple form for name, email, phone, message, inquiry type, and preferred contact method.
11. **Lead management dashboard** — Admin can view all project requests/contact submissions, update lead status, add internal notes, mark leads as contacted/won/lost, and filter by service type or source.
12. **AI assistant widget** — Chat assistant based on Martin’s services, FAQs, projects, process, and contact details; qualifies visitors and can hand over to WhatsApp/email/human follow-up.
13. **Human handover flow** — AI chat captures visitor name, contact, project need, and preferred channel, then creates a lead record and suggests WhatsApp/email continuation.
14. **Analytics dashboard** — Tracks traffic source, popular pages, CTA clicks, project views, WhatsApp clicks, form submissions, blog views, and conversion paths.
15. **Testimonials section** — Client/reviewer quotes with optional image, role, company, and project relationship, displayed in a modern card layout inspired by the reference assets.
16. **FAQ section** — Clear answers about pricing, timelines, process, support, hosting, maintenance, AI automation, booking systems, and e-commerce.
17. **About section** — Simple personal introduction with image/grid card layout explaining Martin’s approach, values, location, and practical business-first development style.
18. **Email notifications** — New leads/contact submissions notify Martin via `info@martinmukoya.com` using Resend.
19. **Direct contact options** — Prominent email, phone, and WhatsApp CTAs using `info@martinmukoya.com` and `+264 81 8563 005`.
20. **Theme support** — Dark-first design with optional light mode using the project palette.
21. **Asset-driven design** — Uses available assets from `/assets/backgrounds`, `/assets/site`, `/assets/logos`, `/assets/hero-images`, `/assets/testimonials`, and `/assets/FAQs`, with safe placeholder fallbacks.
22. **SEO foundation** — Metadata, OpenGraph images, sitemap, robots file, structured data for person/portfolio/blog posts, and clean semantic page structure.
23. **Admin CRUD for projects** — Create, update, delete, publish/unpublish, feature/unfeature, and reorder projects.
24. **Admin CRUD for testimonials and FAQs** — Manage displayed social proof and frequently asked questions.
25. **Responsive performance-first UI** — Mobile-first layout, image optimization, skeleton states, Suspense boundaries, and subtle transform/opacity animations.

## Data Model
- **User:** id string, name string, email string, image string optional, role enum ADMIN, createdAt datetime, updatedAt datetime.
- **Account:** id string, userId string, providerId string, accountId string, accessToken string optional, refreshToken string optional, expiresAt datetime optional.
- **Session:** id string, userId string, token string, expiresAt datetime, ipAddress string optional, userAgent string optional.
- **Project:** id string, title string, slug string unique, summary string, description string, problem string, solution string, outcome string optional, clientType string optional, industry string optional, coverImage string optional, gallery string array, techStack string array, services string array, liveUrl string optional, githubUrl string optional, caseStudyContent string, featured boolean, published boolean, sortOrder int, createdAt datetime, updatedAt datetime.
- **BlogPost:** id string, title string, slug string unique, excerpt string, content string, coverImage string optional, tags string array, category string optional, seoTitle string, seoDescription string, published boolean, publishedAt datetime optional, createdAt datetime, updatedAt datetime.
- **Lead:** id string, name string, email string, phone string optional, company string optional, serviceType enum WEB_APP BOOKING_SYSTEM ECOMMERCE AI_AUTOMATION OTHER, budgetRange string optional, timeline string optional, projectGoal string, message string, source string, preferredContact enum EMAIL PHONE WHATSAPP, status enum NEW REVIEWING CONTACTED QUALIFIED WON LOST ARCHIVED, internalNotes string optional, createdAt datetime, updatedAt datetime.
- **ContactMessage:** id string, name string, email string, phone string optional, inquiryType string optional, message string, sourcePage string optional, status enum NEW READ REPLIED ARCHIVED, createdAt datetime, updatedAt datetime.
- **Testimonial:** id string, clientName string, role string optional, company string optional, quote string, image string optional, projectId string optional, featured boolean, published boolean, sortOrder int, createdAt datetime, updatedAt datetime.
- **FAQ:** id string, question string, answer string, category string optional, published boolean, sortOrder int, createdAt datetime, updatedAt datetime.
- **ChatSession:** id string, visitorId string optional, leadId string optional, summary string optional, handedToHuman boolean, createdAt datetime, updatedAt datetime.
- **ChatMessage:** id string, sessionId string, role enum USER ASSISTANT SYSTEM, content string, createdAt datetime.
- **AnalyticsEvent:** id string, eventType string, page string optional, referrer string optional, source string optional, device string optional, country string optional, metadata json optional, createdAt datetime.
- **SiteSetting:** id string, key string unique, value json, updatedAt datetime.
- **Relationships:** A User can create and manage Projects, BlogPosts, FAQs, and Testimonials. A Project can have many Testimonials. A Lead can originate from a contact form, start-project form, AI chat, CTA click, or WhatsApp handover. A ChatSession can be linked to one Lead and contains many ChatMessages. AnalyticsEvents track visitor actions across pages.

## Pages / Screens
1. `/` — Main portfolio landing page with hero, services, featured projects, testimonials, about preview, FAQ, contact, and CTAs.
2. `/projects` — Public project gallery with filters by service type and technology.
3. `/projects/[slug]` — Project case study page showing problem, solution, features, results, images, tech stack, live link, GitHub link, and CTA.
4. `/services` — Service overview for Web Applications, Booking Systems, E-commerce, and AI Automations & Integrations.
5. `/about` — About Martin, working style, values, practical development approach, stack summary, and contact CTA.
6. `/blog` — SEO blog index with search, categories, tags, and featured posts.
7. `/blog/[slug]` — Blog article page with readable layout, code blocks, copy code buttons, images, and related posts.
8. `/contact` — Contact details and contact form with email, phone, WhatsApp, and location.
9. `/start-project` — Multi-step project intake form for service selection, budget, timeline, goals, contact details, and submission confirmation.
10. `/login` — Admin login page using Better Auth UI.
11. `/admin` — Protected dashboard overview with stats for leads, views, CTA clicks, popular pages, and recent submissions.
12. `/admin/projects` — Manage projects with searchable table, filters, create/edit/delete actions, publish status, and featured status.
13. `/admin/projects/new` — Create a new project.
14. `/admin/projects/[id]/edit` — Edit an existing project.
15. `/admin/blog` — Manage blog posts with drafts, published posts, filters, and actions.
16. `/admin/blog/new` — Create a new blog post using the editor.
17. `/admin/blog/[id]/edit` — Edit an existing blog post.
18. `/admin/leads` — Manage start-project submissions and contact leads with status filters and internal notes.
19. `/admin/leads/[id]` — View a lead profile, form answers, source, notes, and follow-up status.
20. `/admin/messages` — Manage contact form submissions separately from project leads.
21. `/admin/testimonials` — Manage testimonials and featured social proof.
22. `/admin/faqs` — Manage FAQ content.
23. `/admin/chat` — Review AI chat sessions, captured leads, and human handover status.
24. `/admin/analytics` — View traffic sources, page views, CTA clicks, WhatsApp clicks, form conversions, and popular content.
25. `/admin/settings` — Manage site content settings such as availability status, contact details, social links, and homepage copy.

## Integrations
- **Auth:** Better Auth with email/password. GitHub OAuth optional for admin convenience. Admin-only registration disabled after seed/admin creation.
- **Email:** Resend for contact notifications, project request notifications, and optional lead confirmation emails.
- **Payments:** None in v1.
- **File uploads:** Cloudflare R2 preferred for production asset uploads; UploadThing acceptable for faster setup if R2 credentials are not ready.
- **AI features:** Vercel AI SDK for portfolio assistant, lead qualification, FAQ answers, and handover summary generation.
- **Analytics:** PostHog for product analytics and conversion tracking, with internal AnalyticsEvent records for core CTA and lead events.
- **Dark mode:** Yes — dark-first design with optional light mode using next-themes.
- **Deployment:** Vercel with Cloudflare DNS and custom domain.

## JB Components to Install
- **Better Auth UI:** `pnpm dlx shadcn@latest add https://better-auth-ui.desishub.com/r/auth-components.json`
- **Data Table:** `pnpm dlx shadcn@latest add https://jb.desishub.com/r/data-table.json`
- **File Storage UI:** `pnpm dlx shadcn@latest add https://file-storage.desishub.com/r/file-storage.json`

## Out of Scope (v1)
- Client accounts or client portals.
- Online payments or subscription billing.
- Full CRM automation beyond lead status, notes, and contact records.
- Multi-admin team roles.
- Real-time live chat with agent assignment.
- Complex AI agents that perform external actions without admin approval.
- Full e-commerce inside the portfolio.
- Automatic proposal generation with pricing contracts.
