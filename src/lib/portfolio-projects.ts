export type PortfolioProject = {
  title: string;
  slug: string;
  eyebrow: string;
  summary: string;
  description: string;
  problem: string;
  solution: string;
  outcome: string;
  clientType: string;
  industry: string;
  timeline?: string;
  role: string;
  deliverables: string[];
  stackSummary: string;
  benefits: Array<{ title: string; description: string; iconKey: string; sortOrder: number }>;
  capabilities: Array<{ title: string; description: string; iconKey: string; sortOrder: number }>;
  coverImage: string;
  coverImageAlt: string;
  gallery: string[];
  techStack: string[];
  services: string[];
  liveUrl: string;
  githubUrl: string;
  caseStudyContent: string;
  featured: boolean;
  sortOrder: number;
};

export const portfolioProjects: PortfolioProject[] = [
  {
    title: "ScolaPro — School Management System for Namibian Schools",
    slug: "scolapro-school-management-system-namibia",
    eyebrow: "Education Technology · Namibia",
    summary: "A Namibia-first school management platform that brings attendance, academics, learners, parents, staff, timetables, reporting and school operations into one secure, mobile-friendly system with offline support.",
    description: "A production-oriented school operations platform built around real Namibian school workflows and the principle: capture once, use everywhere.",
    problem: "School processes are often fragmented across paper files, spreadsheets, messaging apps and disconnected systems. Teachers and administrators repeatedly capture the same information while parents have limited access to timely school information.",
    solution: "I designed ScolaPro as one governed platform for learner and staff records, academic setup, timetables, attendance, assessment, report cards, conduct, library operations, parent access and school administration. PostgreSQL and Supabase provide the data foundation, with row-level security, role-aware workflows and offline queues for selected tasks.",
    outcome: "ScolaPro demonstrates how a modern school information system can simplify daily administration while preserving the controls required for academic, learner and historical data.",
    clientType: "Schools / SaaS",
    industry: "Education / EdTech",
    role: "Product Owner · Full-Stack Developer · System Architect",
    deliverables: ["Web application", "PWA", "School operations platform", "Parent portal"],
    stackSummary: "A Next.js and PostgreSQL/Supabase education platform with role-based workflows, offline-capable PWA architecture, reporting and document generation.",
    benefits: [
      { title: "One source of truth", description: "School information is captured once and reused across operational, academic and reporting workflows.", iconKey: "database", sortOrder: 0 },
      { title: "Namibia-first workflows", description: "Academic structures, roles and school processes are designed around the local education environment.", iconKey: "industry", sortOrder: 1 },
      { title: "Offline-ready", description: "Selected attendance, library and teaching workflows can continue through unreliable connectivity.", iconKey: "mobile", sortOrder: 2 },
      { title: "Role-aware access", description: "Users see data and actions appropriate to their school responsibilities.", iconKey: "security", sortOrder: 3 }
    ],
    capabilities: [
      { title: "Learners & enrolment", description: "Long-lived learner identity and effective school enrolment.", iconKey: "users", sortOrder: 0 },
      { title: "Attendance", description: "Daily register and subject-period attendance with offline support.", iconKey: "dashboard", sortOrder: 1 },
      { title: "Academics & reports", description: "Assessment, results, report cards and document workflows.", iconKey: "documents", sortOrder: 2 },
      { title: "Parent portal", description: "Guardian-linked access to published school information.", iconKey: "mobile", sortOrder: 3 },
      { title: "Library operations", description: "Textbook and learning-resource circulation workflows.", iconKey: "catalogue", sortOrder: 4 },
      { title: "School administration", description: "Staff, roles, timetable, calendar and operational setup.", iconKey: "settings", sortOrder: 5 }
    ],
    coverImage: "/assets/backgrounds/webP/brand-01.webp",
    coverImageAlt: "ScolaPro school management system case study",
    gallery: ["/assets/backgrounds/webP/brand-01.webp", "/assets/site/01.JPG"],
    techStack: ["Next.js", "React", "TypeScript", "Supabase", "PostgreSQL", "Tailwind CSS", "TanStack Query", "Zod", "IndexedDB"],
    services: ["Web Applications", "Education Technology", "PWA"],
    liveUrl: "https://scolapro-jet.vercel.app",
    githubUrl: "https://github.com/dikuwa/scolapro",
    caseStudyContent: "ScolaPro became much more than a CRUD dashboard. The difficult part was deciding which records should be authoritative and ensuring one workflow could reuse data from another without creating duplicate sources of truth. That influenced everything from attendance and report cards to guardian relationships, school roles and offline synchronisation. The system uses explicit lifecycle states, historical records, permission boundaries and server-side validation rather than relying only on what the interface shows.",
    featured: true,
    sortOrder: 0
  },
  {
    title: "GovFleet Namibia — Digital Government Fleet Management",
    slug: "government-fleet-management-system-namibia",
    eyebrow: "GovTech · Fleet Management",
    summary: "A multi-tenant fleet management platform for Namibian public-sector transport workflows, connecting requests, approvals, allocations, trip authorities, inspections, fuel, driver logs, documents and audit history.",
    description: "A workflow-driven government fleet platform that replaces disconnected paper processes with one traceable transport lifecycle.",
    problem: "Fleet administration can involve paper forms, repeated transcription, manual signatures and several approval offices before a vehicle is released. That makes request status, availability and accountability difficult to track.",
    solution: "I built a workflow-driven platform where transport information is captured once and carried through approval, allocation, inspection, trip authority, driver logging, fuel capture, return inspection and closure. Role-specific actions, official documents and audit history stay connected to the same trip record.",
    outcome: "The platform turns fleet administration into a traceable operational system while preserving the approvals, documents and accountability required by public-sector transport workflows.",
    clientType: "Public Sector",
    industry: "Government / Fleet Management",
    role: "Product Designer · Full-Stack Developer · System Architect",
    deliverables: ["Fleet management platform", "PWA", "Workflow engine", "Official documents"],
    stackSummary: "A responsive Next.js fleet platform using multi-tenant controls, governed workflow rules, document generation, offline driver capabilities and operational analytics.",
    benefits: [
      { title: "Paper to digital", description: "Request data flows into approvals, allocation, authorities and trip completion without repeated re-entry.", iconKey: "documents", sortOrder: 0 },
      { title: "Accountable approvals", description: "Role-specific stages make responsibility and decision history visible.", iconKey: "security", sortOrder: 1 },
      { title: "Mobile driver workflows", description: "Drivers can capture logs, inspections and fuel information from a phone.", iconKey: "mobile", sortOrder: 2 },
      { title: "Multi-tenant foundation", description: "Separate organisations can operate without mixing tenant data.", iconKey: "database", sortOrder: 3 }
    ],
    capabilities: [
      { title: "Transport requests", description: "Structured trip requests with workflow routing.", iconKey: "dashboard", sortOrder: 0 },
      { title: "Vehicle allocation", description: "Availability-aware fleet assignment and recommendations.", iconKey: "settings", sortOrder: 1 },
      { title: "Trip authorities", description: "Official, traceable document generation.", iconKey: "documents", sortOrder: 2 },
      { title: "Driver logs", description: "Mobile daily logs with offline draft support.", iconKey: "mobile", sortOrder: 3 },
      { title: "Fuel & inspections", description: "Fuel records, receipts and vehicle condition workflows.", iconKey: "analytics", sortOrder: 4 },
      { title: "Audit & reporting", description: "Operational history, reporting and export workflows.", iconKey: "security", sortOrder: 5 }
    ],
    coverImage: "/assets/backgrounds/webP/map-01.webp",
    coverImageAlt: "GovFleet Namibia government fleet management case study",
    gallery: ["/assets/backgrounds/webP/map-01.webp", "/assets/site/02.JPG"],
    techStack: ["Next.js", "React", "TypeScript", "PostgreSQL", "Drizzle ORM", "Better Auth", "Dexie", "Vitest", "Playwright", "OCR"],
    services: ["Web Applications", "GovTech", "Workflow Systems"],
    liveUrl: "https://grn-fleet-system.vercel.app",
    githubUrl: "https://github.com/dikuwa/grn-fleet-system",
    caseStudyContent: "Fleet software becomes difficult when one trip touches approvals, staff authority, vehicle availability, licences, inspections, documents and finance at the same time. The architecture therefore treats the trip as a governed lifecycle instead of several independent forms. Changes to vehicles, drivers or approval state can be validated against the workflow and retained in the audit history.",
    featured: true,
    sortOrder: 1
  },
  {
    title: "Mondesa Health — Multi-Tenant Healthcare Platform",
    slug: "mondesa-health-practice-management-platform",
    eyebrow: "Healthcare Technology · Namibia",
    summary: "A secure healthcare platform combining public practice discovery and appointment booking with independent practice workspaces, patient workflows, administration, financial documents and platform-level management.",
    description: "A multi-tenant healthcare product separating patient-facing discovery from protected practice operations and platform administration.",
    problem: "A healthcare marketplace needs to serve patients searching for care and healthcare teams managing sensitive operational information. A brochure website cannot provide practice isolation, secure staff workflows, booking management and platform administration.",
    solution: "Mondesa Health separates public healthcare discovery from authenticated practice and platform workspaces. Patients browse active practices and services, practice staff work inside one authorised practice context, and the platform team manages subscriptions and operations through a separate administration surface.",
    outcome: "The architecture supports multiple independent practices without blending their operational data, while giving patients a clear route from service discovery to appointment request.",
    clientType: "Healthcare Practices / SaaS",
    industry: "Healthcare / HealthTech",
    role: "Full-Stack Developer · Product Designer",
    deliverables: ["Healthcare platform", "Booking system", "Practice dashboard", "Platform admin"],
    stackSummary: "A Next.js healthcare application backed by PostgreSQL with strict platform/practice separation, secure sessions, booking workflows and server-generated documents.",
    benefits: [
      { title: "Independent workspaces", description: "Each subscribed practice operates within its own protected scope.", iconKey: "security", sortOrder: 0 },
      { title: "Simpler booking", description: "Patients discover services and request appointments through a focused journey.", iconKey: "mobile", sortOrder: 1 },
      { title: "Practice operations", description: "Staff manage bookings and practice information in one workspace.", iconKey: "dashboard", sortOrder: 2 },
      { title: "Security-led design", description: "Permissions, protected routes and session controls are part of the architecture.", iconKey: "security", sortOrder: 3 }
    ],
    capabilities: [
      { title: "Practice directory", description: "Public discovery across active healthcare practices.", iconKey: "catalogue", sortOrder: 0 },
      { title: "Appointment requests", description: "Patient-facing booking and intake workflows.", iconKey: "mobile", sortOrder: 1 },
      { title: "Practice dashboard", description: "Independent operational workspace per practice.", iconKey: "dashboard", sortOrder: 2 },
      { title: "Platform administration", description: "Practice, plan and subscription oversight.", iconKey: "settings", sortOrder: 3 },
      { title: "Financial documents", description: "Server-generated practice documents.", iconKey: "documents", sortOrder: 4 },
      { title: "Security controls", description: "Database-backed permissions and session revocation.", iconKey: "security", sortOrder: 5 }
    ],
    coverImage: "/assets/backgrounds/webP/brand-02.webp",
    coverImageAlt: "Mondesa Health multi-tenant healthcare platform case study",
    gallery: ["/assets/backgrounds/webP/brand-02.webp", "/assets/site/03.JPG"],
    techStack: ["Next.js", "React", "TypeScript", "PostgreSQL", "Prisma", "Zod", "Tailwind CSS", "React PDF", "Vitest"],
    services: ["Web Applications", "Healthcare Technology", "Booking Systems"],
    liveUrl: "https://mondesahealth.vercel.app",
    githubUrl: "https://github.com/dikuwa/mondesahealth",
    caseStudyContent: "A key architecture decision was keeping platform administration and practice operations separate. A platform user does not automatically inherit access to healthcare-practice data, and practice sessions remain scoped to an authorised practice. That boundary makes the product safer and creates a clearer path for scaling to additional healthcare providers.",
    featured: true,
    sortOrder: 2
  },
  {
    title: "Tanhwe Guest House — Hospitality Booking & Management System",
    slug: "tanhwe-guest-house-booking-management-system",
    eyebrow: "Hospitality · Booking Technology",
    summary: "A full hospitality website and management system for a guest house and conference centre, combining room discovery, availability, bookings, customers, payments, documents and administrative operations.",
    description: "A connected hospitality platform combining a visual guest-facing website with direct booking and operational administration.",
    problem: "A guest house website needs to do more than display photographs. Once direct bookings are accepted, availability, room inventory, guest information, payments and confirmations become part of the customer experience.",
    solution: "I developed Tanhwe as a connected hospitality platform. The public website introduces the property, rooms and conference offering, while the backend manages customers, availability, reservations, booking totals, payments, folio lines and generated documents.",
    outcome: "The property gains a professional direct-booking presence together with the operational tools needed to manage those bookings behind the scenes.",
    clientType: "Guest House & Conference Centre",
    industry: "Hospitality / Tourism",
    role: "Full-Stack Developer · UX Designer",
    deliverables: ["Website", "Booking system", "Admin dashboard"],
    stackSummary: "A Next.js hospitality system with PostgreSQL data, availability calculations, booking management, payments, PDF documents and role-aware administration.",
    benefits: [
      { title: "Direct booking", description: "Guests move from room discovery into a structured booking journey.", iconKey: "website", sortOrder: 0 },
      { title: "Availability management", description: "Room inventory and blocked dates feed booking decisions.", iconKey: "dashboard", sortOrder: 1 },
      { title: "One workspace", description: "Bookings, customers, payments and documents stay connected.", iconKey: "database", sortOrder: 2 },
      { title: "Conference-ready", description: "Accommodation and conference facilities share one digital presence.", iconKey: "industry", sortOrder: 3 }
    ],
    capabilities: [
      { title: "Rooms & amenities", description: "Public room discovery and accommodation content.", iconKey: "catalogue", sortOrder: 0 },
      { title: "Availability", description: "Date-aware room availability and blocked dates.", iconKey: "dashboard", sortOrder: 1 },
      { title: "Bookings", description: "Guest, room and stay management.", iconKey: "users", sortOrder: 2 },
      { title: "Payments", description: "Booking payment records and balances.", iconKey: "payments", sortOrder: 3 },
      { title: "Documents", description: "Booking-related PDF documents.", iconKey: "documents", sortOrder: 4 },
      { title: "Admin", description: "Role-aware operational management.", iconKey: "settings", sortOrder: 5 }
    ],
    coverImage: "/assets/site/01.JPG",
    coverImageAlt: "Tanhwe Guest House booking system case study",
    gallery: ["/assets/site/01.JPG", "/assets/backgrounds/webP/brand-03.webp"],
    techStack: ["Next.js", "React", "TypeScript", "PostgreSQL", "Drizzle ORM", "Better Auth", "Tailwind CSS", "React PDF", "Playwright", "Sentry"],
    services: ["Booking Systems", "Web Applications", "Hospitality"],
    liveUrl: "https://tanhweguesthouse.vercel.app",
    githubUrl: "https://github.com/dikuwa/tanhwe-guest-house",
    caseStudyContent: "The build connects guest-facing discovery with the operational records behind a stay. Availability, room assignments, guest details, payments and documents are treated as one booking lifecycle instead of separate website and spreadsheet processes.",
    featured: true,
    sortOrder: 3
  },
  {
    title: "Swakop Wellness Centre — Booking & Business Management Platform",
    slug: "swakop-wellness-booking-business-management-system",
    eyebrow: "Wellness · Business Systems",
    summary: "A wellness business platform combining service discovery and online booking with client management, follow-ups, payments, invoices, content administration and an AI-assisted booking experience.",
    description: "A full-stack service-business platform connecting the public website, bookings, client records, follow-up and business administration.",
    problem: "Service businesses often operate their website, bookings, WhatsApp enquiries, invoices and customer follow-up as separate processes. That fragmentation creates repeated work and makes requests easier to miss.",
    solution: "I designed the public website and internal dashboard around shared business data. Visitors move from services into a multi-step booking journey, while staff use the same booking and client records for follow-up, documents, payments and administration.",
    outcome: "Swakop Wellness shows how a local service website can become an operational platform that simplifies the customer journey and gives the business structured information behind each enquiry.",
    clientType: "Wellness Centre",
    industry: "Wellness / Healthcare Services",
    role: "Full-Stack Developer · Product Designer",
    deliverables: ["Business website", "Booking platform", "Dashboard", "AI assistant"],
    stackSummary: "A full-stack Next.js wellness platform with structured bookings, business administration, document generation and an AI-assisted customer journey.",
    benefits: [
      { title: "Unified booking", description: "Online and manually captured requests enter the same workflow.", iconKey: "dashboard", sortOrder: 0 },
      { title: "Dynamic services", description: "Services, prices and business information are managed as shared data.", iconKey: "catalogue", sortOrder: 1 },
      { title: "Structured follow-up", description: "Bookings and follow-up actions stay visible to staff.", iconKey: "users", sortOrder: 2 },
      { title: "Connected administration", description: "Documents and payments form part of the same system.", iconKey: "documents", sortOrder: 3 }
    ],
    capabilities: [
      { title: "Service catalogue", description: "Dynamic public service discovery.", iconKey: "catalogue", sortOrder: 0 },
      { title: "Booking flow", description: "Multi-step customer booking intake.", iconKey: "mobile", sortOrder: 1 },
      { title: "Client management", description: "Structured client and follow-up records.", iconKey: "users", sortOrder: 2 },
      { title: "AI assistant", description: "Knowledge-based booking support with guardrails.", iconKey: "automation", sortOrder: 3 },
      { title: "Business documents", description: "Quotations, invoices and receipts.", iconKey: "documents", sortOrder: 4 },
      { title: "Payments", description: "Payment and balance tracking.", iconKey: "payments", sortOrder: 5 }
    ],
    coverImage: "/assets/backgrounds/webP/brand-04.webp",
    coverImageAlt: "Swakop Wellness Centre booking platform case study",
    gallery: ["/assets/backgrounds/webP/brand-04.webp", "/assets/site/02.JPG"],
    techStack: ["Next.js", "React", "TypeScript", "PostgreSQL", "Drizzle ORM", "Tailwind CSS", "Zod", "AI integration"],
    services: ["Booking Systems", "Web Applications", "AI Automation"],
    liveUrl: "https://swakopwellness.vercel.app",
    githubUrl: "https://github.com/dikuwa/swakopwellness",
    caseStudyContent: "The important design decision was to make the website and operations dashboard share the same business data. A service or price update should not require separate edits across the public site, staff tools and assistant knowledge. That keeps the customer journey and internal workflow aligned.",
    featured: false,
    sortOrder: 4
  },
  {
    title: "ProSmile Dental — Modern Dental Website in Swakopmund",
    slug: "prosmile-dental-website-swakopmund",
    eyebrow: "Dental · Local Business Website",
    summary: "A responsive dental practice website designed to make treatments easier to understand, build patient trust and turn local searches into appointment enquiries for ProSmile Dental Practice in Swakopmund, Namibia.",
    description: "A warm, accessible local healthcare website focused on treatment discovery, reassurance and clear appointment actions.",
    problem: "Dental websites can easily become either too clinical or too generic. Patients often need reassurance as much as information when deciding whether to contact a practice.",
    solution: "I created a restrained, human-centred website that prioritises treatments, reassurance and appointment actions while authentic practice content establishes local credibility. The visual direction deliberately avoids the sterile feel of generic medical templates.",
    outcome: "The finished site gives ProSmile a more confident and approachable digital presence with a clearer route from treatment research to direct enquiry.",
    clientType: "Dental Practice",
    industry: "Dental / Healthcare",
    role: "Web Developer · UX Designer",
    deliverables: ["Responsive website", "Treatment UX", "Local conversion journey"],
    stackSummary: "A lightweight responsive practice website focused on clarity, accessibility, local trust and appointment conversion.",
    benefits: [
      { title: "Trust-first design", description: "Clinical professionalism is balanced with a warm, reassuring experience.", iconKey: "website", sortOrder: 0 },
      { title: "Treatment discovery", description: "Services are structured so patients can understand their options quickly.", iconKey: "catalogue", sortOrder: 1 },
      { title: "Local conversion", description: "Calls, messages and appointment actions remain easy to find.", iconKey: "enquiries", sortOrder: 2 },
      { title: "Accessible UX", description: "Contrast, focus behaviour and touch targets support a wider range of users.", iconKey: "mobile", sortOrder: 3 }
    ],
    capabilities: [
      { title: "Responsive website", description: "Desktop and mobile practice experience.", iconKey: "website", sortOrder: 0 },
      { title: "Treatment content", description: "General, cosmetic, restorative and orthodontic service presentation.", iconKey: "catalogue", sortOrder: 1 },
      { title: "Appointment CTAs", description: "Clear paths to contact and booking.", iconKey: "enquiries", sortOrder: 2 },
      { title: "Local business UX", description: "Practice information and contact details positioned for local discovery.", iconKey: "industry", sortOrder: 3 }
    ],
    coverImage: "/assets/backgrounds/webP/brand-05.webp",
    coverImageAlt: "ProSmile Dental Practice website case study",
    gallery: ["/assets/backgrounds/webP/brand-05.webp", "/assets/site/03.JPG"],
    techStack: ["HTML", "CSS", "JavaScript", "Responsive Web Design"],
    services: ["Web Design", "Healthcare Websites", "Local SEO"],
    liveUrl: "https://prosmile-dental.vercel.app",
    githubUrl: "https://github.com/dikuwa/Prosmile-dental",
    caseStudyContent: "This project is intentionally concise: the challenge was not adding more software, but creating a trustworthy local healthcare experience. The strongest decisions were information hierarchy, restrained visual design, accessibility and keeping appointment actions obvious without making the website feel overly promotional.",
    featured: false,
    sortOrder: 5
  },
  {
    title: "Ice & Spice Café — Interactive Café Website & AI Assistant",
    slug: "ice-and-spice-cafe-website-swakopmund",
    eyebrow: "Food & Hospitality · Swakopmund",
    summary: "A colourful, responsive website for Ice & Spice Café in Swakopmund, combining menu discovery, local business information, location tools and a knowledge-based conversational assistant for customer questions.",
    description: "A playful local-business website combining café content, menu discovery, location information and a controlled AI customer assistant.",
    problem: "Local cafés often depend on social media and static menu images. Customers repeatedly ask the same questions about opening hours, menu options, pricing and location.",
    solution: "I created an interactive website that combines menu content, café photography, contact information and location features with a conversational assistant backed by a curated business knowledge base. The assistant is instructed to answer directly and avoid inventing information.",
    outcome: "Customers get a faster way to understand the café before visiting, while the project shows how lightweight AI can add useful customer service without taking over the experience.",
    clientType: "Local Café",
    industry: "Restaurant / Café / Hospitality",
    role: "Web Developer · UX Designer",
    deliverables: ["Business website", "Interactive menu", "AI customer assistant"],
    stackSummary: "A lightweight Vite website using Tailwind CSS, GSAP, Mapbox and a controlled knowledge-base assistant.",
    benefits: [
      { title: "Menu discovery", description: "Customers explore gelato, desserts, drinks and light meals online.", iconKey: "catalogue", sortOrder: 0 },
      { title: "Instant answers", description: "A controlled assistant handles common customer questions.", iconKey: "automation", sortOrder: 1 },
      { title: "Local discovery", description: "Opening hours, contact and location details are easy to reach.", iconKey: "industry", sortOrder: 2 },
      { title: "Brand-led experience", description: "The interface reflects the café instead of a generic restaurant template.", iconKey: "website", sortOrder: 3 }
    ],
    capabilities: [
      { title: "Responsive website", description: "Mobile-friendly café experience.", iconKey: "website", sortOrder: 0 },
      { title: "Menu experience", description: "Structured menu and product discovery.", iconKey: "catalogue", sortOrder: 1 },
      { title: "Location map", description: "Map-based local discovery.", iconKey: "industry", sortOrder: 2 },
      { title: "AI assistant", description: "Business-knowledge responses with uncertainty guardrails.", iconKey: "automation", sortOrder: 3 },
      { title: "Contact actions", description: "Direct contact and WhatsApp paths.", iconKey: "enquiries", sortOrder: 4 },
      { title: "Motion", description: "GSAP-enhanced interactions and brand presentation.", iconKey: "website", sortOrder: 5 }
    ],
    coverImage: "/assets/backgrounds/webP/brand-06.webp",
    coverImageAlt: "Ice and Spice Cafe Swakopmund website case study",
    gallery: ["/assets/backgrounds/webP/brand-06.webp", "/assets/site/01.JPG"],
    techStack: ["Vite", "HTML", "JavaScript", "Tailwind CSS", "GSAP", "Mapbox", "AI API"],
    services: ["Web Design", "AI Automation", "Local Business Websites"],
    liveUrl: "https://iceand-spice.vercel.app",
    githubUrl: "https://github.com/dikuwa/IceandSpice",
    caseStudyContent: "The assistant was designed as a practical extension of the website rather than a novelty. It reads from a controlled café knowledge base, keeps replies short and natural, and is explicitly told not to invent prices, menu items or business information when the answer is uncertain.",
    featured: false,
    sortOrder: 6
  }
];

