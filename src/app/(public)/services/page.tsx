import { Reveal } from "@/components/public/motion";
import { TrackedLink } from "@/components/public/tracked-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { serviceSchema, webPageSchema } from "@/lib/schema";
import { withCanonical } from "@/lib/seo";
import { getPublicSiteConfig } from "@/lib/public-site-config";
import { getCurrentSite } from "@/lib/sites";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  type LucideIcon,
  MonitorCog,
  ShoppingBag,
  Sparkles,
  Target,
  XCircle
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);

  return withCanonical({
    title: "Services",
    description: site.pages.services.metadataDescription,
    openGraph: {
      title: `Services | ${site.brandName}`,
      description: site.pages.services.metadataDescription
    },
    twitter: {
      card: "summary_large_image",
      title: `Services | ${site.brandName}`,
      description: site.pages.services.metadataDescription
    }
  }, "/services", site.slug);
}

export default async function ServicesPage() {
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);
  const page = site.pages.services;
  const isFlexTech = site.slug === "flextech-media";

  const breadcrumbSchema = webPageSchema({
    name: `Services | ${site.brandName}`,
    description: page.metadataDescription,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Services", url: "/services" }
    ],
    url: "/services"
  });

  const serviceSchemas = site.services.map((service) =>
    serviceSchema({
      name: service.title,
      description: service.summary,
      providerName: site.brandName,
      providerType: isFlexTech ? "Organization" : "Person",
      url: `/services#${service.id}`,
      areaServed: "Namibia"
    })
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {serviceSchemas.map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <Section className="relative overflow-hidden pb-10 pt-12 lg:pb-14 lg:pt-16">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(136,82,224,0.22),transparent_30rem),radial-gradient(circle_at_82%_4%,rgba(34,197,94,0.10),transparent_26rem)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-px bg-[linear-gradient(90deg,transparent,rgba(136,82,224,0.45),transparent)]" />
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.82fr] lg:items-end">
            <Reveal>
              <Badge className="mb-5">
                <Sparkles size={13} /> Services
              </Badge>
              <h1 className="max-w-4xl text-balance font-display text-[clamp(2.5rem,6vw,5.8rem)] font-black leading-[0.94] text-[color:var(--text-strong)]">
                {page.title}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[color:var(--text-muted)] md:text-lg">
                {page.description}
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="rounded-[28px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[0_20px_70px_rgba(107,38,217,0.12)]">
                <div className="flex items-center gap-3 border-b border-[color:var(--border-subtle)] pb-4">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[color:var(--primary)]/12 text-[color:var(--primary)]">
                    <Target size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-black text-[color:var(--text-strong)]">Pick the outcome first</p>
                    <p className="text-xs leading-5 text-[color:var(--text-muted)]">Then shape the system around the work it needs to do.</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {heroOutcomes.map(({ label, icon: Icon }) => (
                    <div key={label as string} className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-3 py-3">
                      <Icon className="text-[color:var(--primary)]" size={17} />
                      <p className="mt-2 text-xs font-bold text-[color:var(--text-normal)]">{label as string}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <nav aria-label="Service sections" className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {site.services.map((service) => {
                return (
                  <a
                    key={service.id}
                    href={`#${service.id}`}
                    className="group flex items-center justify-between gap-3 rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 py-3 text-sm font-bold text-[color:var(--text-normal)] transition hover:-translate-y-0.5 hover:border-[color:var(--primary)]/45 hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[color:var(--primary)]/10 text-[color:var(--primary)]">
                        <ServiceGlyph id={service.id} size={18} />
                      </span>
                      <span className="truncate">{service.title}</span>
                    </span>
                    <ChevronRight className="shrink-0 text-[color:var(--text-faint)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--primary)]" size={17} />
                  </a>
                );
              })}
            </nav>
          </Reveal>
        </Container>
      </Section>

      <Section className="relative overflow-hidden pt-0">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--background),var(--background-elevated),var(--background))]" />
        <Container className="grid gap-7">
          {site.services.map((service, index) => (
            <Reveal key={service.id} delay={index * 0.04}>
              <ServiceFeature
                service={service}
                index={index}
                ctaLabel={page.ctaLabel}
                siteSlug={site.slug}
              />
            </Reveal>
          ))}
        </Container>
      </Section>
    </>
  );
}

