import "dotenv/config";
import dotenv from "dotenv";
import { ContactMessageStatus, LeadStatus, PreferredContact, Prisma, ServiceType, UserRole } from "../src/generated/prisma/client";
import { getDb } from "../src/lib/db";

dotenv.config({ path: ".env.local", override: true });

const db = getDb();
const adminEmail = process.env.ADMIN_EMAIL ?? "info@martinmukoya.com";
const seedSites = [
  {
    name: "Martin Mukoya",
    slug: "martin-mukoya",
    primaryDomain: "martinmukoya.com",
    aliases: ["www.martinmukoya.com", "localhost", "127.0.0.1"]
  },
  {
    name: "FlexTech Media",
    slug: "flextech-media",
    primaryDomain: "flextech-media.com",
    aliases: ["www.flextech-media.com", "flextech-media.localhost"]
  }
] as const;

const projectSeeds = [
  ["Clinic Booking System", "clinic-booking-system", "Healthcare", "Booking Systems", "A mobile-first appointment flow for clinics that need fewer missed calls and clearer patient intake."],
  ["Service Business Lead Hub", "service-business-lead-hub", "Professional services", "Web Applications", "A conversion-focused lead hub that helps a local service provider qualify enquiries faster."],
  ["Local Commerce Storefront", "local-commerce-storefront", "Commerce", "E-commerce", "A catalogue and order enquiry system for a retailer moving beyond social media selling."],
  ["AI Service Assistant", "ai-service-assistant", "Automation", "AI Automation", "A focused assistant that answers repeated questions and prepares better handovers."],
  ["School Operations Portal", "school-operations-portal", "Education", "Web Applications", "A lightweight portal concept for notices, parent enquiries, and internal school requests."],
  ["Training Provider Booking Flow", "training-provider-booking-flow", "Training", "Booking Systems", "A course booking flow with participant intake, schedule visibility, and follow-up notes."],
  ["Workshop Inventory Tracker", "workshop-inventory-tracker", "Operations", "Web Applications", "A practical stock and job tracking dashboard for a workshop team."],
  ["WhatsApp Lead Qualification Bot", "whatsapp-lead-qualification-bot", "Automation", "AI Automation", "An automation concept that turns broad WhatsApp enquiries into structured lead summaries."]
] as const;

const blogSeeds = [
  ["Why business websites need better lead capture", "better-lead-capture", "Business systems", "A practical look at why forms, CTAs, and follow-up structure matter more than decorative sections."],
  ["Booking systems reduce more than missed calls", "booking-systems-reduce-missed-calls", "Booking", "The best booking systems improve preparation, reminders, and customer confidence."],
  ["Where AI actually helps small businesses", "where-ai-helps-small-businesses", "AI automation", "A plain-English guide to useful AI workflows that save time without creating confusion."],
  ["What to include on a service business homepage", "service-business-homepage", "Conversion", "How to structure a homepage so visitors understand the offer and take the next step."],
  ["A simple lead status workflow for small teams", "lead-status-workflow", "Operations", "A practical lead pipeline that keeps follow-up visible without becoming a full CRM."],
  ["When to build a custom dashboard", "when-to-build-custom-dashboard", "Web applications", "The signs that spreadsheets and chat threads are no longer enough for your operations."],
  ["How to plan an ecommerce flow before design", "plan-ecommerce-flow-before-design", "E-commerce", "The operational questions to answer before product cards and checkout screens."],
  ["Why admin screens matter in public websites", "why-admin-screens-matter", "Business systems", "A good public site often needs a simple private workflow behind it."],
  ["Turning FAQs into better customer journeys", "faqs-customer-journeys", "Content", "How strong answers reduce repeated questions and improve buyer confidence."],
  ["What recruiters can learn from case studies", "recruiters-case-studies", "Career", "A case study can show communication, product thinking, and technical judgement at once."],
  ["How reminders improve appointment businesses", "appointment-reminders", "Booking", "Reminder workflows help both customers and teams arrive prepared."],
  ["The difference between automation and noise", "automation-vs-noise", "AI automation", "Useful automation removes repeated work. Noisy automation simply adds another place to check."]
] as const;