export const obsoletePortfolioProjectSlugs = [
  "clinic-booking-system",
  "service-business-lead-hub",
  "local-commerce-storefront",
  "ai-service-assistant",
  "school-operations-portal",
  "training-provider-booking-flow",
  "workshop-inventory-tracker",
  "whatsapp-lead-qualification-bot"
];


export const desertTechCaseStudyRefresh = {
  slug: "e-commerce-business-management-platform",
  summary: "A responsive technology catalogue and business management platform for Desert Technology, connecting product discovery, customer enquiries, orders, stock, documents and day-to-day administration.",
  description: "A customer-facing technology catalogue connected to a secure administration dashboard for products, stock, enquiries, orders, payments and business content.",
  problem: "Desert Technology promoted products and services across social media and messaging channels while stock updates, enquiries, orders and documents were handled separately. The business needed one reliable place to maintain catalogue information and coordinate daily operations.",
  solution: "I built a responsive product catalogue around the company’s existing enquiry-based sales process and connected it to an administration dashboard. Authorised users can manage products, brands, categories, promotions, customers, orders, payments, quotations, receipts, follow-ups and public website content without editing source code.",
  outcome: "Desert Technology gained a clearer customer journey and a central operational workspace for maintaining product information, handling enquiries and managing business records.",
  stackSummary: "A responsive Next.js commerce and business-management platform with shared catalogue data, role-based administration and reusable document workflows.",
  caseStudyContent: "The key decision was to keep the customer-facing catalogue and internal operations connected to the same structured data. Product, stock and promotional updates made in the dashboard can flow into the public experience without maintaining a second catalogue. Role-based access separates owner, admin and staff responsibilities, while order, payment and document records give the business a clearer operational history."
};
