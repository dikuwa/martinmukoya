export const contact = {
  email: "info@martinmukoya.com",
  phone: "+264 81 8563 005",
  phoneHref: "tel:+264818563005",
  whatsappHref: "https://wa.me/264818563005",
  location: "Windhoek, Namibia",
  github: "https://github.com/",
  linkedin: "https://linkedin.com/",
  facebook: "https://facebook.com/"
};

export const techStack = [
  "Next.js",
  "React",
  "TypeScript",
  "Prisma",
  "PostgreSQL",
  "Redis",
  "Tailwind",
  "Automation"
];

export const services = [
  {
    id: "web-applications",
    number: "01",
    title: "Web Applications",
    summary:
      "Custom systems for teams that need a reliable place to capture leads, manage work, and serve customers online.",
    who: "SMEs, clinics, schools, startups, and service providers that have outgrown basic pages.",
    problems: ["Scattered enquiries", "Manual admin work", "Slow customer follow-up"],
    outcomes: ["Cleaner lead capture", "Better internal workflows", "A system that can grow with the business"],
    image: "/assets/backgrounds/webP/brand-01.webp"
  },
  {
    id: "booking-systems",
    number: "02",
    title: "Booking Systems",
    summary:
      "Appointment and reservation flows that make it easier for customers to choose a time and easier for teams to prepare.",
    who: "Clinics, consultants, salons, coaches, training providers, and appointment-led businesses.",
    problems: ["Missed calls", "Double bookings", "Unclear appointment details"],
    outcomes: ["More confirmed bookings", "Less back-and-forth", "Better reminders and follow-up"],
    image: "/assets/backgrounds/webP/brand-02.webp"
  },
  {
    id: "ecommerce",
    number: "03",
    title: "E-commerce",
    summary:
      "Product, cart, checkout, and order workflows built around trust, speed, and practical operations.",
    who: "Retailers, creators, local brands, and service businesses selling products or packages.",
    problems: ["Manual orders", "Low buyer confidence", "No stock or order visibility"],
    outcomes: ["Simpler buying flow", "Clearer order records", "A more professional sales channel"],
    image: "/assets/backgrounds/webP/brand-03.webp"
  },
  {
    id: "ai-automations",
    number: "04",
    title: "AI Automations & Integrations",
    summary:
      "Practical AI helpers for FAQs, lead qualification, content support, internal summaries, and routine workflows.",
    who: "Businesses that want useful AI inside existing processes, not shiny demos with no operational value.",
    problems: ["Repeated questions", "Slow lead qualification", "Manual summaries and handovers"],
    outcomes: ["Faster responses", "Cleaner handovers", "Less repetitive work for the team"],
    image: "/assets/hero-images/webp/hero-04.webp"
  }
];