const testimonialSeeds = [
  ["Local business owner", "Founder", "Service company", "Martin helped us think beyond a simple website. The final system made enquiries easier to understand and follow up on.", "/assets/testimonials/testimonials.png"],
  ["Operations lead", "Manager", "Clinic team", "The booking flow gave our team a clearer way to collect patient details before we call back.", "/assets/testimonials/testimonial2.png"],
  ["Recruiter review", "Technical hiring", "Software team", "The work shows product thinking, strong fundamentals, and the ability to explain technical decisions in business language.", "/assets/hero-images/png/me-hero.png"],
  ["Startup founder", "Founder", "Digital services startup", "The process was clear from the first call. We ended with a sharper project direction and a better way to capture serious leads.", "/assets/site/02.JPG"],
  ["Training coordinator", "Coordinator", "Learning provider", "The booking questions helped us understand participants before the first session.", "/assets/site/01.JPG"],
  ["Retail operator", "Owner", "Local commerce brand", "The storefront concept gave customers a clearer path than sending screenshots through chat.", "/assets/site/03.JPG"],
  ["School administrator", "Administrator", "Education team", "Martin explained the system in a way our non-technical team could actually discuss.", "/assets/hero-images/webp/about.webp"],
  ["Agency collaborator", "Project partner", "Digital studio", "Reliable, thoughtful, and practical. The handover notes were as useful as the code.", "/assets/hero-images/webp/hero-image.webp"]
] as const;

const faqSeeds = [
  ["How much does a website or system cost?", "Pricing depends on scope, integrations, content, and timeline. The first step is understanding what the system needs to do for your business.", "pricing"],
  ["How long does a typical project take?", "A focused website can take a few weeks. A booking system, ecommerce flow, or custom dashboard usually takes longer because testing and admin workflows matter.", "process"],
  ["Can you help with existing websites?", "Yes. I can review an existing site, improve conversion points, rebuild weak sections, or plan a more reliable system around what already works.", "support"],
  ["Do you offer support after launch?", "Yes. Support can include fixes, improvements, hosting guidance, analytics, content updates, and future feature planning.", "support"],
  ["Can you build AI features for a business?", "Yes, when there is a real use case. Good examples include FAQ assistants, lead qualification, internal summaries, and handover notes.", "ai"],
  ["Do you work with businesses outside Namibia?", "Yes. Most planning, development, and handover work can happen remotely with clear calls and written updates.", "process"],
  ["Can you connect forms to email notifications?", "Yes. Project requests and contact messages can notify the right person immediately and still be stored in the dashboard.", "integrations"],
  ["Do you build ecommerce systems?", "Yes. The first version can start with catalogues and order enquiries or grow into cart, checkout, inventory, and fulfilment workflows.", "ecommerce"],
  ["Can booking systems send reminders?", "Yes. Reminder workflows can be planned around email, SMS, WhatsApp handover, or internal admin notes depending on the business process.", "booking"],
  ["Will I be able to edit content myself?", "Yes. The admin dashboard is designed so Martin can manage projects, posts, testimonials, FAQs, leads, and site settings.", "admin"],
  ["Do you handle hosting and deployment?", "Yes. I can set up deployment, environment variables, database connections, and production checks.", "deployment"],
  ["What makes a project a good fit?", "The best fit is a business process that needs clearer lead capture, smoother follow-up, fewer repeated tasks, or a more trustworthy customer journey.", "fit"]
] as const;

const leadSeeds = [
  ["Aina Johannes", "aina@example.com", "Aina Wellness", ServiceType.BOOKING_SYSTEM, "Need online bookings for consultations and reminders.", "start-project"],
  ["Tomas N.", "tomas@example.com", "North Retail", ServiceType.ECOMMERCE, "We need a product catalogue that can grow into online ordering.", "contact-page"],
  ["Selma K.", "selma@example.com", "Training Hub", ServiceType.BOOKING_SYSTEM, "Course registrations are coming through too many channels.", "start-project"],
  ["David Amadhila", "david@example.com", "Workshop Team", ServiceType.WEB_APP, "We want to track jobs, parts, and customer updates in one place.", "whatsapp"],
  ["Martha H.", "martha@example.com", "Clinic Desk", ServiceType.BOOKING_SYSTEM, "Patients need a clearer appointment request flow.", "ai-chat"],
  ["Leon P.", "leon@example.com", "Studio Ops", ServiceType.AI_AUTOMATION, "We answer the same service questions every day and need better summaries.", "contact-page"],
  ["Nadine S.", "nadine@example.com", "Local School", ServiceType.WEB_APP, "We need a simple portal for parent requests and school notices.", "start-project"],
  ["Paulus M.", "paulus@example.com", "Consulting Office", ServiceType.OTHER, "I need help deciding whether to rebuild or improve the existing site.", "contact-page"]
] as const;

