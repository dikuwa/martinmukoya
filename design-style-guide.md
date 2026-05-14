# Martin Mukoya Portfolio — Design Style Guide

## Visual reference
The visual direction comes from dark minimalist developer portfolio references with bold centered typography, circular profile imagery, strong navigation clarity, project cards on dark surfaces, and a confident editorial tone. The design should feel intentional, premium, and human-built rather than generic AI-generated. It should combine a dark graphite/purple foundation, Martin’s primary color `#553171`, warm CTA accent `#C6613F`, subtle card borders, generous spacing, simple iconography, and restrained motion.

Dark mode: supported and used as the default experience. Light mode is optional but must preserve the same brand rhythm.

---

## 1. Design Philosophy
The site must position Martin as a business problem-solver, not only a web developer. Every visual decision should support clarity, trust, and conversion.

Core principles:
- Clear over clever.
- Business outcomes over technical jargon.
- Bold hierarchy with minimal decoration.
- Dark-first premium presentation.
- Subtle motion, never distracting.
- Easy navigation for business owners and recruiters.
- Human, intentional design that does not look like a generated template.

The design should feel like a refined developer portfolio mixed with a focused boutique agency site.

---

## 2. Brand Personality
- **Confident:** Strong headings, decisive CTAs, concise copy.
- **Helpful:** Plain-English service descriptions and guided project intake.
- **Modern:** Clean layout, soft transitions, optimized responsive behavior.
- **Strategic:** Case studies focus on business problems, solutions, and outcomes.
- **Premium but accessible:** Professional enough for recruiters, simple enough for local businesses.

Avoid:
- Overused gradients.
- Neon cyberpunk effects.
- AI-looking blobs and excessive glow.
- Dense technical stack lists.
- Tiny text and unclear CTAs.
- Abrupt animations.

---

## 3. Color System
Use the project palette consistently across Tailwind v4 CSS-first tokens.

### Core palette
- **Primary:** `#553171` — deep royal purple used for brand surfaces, focus states, nav accents, and subtle highlights.
- **Primary dark:** `#301C40`
- **Primary darker:** `#21132D`
- **Primary light:** `#74459A`
- **Primary tint:** `#EEE7F4`

- **Accent / CTA:** `#C6613F` — warm copper used for primary buttons, key CTAs, important badges, and conversion points.
- **Accent dark:** `#94472E`
- **Accent light:** `#D98263`
- **Accent tint:** `#F7E6DF`

### Dark mode base
- **Background:** `#0F0D14`
- **Background elevated:** `#15111D`
- **Surface:** `#1C1725`
- **Surface soft:** `#241C2F`
- **Border:** `#382B47`
- **Border subtle:** `rgba(255,255,255,0.08)`
- **Text strong:** `#F7F3FA`
- **Text normal:** `#D7CEDF`
- **Text muted:** `#A99AB8`
- **Text faint:** `#756681`

### Light mode base
- **Background:** `#FBF9FC`
- **Background elevated:** `#FFFFFF`
- **Surface:** `#FFFFFF`
- **Surface soft:** `#F3EEF7`
- **Border:** `#E4DCEB`
- **Text strong:** `#17111F`
- **Text normal:** `#33263F`
- **Text muted:** `#6D5C7D`

### Semantic colors
- **Success:** `#22C55E`
- **Warning:** `#F59E0B`
- **Error:** `#EF4444`
- **Info:** `#38BDF8`

### Token example
```css
@theme {
  --color-brand-primary: #553171;
  --color-brand-primary-dark: #301C40;
  --color-brand-accent: #C6613F;
  --color-background: #0F0D14;
  --color-surface: #1C1725;
  --color-border: #382B47;
  --color-text-strong: #F7F3FA;
  --color-text-normal: #D7CEDF;
  --color-text-muted: #A99AB8;
}
```

---

## 4. Typography
Use bold, modern sans typography inspired by the references.

### Font stack
- **Display / headings:** Inter Tight
- **Body / UI:** Inter
- **Code:** JetBrains Mono

### Heading weights
- Hero headline: 800 or 900
- Section headings: 750 or 800
- Card headings: 700
- Navigation: 600
- Body: 400 or 500
- Captions: 400

### Type scale
- Hero: `clamp(2.75rem, 7vw, 6rem)`
- Page title: `clamp(2.25rem, 5vw, 4.5rem)`
- Section heading: `clamp(2rem, 4vw, 3.75rem)`
- Card title: `1.125rem` to `1.5rem`
- Body: `1rem` to `1.125rem`
- Small text: `0.875rem`
- Micro text: `0.75rem`

### Text rules
- Use short lines for hero and service copy.
- Keep paragraphs around 55–72 characters wide.
- Use accent color for 1–3 words inside major headings, not entire paragraphs.
- Avoid jargon-heavy sentences on public pages.

---

## 5. Layout System
The layout should feel centered, spacious, and easy to scan.

