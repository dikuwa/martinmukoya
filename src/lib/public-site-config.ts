import { blogPosts, contact, faqs, flextechServices, projects, services, techStack, testimonials } from "@/lib/site-data";

export type PublicSiteConfig = {
  slug: string;
  brandName: string;
  brandLines: [string, string];
  logoAlt: string;
  availability: string;
  contact: typeof contact;
  footerDescription: string;
  copyright: string;
  registrationInfo?: string;
  finalCta: {
    eyebrow: string;
    title: string;
    description: string;
    primary: string;
    secondary: string;
  };
  home: {
    eyebrow: string;
    heroTitle: string;
    heroDescription: string;
    primaryCta: string;
    secondaryCta: string;
    secondaryHref: string;
    heroImage: string;
    heroAlt: string;
    techStack: string[];
    servicesTitle: string;
    servicesDescription: string;
    workEyebrow: string;
    workTitle: string;
    workDescription: string;
    reasonsTitle: string;
    reasonsDescription: string;
    reasons: Array<{ title: string; description: string }>;
    testimonialsTitle: string;
    aboutTitle: string;
    aboutDescription: string;
    aboutImage: string;
    aboutAlt: string;
  };
  pages: {
    services: {
      title: string;
      description: string;
      metadataDescription: string;
      ctaLabel: string;
    };
    projects: {
      title: string;
      description: string;
      metadataDescription: string;
    };
    blog: {
      title: string;
      description: string;
      metadataDescription: string;
    };
    faq: {
      title: string;
      description: string;
      metadataDescription: string;
    };
    about: {
      eyebrow: string;
      title: string;
      description: string;
      metadataDescription: string;
      ctaLabel: string;
      cards: Array<{ title: string; description: string }>;
      stackTitle: string;
      stackDescription: string;
    };
    contact: {
      title: string;
      description: string;
      metadataDescription: string;
      whatsappLabel: string;
      successTitle: string;
      successDescription: string;
      successToast: string;
    };
    startProject: {
      eyebrow: string;
      title: string;
      description: string;
      metadataDescription: string;
    };
  };
  services: typeof services;
  projects: typeof projects;
  testimonials: typeof testimonials;
  faqs: typeof faqs;
  blogPosts: typeof blogPosts;
};

const flextechContact = {
  ...contact,
  email: "info@flextech-media.com",
  whatsappHref: contact.whatsappHref
};

const flextechProjects = projects;

const flextechFaqs = faqs;

const flextechBlogPosts = blogPosts;