const messageSeeds = [
  ["Recruiter", "recruiter@example.com", "Hiring", "I would like to discuss a developer role and review recent project work."],
  ["Clinic admin", "clinic-admin@example.com", "Booking", "Can you advise on a small appointment request system for a clinic?"],
  ["Retail owner", "retail@example.com", "E-commerce", "We sell through social media and want a cleaner product catalogue."],
  ["Startup founder", "founder@example.com", "Project", "I need help turning a rough idea into a practical MVP scope."],
  ["School principal", "principal@example.com", "Web app", "Could you build a private request tracker for a school office?"],
  ["Agency lead", "agency@example.com", "Collaboration", "We need a reliable full-stack partner for overflow work."],
  ["Business owner", "owner@example.com", "Consultation", "I want a review of my current website and lead flow."]
] as const;

async function main() {
  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: { role: UserRole.ADMIN, emailVerified: true },
    create: {
      id: "seed-admin",
      name: process.env.ADMIN_NAME ?? "Martin Mukoya",
      email: adminEmail,
      emailVerified: true,
      role: UserRole.ADMIN
    }
  });
  const [martinSite, flextechSite] = await Promise.all(
    seedSites.map((site) =>
      db.site.upsert({
        where: { slug: site.slug },
        update: {
          name: site.name,
          primaryDomain: site.primaryDomain,
          aliases: [...site.aliases]
        },
        create: {
          name: site.name,
          slug: site.slug,
          primaryDomain: site.primaryDomain,
          aliases: [...site.aliases],
          brandConfig: site.slug === "flextech-media"
            ? { theme: "agency", label: "Creative technology and media agency" }
            : { theme: "portfolio", label: "Business systems developer" }
        }
      })
    )
  );

  for (const [index, [title, slug, industry, service, summary]] of projectSeeds.entries()) {
    const assignedSites = index < 4
      ? { set: [{ id: martinSite.id }] }
      : { set: [{ id: martinSite.id }, { id: flextechSite.id }] };
    const connectSites = index < 4
      ? { connect: { id: martinSite.id } }
      : { connect: [{ id: martinSite.id }, { id: flextechSite.id }] };

    await db.project.upsert({
      where: { slug },
      update: {
        title,
        summary,
        industry,
        services: [service, "Web Applications"],
        sortOrder: index,
        published: true,
        featured: index < 5,
        sites: assignedSites
      },
      create: {
        title,
        slug,
        summary,
        description: `${title} is a practical portfolio case study focused on clearer intake, stronger follow-up, and less manual coordination.`,
        problem: "The business needed a more reliable way to collect information, reduce repeated questions, and understand the next action.",
        solution: "The solution uses a focused customer journey, structured data capture, admin-ready records, and plain-language handover notes.",
        outcome: "The team gains a clearer operating rhythm and a more professional customer experience.",
        clientType: index % 2 === 0 ? "SME" : "Organization",
        industry,
        coverImage: `/assets/site/0${(index % 3) + 1}.JPG`,
        gallery: [`/assets/site/0${(index % 3) + 1}.JPG`, `/assets/backgrounds/webP/map-0${(index % 3) + 1}.webp`],
        techStack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Redis"],
        services: [service, "Web Applications"],
        liveUrl: "https://example.com",
        githubUrl: "https://github.com/",
        caseStudyContent: "This case study explains the business problem, the design decisions, the implementation approach, and the measurable operational improvements.",
        featured: index < 5,
        published: true,
        sortOrder: index,
        authorId: admin.id,
        sites: connectSites
      }
    });
  }

  for (const [index, [title, slug, category, excerpt]] of blogSeeds.entries()) {
    const blogSites = index < 6
      ? [{ id: martinSite.id }]
      : [{ id: martinSite.id }, { id: flextechSite.id }];
    await db.blogPost.upsert({
      where: { slug },
      update: { title, excerpt, category, published: true, sites: { set: blogSites } },
      create: {
        title,
        slug,
        excerpt,
        content: `# ${title}\n\n${excerpt}\n\nA practical system should make the next step easier for both the customer and the business. The goal is not more software for its own sake, but clearer information, faster response, and less repeated work.`,
        coverImage: `/assets/backgrounds/webP/brand-0${(index % 3) + 1}.webp`,
        tags: [category, "Business", "Systems"],
        category,
        seoTitle: `${title} | Martin Mukoya`,
        seoDescription: excerpt,
        published: true,
        publishedAt: new Date(Date.UTC(2026, 3, 1 + index)),
        authorId: admin.id,
        sites: { connect: blogSites }
      }
    });
  }

  await db.testimonial.deleteMany({});
  for (const [index, [clientName, role, company, quote, image]] of testimonialSeeds.entries()) {
    const testimonialSites = index < 4
      ? [{ id: martinSite.id }]
      : [{ id: martinSite.id }, { id: flextechSite.id }];
    await db.testimonial.create({
      data: {
        clientName,
        role,
        company,
        quote,
        image,
        featured: index < 5,
        published: true,
        sortOrder: index,
        authorId: admin.id,
        sites: { connect: testimonialSites }
      }
    });
  }

  await db.fAQ.deleteMany({});
  for (const [index, [question, answer, category]] of faqSeeds.entries()) {
    const faqSites = index < 4
      ? [{ id: martinSite.id }]
      : [{ id: martinSite.id }, { id: flextechSite.id }];
    await db.fAQ.create({
      data: {
        question,
        answer,
        category,
        published: true,
        sortOrder: index,
        authorId: admin.id,
        sites: { connect: faqSites }
      }
    });
  }

  await db.lead.deleteMany({});
  await db.lead.createMany({
    data: leadSeeds.map(([name, email, company, serviceType, message, source], index) => ({
      name,
      siteId: martinSite.id,
      email,
      company,
      serviceType,
      budgetRange: ["N$5k - N$10k", "N$10k - N$25k", "N$25k - N$50k", "N$50k+"][index % 4],
      timeline: ["This month", "1-2 months", "This quarter"][index % 3],
      projectGoal: message,
      message,
      source,
      preferredContact: index % 3 === 0 ? PreferredContact.WHATSAPP : PreferredContact.EMAIL,
      status: [LeadStatus.NEW, LeadStatus.REVIEWING, LeadStatus.CONTACTED, LeadStatus.QUALIFIED][index % 4],
      internalNotes: "Seed lead for admin workflow testing."
    }))
  });

  await db.contactMessage.deleteMany({});
  await db.contactMessage.createMany({
    data: messageSeeds.map(([name, email, inquiryType, message], index) => ({
      name,
      siteId: martinSite.id,
      email,
      inquiryType,
      message,
      sourcePage: index % 2 === 0 ? "/contact" : "/",
      status: [ContactMessageStatus.NEW, ContactMessageStatus.READ, ContactMessageStatus.REPLIED][index % 3]
    }))
  });

  await db.analyticsEvent.deleteMany({});
  await db.analyticsEvent.createMany({
    data: Array.from({ length: 30 }, (_, index): Prisma.AnalyticsEventCreateManyInput => ({
      eventType: ["page_view", "cta_click", "project_view", "blog_view", "whatsapp_click", "form_started"][index % 6],
      siteId: martinSite.id,
      siteSlug: martinSite.slug,
      page: ["/", "/projects", "/services", "/contact", "/start-project"][index % 5],
      referrer: index % 3 === 0 ? "https://google.com" : null,
      source: ["organic", "direct", "social", "referral"][index % 4],
      device: ["mobile", "desktop", "tablet"][index % 3],
      country: index % 2 === 0 ? "NA" : "ZA",
      metadata: { seed: true, index },
      createdAt: new Date(Date.now() - index * 1000 * 60 * 60 * 6)
    }))
  });

  const siteSettings: Array<{ key: string; value: Prisma.InputJsonValue }> = [
    { key: "contact.email", value: "info@martinmukoya.com" },
    { key: "contact.phone", value: "+264 81 8563 005" },
    { key: "availability", value: "Available for new projects" },
    { key: "hero.title", value: "I build practical systems that turn visitors into clients." },
    { key: "footer.description", value: "Practical websites, booking systems, ecommerce flows, and AI automations for businesses that need cleaner leads and smoother operations." },
    { key: "footer.copyright", value: "Built for practical business systems." }
  ];

  for (const setting of siteSettings) {
    await db.siteSetting.upsert({
      where: { siteId_key: { siteId: martinSite.id, key: setting.key } },
      update: { value: setting.value },
      create: { siteId: martinSite.id, key: setting.key, value: setting.value }
    });
  }

  // Also seed the matching settings for FlexTech Media so the admin filter works
  const flextechSettings: Array<{ key: string; value: Prisma.InputJsonValue }> = [
    { key: "contact.email", value: "info@flextech-media.com" },
    { key: "contact.phone", value: "+264 81 8563 005" },
    { key: "availability", value: "Booking new projects" },
    { key: "hero.title", value: "I build systems that help businesses turn traffic into paying clients." },
    { key: "footer.description", value: "Practical websites, booking systems, ecommerce flows, and AI automations for businesses that need clearer leads and smoother operations." },
    { key: "footer.company", value: "Reg. No. CC/2024/00337 · ERF 234, SILVER AVENUE, TAMARISKIA, SWAKOPMUND" },
    { key: "footer.copyright", value: "Built for brands that move with intent." }
  ];

  for (const setting of flextechSettings) {
    await db.siteSetting.upsert({
      where: { siteId_key: { siteId: flextechSite.id, key: setting.key } },
      update: { value: setting.value },
      create: { siteId: flextechSite.id, key: setting.key, value: setting.value }
    });
  }

  console.log("Phase 3 seed data ready");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
