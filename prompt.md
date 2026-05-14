# Claude Code — Build Prompt

Read the following files in order before doing anything:
1. `master_prompt.md` — Your tech stack rules, Prisma v7 patterns, and coding standards. Follow EXACTLY.
2. `design-style-guide.md` — The visual design system for this project. Apply to every component you build.
3. `jb-components.md` — The JB component reference. Use these components before writing from scratch.
4. `project-description.md` — What we are building. Every decision must align with this.
5. `project-phases.md` — The build plan. Work through phases in order.

## Rules
- Work through ONE phase at a time. Complete all tasks in a phase before moving to the next.
- After completing each phase, stop and confirm with me before proceeding.
- Follow `design-style-guide.md` tokens exactly: colors, typography, spacing, radius, cards, buttons, form inputs, navigation, and motion.
- Use Prisma v7 patterns, not Prisma v6. See `master_prompt.md` for the exact setup.
- Use React Query for all client data fetching and Redis for API-layer caching using `getCachedOrFetch()` and `invalidateTag()` from `src/lib/cache.ts`.
- Never use `useEffect` for normal data fetching.
- Use React Hook Form and Zod for all forms.
- Use API Routes / Route Handlers for all server-side logic.
- Use Framer Motion for animation. Do not add GSAP unless I explicitly request complex marketing scroll effects.
- Use `@react-pdf/renderer` for any future PDF generation. Never use jsPDF.
- Use `xlsx` for Excel export where needed.
- Follow the performance budget: `next/dynamic` for heavy imports, Suspense boundaries on every data-fetching section, ErrorBoundary on major page blocks, aspect-ratio on all images, and animate transform/opacity only.
- Before building auth, file uploads, checkout, data tables, dashboards, blogs, or editors from scratch, check `jb-components.md` and install the relevant component first.
- Keep public-facing copy plain-English and business-focused. Avoid excessive technical jargon.
- The site should present Martin Mukoya as a practical business-systems developer who helps businesses increase bookings, automate work, and turn visitors into clients.
- Use the main color `#553171` and CTA accent `#C6613F`. Avoid generic AI-looking gradients, blobs, and overdone glow effects.
- Use assets from `/assets/backgrounds`, `/assets/site`, `/assets/logos`, `/assets/hero-images`, `/assets/testimonials`, and `/assets/FAQs` where they fit. Use safe placeholders only when assets are missing.
- Mobile experience is critical. Implement a bottom navigation on mobile and ensure the chat widget and forms do not conflict with it.
- Build dark-first with optional light mode using `next-themes`.

## Start
Begin with **Phase 1 — Foundation** from `project-phases.md`. Read the phase tasks and execute them in order.