export const publicSiteConfigs: Record<"martin-mukoya" | "flextech-media", PublicSiteConfig> = {
  "martin-mukoya": {
    slug: "martin-mukoya",
    brandName: "Martin Mukoya",
    brandLines: ["Martin", "Mukoya"],
    logoAlt: "Martin Mukoya",
    availability: "Available for new projects",
    contact,
    footerDescription: "Practical websites, booking systems, ecommerce flows, and AI automations for businesses that need cleaner leads and smoother operations.",
    copyright: "Built for practical business systems.",
    finalCta: {
      eyebrow: "Ready to build?",
      title: "Let’s turn your next enquiry into a cleaner system.",
      description: "Send the goal, the current friction, and the kind of customers you want to serve better.",
      primary: "Start Your Project",
      secondary: "WhatsApp Martin"
    },
    home: {
      eyebrow: "Business systems developer in Namibia",
      heroTitle: "I build practical systems that turn visitors into clients.",
      heroDescription: "Websites, booking systems, ecommerce flows, and AI automations for businesses that need clearer leads, less manual work, and stronger follow-up.",
      primaryCta: "Start Your Project",
      secondaryCta: "View Case Studies",
      secondaryHref: "/projects",
      heroImage: "/assets/hero-images/webp/hero-image.webp",
      heroAlt: "Martin Mukoya",
      techStack,
      servicesTitle: "Business-first systems for the work that matters.",
      servicesDescription: "Each service is shaped around a practical outcome: more qualified enquiries, fewer repeated tasks, clearer operations, and smoother customer journeys.",
      workEyebrow: "Featured work",
      workTitle: "Case studies built around real business problems.",
      workDescription: "The strongest work is not just attractive. It captures the right information, supports the team behind the scenes, and makes the next action obvious.",
      reasonsTitle: "Why choose a practical build?",
      reasonsDescription: "A good build gives the business owner clarity. What came in? What needs a response? What should be automated? What should stay human?",
      reasons: [
        { title: "Conversion focus", description: "CTAs, forms, and follow-up paths are treated as product features." },
        { title: "Mobile-first execution", description: "Key flows are designed for the phones most customers actually use." },
        { title: "Plain-English planning", description: "The work starts with the business goal, not a stack list." }
      ],
      testimonialsTitle: "Useful systems leave people with less to chase.",
      aboutTitle: "More than just lines of code.",
      aboutDescription: "Hi there! I'm a science teacher by day and a curious human all the time. My life is a happy collision of lesson plans, bug reports, birdsong, and dog-eared books.",
      aboutImage: "/assets/hero-images/webp/about.webp",
      aboutAlt: "Martin Mukoya outside the code editor"
    },
    pages: {
      services: {
        title: "Systems built around bookings, leads, sales, and workflow.",
        description: "Each service starts with the business outcome. The technology matters, but the real goal is making customer action and team follow-up easier.",
        metadataDescription: "Web applications, booking systems, ecommerce, and AI automations by Martin Mukoya.",
        ctaLabel: "Discuss this service"
      },
      projects: {
        title: "Selected systems, case studies, and business outcomes.",
        description: "These examples show the kind of practical work Martin builds: clear customer journeys, useful admin flows, and dependable foundations for future improvements.",
        metadataDescription: "Case studies by Martin Mukoya covering booking systems, lead-generation websites, ecommerce, and automation."
      },
      blog: {
        title: "Notes on practical business technology.",
        description: "Plain-English ideas for business owners, recruiters, and builders who care about useful digital systems.",
        metadataDescription: "Practical notes from Martin Mukoya on websites, booking systems, automation, and business technology."
      },
      faq: {
        title: "Straight answers about the process.",
        description: "A quick place to understand pricing, timelines, support, and what kind of digital systems are a good fit.",
        metadataDescription: "Answers about Martin Mukoya's pricing, timelines, process, support, hosting, AI automation, and ecommerce work."
      },
      about: {
        eyebrow: "About Martin",
        title: "More than just lines of code.",
        description: "Hi there! I'm a science teacher by day and a curious human all the time. My life is a happy collision of lesson plans, bug reports, birdsong, and dog-eared books. I believe the best ideas live at the intersection of the natural world and the digital one, and I'm always trying to find them.",
        metadataDescription: "About Martin Mukoya, a science teacher, curious builder, and practical business-systems developer based in Namibia.",
        ctaLabel: "Let’s Talk",
        cards: [
          { title: "Teacher's clarity", description: "Lesson planning taught me to explain complex ideas without draining the life out of them." },
          { title: "Nature-led curiosity", description: "Birdsong, books, and quiet observation keep me asking better questions before I build." },
          { title: "Practical foundations", description: "I still care deeply about maintainable patterns, typed data, tested flows, and useful admin controls." }
        ],
        stackTitle: "Modern tools, used for practical outcomes.",
        stackDescription: "The stack is chosen to keep interfaces fast, data structured, admin work manageable, and future integrations possible."
      },
      contact: {
        title: "Tell me what needs to work better.",
        description: "Share the business goal, the current friction, and what a good result would look like. I’ll help shape it into a practical next step.",
        metadataDescription: "Contact Martin Mukoya for websites, booking systems, ecommerce, AI automations, and developer opportunities.",
        whatsappLabel: "Continue on WhatsApp",
        successTitle: "Thanks. I’ll take it from here.",
        successDescription: "I’ll read through the context and reply with the most useful next step. For urgent notes, WhatsApp is still the fastest route.",
        successToast: "Thanks. I’ll review this and reply with a practical next step."
      },
      startProject: {
        eyebrow: "Start a project",
        title: "Start your project with clear services, budget, and timeline.",
        description: "Choose the services you need, indicate your price range, and set a timeline so your brief is ready for action.",
        metadataDescription: "Start a project with Martin Mukoya for a website, booking system, ecommerce flow, or AI automation."
      }
    },
    services,
    projects,
    testimonials,
    faqs,
    blogPosts
  },
  "flextech-media": {
    slug: "flextech-media",
    brandName: "FlexTech Media",
    brandLines: ["FlexTech", "Media"],
    logoAlt: "FlexTech Media",
    availability: "Booking new projects",
    contact: flextechContact,
    footerDescription: "Practical websites, booking systems, ecommerce flows, and AI automations for businesses that need clearer leads and smoother operations.",
    registrationInfo: "Reg. No. CC/2024/00337 · ERF 234, SILVER AVENUE, TAMARISKIA, SWAKOPMUND",
    copyright: "Built for brands that move with intent.",
    finalCta: {
      eyebrow: "Ready to build?",
      title: "Turn your next idea into a system people can actually use.",
      description: "Bring the page, campaign, service, or workflow you want to improve. FlexTech will help shape the structure, flow, and follow-up system around it.",
      primary: "Book a Project",
      secondary: "WhatsApp FlexTech"
    },
    home: {
      eyebrow: "Web Apps · Booking Systems · Automations",
      heroTitle: "I build systems that help businesses turn traffic into paying clients.",
      heroDescription: "From websites and booking platforms to ecommerce journeys and AI automations — everything is designed to generate better leads, reduce manual work, and improve customer follow-up.",
      primaryCta: "Book a Project",
      secondaryCta: "See Agency Work",
      secondaryHref: "/projects",
      heroImage: "/assets/backgrounds/webP/brand-01.webp",
      heroAlt: "FlexTech Media digital brand system",
      techStack: ["Brand websites", "Campaign pages", "Analytics", "Automation", "SEO", "Lead capture", "Content systems"],
      servicesTitle: "Systems designed to make businesses easier to run.",
      servicesDescription: "Each service is built around practical business outcomes — better enquiries, smoother operations, faster follow-up, and customer journeys that feel easier to manage.",
      workEyebrow: "Selected Projects",
      workTitle: "Practical systems designed around real operational problems.",
      workDescription: "Each project focuses on reducing friction — from capturing enquiries and booking appointments to helping teams manage information more clearly behind the scenes.",
      reasonsTitle: "Built around clarity, not complexity.",
      reasonsDescription: "The goal is not just to launch something attractive — it's to create systems that help businesses respond faster, manage work more clearly, and reduce unnecessary friction.",
      reasons: [
        { title: "Conversion focus", description: "Enquiries, forms, and follow-up flows are treated as part of the product experience." },
        { title: "Mobile-first execution", description: "Key actions are designed around the devices customers actually use most." },
        { title: "Plain-English planning", description: "Technical decisions are explained through business outcomes, not unnecessary jargon." }
      ],
      testimonialsTitle: "The right system makes the brand easier to trust.",
      aboutTitle: "Built for businesses that need clarity behind the scenes.",
      aboutDescription: "FlexTech Media helps businesses build websites, booking systems, ecommerce flows, and automation tools that make everyday operations easier to manage — not harder to maintain.",
      aboutImage: "/assets/backgrounds/webP/brand-03.webp",
      aboutAlt: "FlexTech Media campaign visuals"
    },
    pages: {
      services: {
        title: "Digital systems for businesses that need clearer leads and smoother operations.",
        description: "Each service is built around practical business outcomes — better enquiries, easier customer journeys, stronger follow-up, and less manual work.",
        metadataDescription: "Brand websites, campaign pages, content systems, and automation services from FlexTech Media.",
        ctaLabel: "Plan this service"
      },
      projects: {
        title: "Agency systems shaped for launches, brands, and campaigns.",
        description: "These examples show how FlexTech turns digital attention into structured enquiries, measurable campaigns, and reusable content workflows.",
        metadataDescription: "FlexTech Media case studies for campaign pages, brand websites, content systems, and media automation."
      },
      blog: {
        title: "Practical notes on websites, campaigns, and business systems.",
        description: "Clear, useful writing for business owners who want better pages, stronger follow-up, smoother customer journeys, and digital systems that are easier to manage.",
        metadataDescription: "FlexTech Media articles on brand websites, campaign pages, content systems, lead capture, and automation."
      },
      faq: {
        title: "Answers for brands planning a sharper digital presence.",
        description: "A quick place to understand FlexTech services, shared-dashboard tracking, content placement, and launch support.",
        metadataDescription: "Answers about FlexTech Media websites, campaign systems, shared dashboards, tracking, blog posts, and testimonials."
      },
      about: {
        eyebrow: "About FlexTech",
        title: "Digital media work with practical systems underneath.",
        description: "FlexTech Media exists for brands that need more than a nice page. The work combines visual direction, clear copy, enquiry capture, content structure, and the tracking needed to know what is working.",
        metadataDescription: "About FlexTech Media, a practical digital agency for brand websites, campaign systems, content workflows, and automation.",
        ctaLabel: "Talk to FlexTech",
        cards: [
          { title: "Brand-first direction", description: "Every page starts with what the audience needs to understand, trust, and do next." },
          { title: "Campaign-ready structure", description: "Reusable sections and flows make new offers easier to launch and measure." },
          { title: "Systems after the click", description: "Forms, tracking, dashboards, and automation keep enquiries visible after the first visit." }
        ],
        stackTitle: "Modern tools for brand momentum.",
        stackDescription: "The stack supports fast pages, structured content, analytics, forms, and automation that can grow with each campaign."
      },
      contact: {
        title: "Tell FlexTech what you want to launch.",
        description: "Share the brand, campaign, offer, or content system you want to improve. FlexTech will shape it into a practical digital next step.",
        metadataDescription: "Contact FlexTech Media for brand websites, campaign pages, content systems, analytics, and media automation.",
        whatsappLabel: "Continue with FlexTech",
        successTitle: "Thanks. FlexTech has your message.",
        successDescription: "The team will review your context and reply with the most useful next step. For urgent launch notes, WhatsApp is the fastest route.",
        successToast: "Thanks. FlexTech will review this and reply with a practical next step."
      },
      startProject: {
        eyebrow: "Start a campaign",
        title: "Start with the offer, budget, and launch timeline.",
        description: "Choose the services you need, indicate your budget range, and set a launch window so FlexTech can shape the next step clearly.",
        metadataDescription: "Start a FlexTech Media project for a brand website, campaign page, content system, or media automation."
      }
    },
    services: flextechServices,
    projects: flextechProjects,
    testimonials,
    faqs: flextechFaqs,
    blogPosts: flextechBlogPosts
  }
};

export function getPublicSiteConfig(slug?: string | null) {
  if (slug === "flextech-media") return publicSiteConfigs["flextech-media"];
  return publicSiteConfigs["martin-mukoya"];
}