### Containers
- Max width: `1200px` for normal sections.
- Wide max width: `1440px` for hero/project showcases.
- Horizontal padding: `1rem` mobile, `1.5rem` tablet, `2rem` desktop.

### Section spacing
- Mobile: `py-16`
- Tablet: `py-20`
- Desktop: `py-28`

### Grid rhythm
- Use 12-column grids on desktop where useful.
- Use 1-column mobile layouts by default.
- Use 2-column layouts only when readability is preserved.
- Project cards: 1 column mobile, 2 columns tablet, 3 columns desktop.

### Backgrounds
- Dark base with subtle texture or soft radial shadow.
- Use assets from `/assets/backgrounds` carefully at low opacity.
- Avoid heavy full-page image backgrounds behind important text.

---

## 6. Navigation
The site uses two public nav layers and a mobile bottom nav.

### Top contact/status bar
Contains:
- `info@martinmukoya.com`
- `+264 81 8563 005`
- Availability indicator
- Theme switcher

Style:
- Height: 36–44px.
- Small text, muted color.
- Subtle bottom border.
- Hide less important items on small screens.

### Sticky primary nav
Contains:
- Logo on left.
- Nav links: Projects, Services, About, Blog, Contact.
- CTA: Start Project.

Style:
- Height: 68–80px.
- Backdrop blur on scroll.
- Border bottom: `1px solid rgba(255,255,255,0.08)`.
- CTA uses accent fill.

### Mobile bottom nav
Items:
- Home
- Projects
- Services
- Blog
- Start

Style:
- Fixed bottom.
- Rounded top corners or floating pill style.
- Safe area padding.
- Icons with short labels.
- Do not block chat widget or forms.

---

## 7. Buttons
Buttons should feel firm, modern, and conversion-focused.

### Primary button
Use for Start Project and main CTAs.
- Background: `#C6613F`
- Text: white or near-white
- Radius: `12px`
- Padding: `0.85rem 1.2rem` mobile, `0.95rem 1.4rem` desktop
- Font weight: 700
- Hover: background `#D98263`, slight translateY(-1px)
- Active: translateY(0)
- Shadow: soft accent shadow at low opacity

### Secondary button
Use for View Projects, Case Studies, and neutral CTAs.
- Background: transparent or `rgba(255,255,255,0.04)`
- Border: `1px solid rgba(255,255,255,0.12)`
- Text: strong text
- Radius: `12px`
- Hover: surface soft and border primary light

### Ghost button
Use in nav/admin actions.
- Transparent background.
- Muted text.
- Hover: subtle surface.

### Button copy
Use action-oriented labels:
- Start Your Project
- View Case Studies
- Let’s Talk
- Book a Call
- Open Live Site
- Read Case Study

Avoid vague labels like “Learn More” when a stronger action is possible.

---

## 8. Cards
Cards should match the dark portfolio references: clean, bordered, slightly elevated, and structured.

### Public cards
- Background: `#1C1725`
- Border: `1px solid rgba(255,255,255,0.08)`
- Radius: `18px`
- Padding: `1.25rem` mobile, `1.5rem` desktop
- Shadow: `0 18px 60px rgba(0,0,0,0.24)`
- Hover: border becomes `rgba(198,97,63,0.35)`, image slightly scales to 1.03

### Project cards
- Image aspect ratio: 16:10
- Image radius: `14px`
- Tags as small pills.
- Title bold and clear.
- Description limited to 2–4 lines.
- Links visible but not noisy.

### Service cards
- Faded number/icon in background.
- Clear service name.
- Benefit-focused description.
- Optional list of common problems solved.

### Admin cards
- More compact than public cards.
- Radius: `14px`
- Border: subtle.
- Data must be easy to scan.

---

## 9. Forms
Forms must feel simple and professional, especially the Start Project flow.

### Inputs
- Background: `#15111D`
- Border: `1px solid rgba(255,255,255,0.10)`
- Radius: `12px`
- Padding: `0.85rem 1rem`
- Text: strong
- Placeholder: muted
- Focus: border accent and soft ring using `rgba(198,97,63,0.25)`

### Labels
- Small, clear, medium weight.
- Always visible; do not rely only on placeholders.

### Multi-step form
- Use progress indicator.
- One major decision per step.
- Keep choices as large tappable cards.
- Save partial form state while the modal/page remains open.
- Final step summarizes answers before submission.

### Validation
- Plain language.
- Do not blame the user.
- Example: “Please enter a valid email so I can reply.”

---

## 10. Icons and Imagery
Use one consistent icon set across the entire site.

### Icon set
Use Lucide React for interface icons.

### Icon style
- Stroke width: 1.75–2px.
- Rounded line caps.
- Consistent sizes: 16, 18, 20, 24.
- CTA icons may use 18–20px.

### Imagery
- Profile image should be circular in hero.
- Project screenshots should be crisp and framed.
- Testimonial images optional, never forced.
- Use placeholders only where real assets are missing.