function ServiceFeature({
  service,
  index,
  ctaLabel,
  siteSlug
}: {
  service: {
    id: string;
    title: string;
    summary: string;
    who: string;
    problems: string[];
    outcomes: string[];
  };
  index: number;
  ctaLabel: string;
  siteSlug: string;
}) {
  const isAlt = index % 2 === 1;

  return (
    <article
      id={service.id}
      className="scroll-mt-32 overflow-hidden rounded-[30px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] shadow-[0_22px_70px_rgba(107,38,217,0.10)]"
    >
      <div className={cn("grid gap-0 lg:grid-cols-[0.9fr_1.1fr]", isAlt && "lg:grid-cols-[1.1fr_0.9fr]")}>
        <div className={cn("relative min-h-[310px] overflow-hidden bg-[color:var(--surface-soft)] p-7 sm:p-9", isAlt && "lg:order-2")}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(136,82,224,0.34),transparent_18rem),radial-gradient(circle_at_78%_82%,rgba(34,197,94,0.10),transparent_16rem)]" />
          <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.075)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.075)_1px,transparent_1px)] [background-size:34px_34px]" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--primary)]/25 bg-[color:var(--primary)]/12 px-3 py-1 text-xs font-black text-[color:var(--primary)]">
                <ServiceGlyph id={service.id} size={15} /> {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-7 max-w-lg text-balance font-display text-[clamp(2rem,4vw,4rem)] font-black leading-[0.98] text-[color:var(--text-strong)]">
                {service.title}
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[color:var(--text-muted)] md:text-base">
                {service.summary}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--background)]/35 px-3 py-1.5 text-xs font-bold text-[color:var(--text-normal)]">
                <Clock3 size={14} /> Faster follow-up
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--background)]/35 px-3 py-1.5 text-xs font-bold text-[color:var(--text-normal)]">
                <Target size={14} /> Clear next action
              </span>
            </div>
          </div>
        </div>

        <div className="p-7 sm:p-9 lg:p-10">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--text-faint)]">Best fit</p>
            <p className="mt-3 text-base leading-8 text-[color:var(--text-normal)]">{service.who}</p>
          </div>

          <div className="mt-9 grid gap-8 xl:grid-cols-2">
            <ServiceList
              title="Friction removed"
              icon={XCircle}
              items={service.problems}
              tone="muted"
            />
            <ServiceList
              title="Business lift"
              icon={CheckCircle2}
              items={service.outcomes}
              tone="accent"
            />
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button asChild size="md" variant="secondary" className="rounded-full px-6 py-3">
              <TrackedLink
                siteSlug={siteSlug}
                eventType="service_interest_clicked"
                eventPage="/services"
                eventSource="service_cta"
                eventMetadata={{ service: service.id }}
                href={`/start-project?service=${service.id}`}
              >
                {ctaLabel} <ArrowRight size={16} />
              </TrackedLink>
            </Button>
            <Link
              href="/projects"
              className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
            >
              See related work <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function ServiceList({
  title,
  icon: Icon,
  items,
  tone
}: {
  title: string;
  icon: LucideIcon;
  items: string[];
  tone: "muted" | "accent";
}) {
  return (
    <div>
      <h3 className="text-sm font-black text-[color:var(--text-strong)]">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex gap-3">
            <span
              className={cn(
                "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-2xl",
                tone === "accent"
                  ? "bg-[color:var(--primary)]/12 text-[color:var(--primary)]"
                  : "bg-[color:var(--surface-soft)] text-[color:var(--text-faint)]"
              )}
            >
              <Icon size={16} />
            </span>
            <p className="text-sm leading-6 text-[color:var(--text-muted)]">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceGlyph({ id, size = 18 }: { id: string; size?: number }) {
  if (id === "booking-systems") return <CalendarCheck size={size} />;
  if (id === "ecommerce") return <ShoppingBag size={size} />;
  if (id === "ai-automations") return <Bot size={size} />;
  return <MonitorCog size={size} />;
}

const heroOutcomes: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Lead capture", icon: BriefcaseBusiness },
  { label: "Booking flow", icon: CalendarCheck },
  { label: "Commerce path", icon: ShoppingBag },
  { label: "AI handoff", icon: Bot }
];