export const projects = [
  {
    title: "Clinic Booking System",
    slug: "clinic-booking-system",
    summary:
      "A mobile-first appointment flow for a clinic that needed fewer missed calls and clearer patient intake.",
    description:
      "A practical booking platform with service selection, appointment requests, admin review, and automated follow-up notes.",
    problem:
      "The clinic relied on phone calls and WhatsApp messages, which made it easy to lose appointment details during busy hours.",
    solution:
      "I designed a guided booking flow with clear service options, patient contact capture, admin review screens, and structured notifications.",
    outcome:
      "The team gained a cleaner intake process and a more reliable way to follow up with patients before appointments.",
    clientType: "Healthcare",
    industry: "Clinic",
    coverImage: "/assets/site/01.JPG",
    gallery: ["/assets/site/01.JPG", "/assets/backgrounds/webP/map-01.webp"],
    techStack: ["Next.js", "Prisma", "PostgreSQL", "Resend"],
    services: ["Booking Systems", "Web Applications"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/",
    featured: true
  },
  {
    title: "Service Business Lead Hub",
    slug: "service-business-lead-hub",
    summary:
      "A lead-generation site and admin workflow for a local service provider that needed better enquiry quality.",
    description:
      "A conversion-focused website with structured contact forms, service pages, and a dashboard-ready lead model.",
    problem:
      "Visitors were asking broad questions through several channels, making it hard to understand project urgency and fit.",
    solution:
      "I rebuilt the journey around clear service pages, stronger CTAs, guided enquiry forms, and lead source tracking.",
    outcome:
      "The business could separate serious enquiries from casual questions and respond with more useful context.",
    clientType: "SME",
    industry: "Professional services",
    coverImage: "/assets/site/02.JPG",
    gallery: ["/assets/site/02.JPG", "/assets/backgrounds/webP/map-02.webp"],
    techStack: ["Next.js", "React Query", "Zod", "Redis"],
    services: ["Web Applications", "Automation"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/",
    featured: true
  },
  {
    title: "Local Commerce Storefront",
    slug: "local-commerce-storefront",
    summary:
      "A product catalogue and order enquiry flow for a retailer moving from social posts to a more dependable storefront.",
    description:
      "A storefront concept with product discovery, purchase intent capture, order records, and a clear contact handover.",
    problem:
      "Products were promoted manually across social channels, but stock questions and order requests were difficult to track.",
    solution:
      "I created a structured catalogue experience with product cards, order CTAs, and a path toward admin-managed inventory.",
    outcome:
      "Customers had a clearer buying path, while the business gained more organized product and order conversations.",
    clientType: "Retail",
    industry: "Commerce",
    coverImage: "/assets/site/03.JPG",
    gallery: ["/assets/site/03.JPG", "/assets/backgrounds/webP/map-03.webp"],
    techStack: ["Next.js", "TypeScript", "Prisma", "Cloudflare R2"],
    services: ["E-commerce", "Web Applications"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/",
    featured: true
  },
  {
    title: "AI Service Assistant",
    slug: "ai-service-assistant",
    summary:
      "A focused assistant concept that answers common questions, qualifies service enquiries, and prepares a cleaner handover.",
    description:
      "A practical AI assistant flow built around FAQs, service fit, handover summaries, and clear next steps for business owners.",
    problem:
      "The business was answering repeated questions manually and often had to collect the same project context several times.",
    solution:
      "I structured an assistant experience that explains services, captures intent, and turns chat context into a useful lead summary.",
    outcome:
      "Visitors get faster guidance while the business receives better starting context for follow-up.",
    clientType: "SME",
    industry: "Automation",
    coverImage: "/assets/hero-images/webp/hero-04.webp",
    gallery: ["/assets/hero-images/webp/hero-04.webp", "/assets/backgrounds/webP/brand-03.webp"],
    techStack: ["Next.js", "AI SDK", "Redis", "Zod"],
    services: ["AI Automation", "Web Applications"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/",
    featured: true
  }
];

export const testimonials = [
  {
    clientName: "Local business owner",
    role: "Founder",
    company: "Service company",
    quote:
      "Martin helped us think beyond a simple website. The final system made enquiries easier to understand and follow up on.",
    image: "/assets/testimonials/testimonials.png"
  },
  {
    clientName: "Operations lead",
    role: "Manager",
    company: "Clinic team",
    quote:
      "The booking flow gave our team a clearer way to collect patient details before we call back. It feels practical and easy to use.",
    image: "/assets/testimonials/testimonial2.png"
  },
  {
    clientName: "Recruiter review",
    role: "Technical hiring",
    company: "Software team",
    quote:
      "The work shows product thinking, strong fundamentals, and the ability to explain technical decisions in business language.",
    image: "/assets/hero-images/png/me-hero.png"
  },
  {
    clientName: "Startup founder",
    role: "Founder",
    company: "Digital services startup",
    quote:
      "The process was clear from the first call. We ended with a sharper project direction and a better way to capture serious leads.",
    image: "/assets/site/02.JPG"
  }
];

export const flextechServices = [
  {
    id: "web-applications",
    number: "01",
    title: "Web Applications",
    summary:
      "Reliable systems that help teams capture leads, manage work, and serve customers online without unnecessary complexity.",
    who: "SMEs, clinics, schools, startups, and service providers that have outgrown basic pages.",
    problems: ["Scattered enquiries", "Manual admin work", "Slow customer follow-up"],
    outcomes: ["Cleaner lead capture", "Better internal workflows", "A system that can grow with the business"],
    image: "/assets/backgrounds/webP/brand-01.webp"
  },
  {
    id: "booking-systems",
    number: "02",
    title: "Booking Systems",
    summary:
      "Appointment and reservation flows that make it easier for customers to choose a time and easier for teams to prepare.",
    who: "Clinics, consultants, salons, coaches, training providers, and appointment-led businesses.",
    problems: ["Missed calls", "Double bookings", "Unclear appointment details"],
    outcomes: ["More confirmed bookings", "Less back-and-forth", "Better reminders and follow-up"],
    image: "/assets/backgrounds/webP/brand-02.webp"
  },
  {
    id: "ecommerce",
    number: "03",
    title: "E-commerce",
    summary:
      "Product, cart, checkout, and order workflows built around trust, speed, and practical operations.",
    who: "Retailers, creators, local brands, and service businesses selling products or packages.",
    problems: ["Manual orders", "Low buyer confidence", "No stock or order visibility"],
    outcomes: ["Simpler buying flow", "Clearer order records", "A more professional sales channel"],
    image: "/assets/backgrounds/webP/brand-03.webp"
  },
  {
    id: "ai-automations",
    number: "04",
    title: "AI Automations",
    summary:
      "Practical AI helpers for FAQs, lead qualification, content support, internal summaries, and routine workflows.",
    who: "Businesses that want useful AI inside existing processes, not shiny demos with no operational value.",
    problems: ["Repeated questions", "Slow lead qualification", "Manual summaries and handovers"],
    outcomes: ["Faster responses", "Cleaner handovers", "Less repetitive work for the team"],
    image: "/assets/hero-images/webp/hero-04.webp"
  }
];

export const faqs = [
  {
    question: "How much does a website or system cost?",
    answer:
      "Pricing depends on scope, integrations, content, and timeline. A focused business website costs less than a custom booking or dashboard system. The first step is understanding what the system needs to do for your business."
  },
  {
    question: "How long does a typical project take?",
    answer:
      "A focused website can take a few weeks. A booking system, ecommerce flow, or custom dashboard usually takes longer because planning, testing, and admin workflows matter."
  },
  {
    question: "Can you help with existing websites?",
    answer:
      "Yes. I can review an existing site, improve conversion points, rebuild weak sections, or plan a more reliable system around what already works."
  },
  {
    question: "Do you offer support after launch?",
    answer:
      "Yes. I can help with fixes, improvements, hosting guidance, analytics, content updates, and future feature planning."
  },
  {
    question: "Can you build AI features for a business?",
    answer:
      "Yes, when there is a real use case. Good examples include FAQ assistants, lead qualification, internal summaries, and handover notes."
  }
];

export const blogPosts = [
  {
    title: "Why business websites need better lead capture",
    slug: "better-lead-capture",
    excerpt:
      "A practical look at why contact forms, CTAs, and follow-up structure matter more than decorative sections.",
    category: "Business systems",
    tags: ["Leads", "Websites", "Conversion"],
    coverImage: "/assets/backgrounds/webP/brand-01.webp",
    publishedAt: "2026-05-01",
    content: [
      "A good website should help a business understand who is interested, what they need, and how urgent the request is.",
      "Many sites only provide a generic contact box. That forces the owner to ask the same follow-up questions every time.",
      "Better lead capture starts with clear service pages, specific calls to action, and forms that ask enough without becoming tiring."
    ]
  },
  {
    title: "Booking systems reduce more than missed calls",
    slug: "booking-systems-reduce-missed-calls",
    excerpt:
      "The best booking systems also improve preparation, reminders, and customer confidence.",
    category: "Booking",
    tags: ["Bookings", "Operations", "SMEs"],
    coverImage: "/assets/backgrounds/webP/brand-02.webp",
    publishedAt: "2026-04-18",
    content: [
      "A booking system is not only a calendar. It is a structured agreement between the customer and the business.",
      "When the flow captures the right details, the team can prepare before the appointment and reduce back-and-forth.",
      "The result is a calmer process for both sides."
    ]
  },
  {
    title: "Where AI actually helps small businesses",
    slug: "where-ai-helps-small-businesses",
    excerpt:
      "AI works best when it removes repeated work or improves handover quality inside an existing workflow.",
    category: "AI automation",
    tags: ["AI", "Automation", "Workflow"],
    coverImage: "/assets/hero-images/webp/hero-04.webp",
    publishedAt: "2026-04-04",
    content: [
      "AI should not be added because it sounds modern. It should solve a repeated operational problem.",
      "Useful examples include answering common questions, summarising enquiries, and preparing handover notes.",
      "The strongest AI features are clear about what they can and cannot do."
    ]
  }
];