### Asset usage
- `/assets/logos`: choose best logo for contrast and accessibility.
- `/assets/hero-images`: use best circular portrait image.
- `/assets/backgrounds`: use sparingly with low opacity.
- `/assets/testimonials`: use as layout inspiration, not necessarily direct implementation.
- `/assets/FAQs`: use as layout inspiration.

---

## 11. Motion and Interaction
Motion should be subtle, smooth, and intentional.

### Animation library
Use Framer Motion only.

### Allowed animations
- Fade in.
- Slight translateY entrance.
- Image scale on hover.
- Button hover lift.
- Gentle parallax on decorative backgrounds.
- Accordion expand/collapse.
- Mobile nav transition.

### Timing
- Duration: 180ms–420ms.
- Easing: smooth ease-out.
- Avoid springy, bouncy motion unless very subtle.

### Performance rules
- Animate transform and opacity only.
- Respect `prefers-reduced-motion`.
- Do not animate large layout properties.
- Avoid excessive scroll-triggered animations.

---

## 12. Public Page Guidance
### Homepage
The homepage must quickly answer:
1. Who is Martin?
2. What problems does he solve?
3. Why should a business trust him?
4. What should the visitor do next?

Suggested hero copy direction:
- “I build web systems that help businesses get more bookings, automate work, and turn visitors into clients.”

Primary CTA:
- Start Your Project

Secondary CTA:
- View Case Studies

### Projects
Each project should emphasize:
- Problem solved.
- Business outcome.
- Practical features.
- Technologies used only after the value is clear.

### Services
Each service should be explained in business language:
- Web Applications: custom internal tools and online platforms.
- Booking Systems: reduce manual appointment handling.
- E-commerce: sell products and manage orders online.
- AI Automations & Integrations: save time and reduce repetitive work.

### About
Keep it personal but strategic. Avoid a long autobiography. Focus on Martin’s practical approach, reliability, and ability to understand business problems.

### Contact
Make direct contact unavoidable:
- Email
- Phone
- WhatsApp
- Contact form
- Start Project CTA

---

## 13. Admin Dashboard Guidance
The admin dashboard should prioritize action over decoration.

### Dashboard overview
Show:
- New leads.
- Total leads.
- WhatsApp clicks.
- CTA clicks.
- Top projects.
- Top blog posts.
- Recent submissions.

### Tables
- Use searchable, filterable data tables.
- Keep row actions clear: View, Edit, Delete, Publish.
- Use status badges.

### Admin forms
- Split long forms into clear sections.
- Use autoslug generation but allow manual editing.
- Use preview for blog and project pages.
- Use save draft and publish actions for content.

---

## 14. Status Badges
Use consistent badges across admin and public UI.

### Lead statuses
- NEW: accent tint background, accent text.
- REVIEWING: info tint background, info text.
- CONTACTED: primary tint background, primary text.
- QUALIFIED: success tint background, success text.
- WON: success solid/darker badge.
- LOST: muted badge.
- ARCHIVED: muted outline badge.

### Content statuses
- Published: success badge.
- Draft: warning/muted badge.
- Featured: accent badge.
- Hidden: muted outline badge.

### Service tags
- Web App: primary badge.
- Booking System: info badge.
- E-commerce: accent badge.
- AI Automation: success badge.

---

## 15. Email Template Notes
Emails should be plain, professional, and easy to scan.

### New lead email to Martin
Include:
- Lead name.
- Email.
- Phone.
- Service type.
- Budget range.
- Timeline.
- Project goal.
- Message.
- Source page.
- Admin link.

### Visitor confirmation email
Tone:
- Warm and direct.
- Confirm receipt.
- Explain next step.
- Include WhatsApp option.

Visual style:
- White background for email compatibility.
- Primary headings in `#553171`.
- CTA button in `#C6613F`.
- Simple border cards.

---

## 16. Responsive, Accessibility, and Performance Rules
### Responsive rules
- Mobile-first implementation.
- Bottom nav on mobile.
- Sticky desktop nav.
- Hero text must remain readable on small screens.
- Project cards stack cleanly.
- Contact form should appear before or after contact text based on mobile readability.

### Accessibility rules
- All buttons and links need visible focus states.
- Use semantic headings in order.
- Add aria labels to icon-only links.
- Maintain WCAG-friendly contrast.
- Do not communicate status by color only.
- Respect reduced motion.

### Performance rules
- Use `next/image` for images.
- Use aspect ratios to avoid layout shift.
- Dynamically import heavy components: editor, charts, AI chat, file upload UI.
- Use Suspense and skeletons for data sections.
- Use Redis caching for public GET routes.
- Use React Query for client data fetching.
- Avoid unnecessary client components.

### Final design test
Before shipping any screen, ask:
- Is the main action obvious?
- Can a non-technical business owner understand this?
- Does it look intentional rather than generated?
- Does it support booking, trust, or clarity?
- Is the mobile experience as strong as desktop?
