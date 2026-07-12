import { Reveal } from "@/components/public/motion";
import { SectionHeading } from "@/components/public/section-heading";
import { Container, Section } from "@/components/ui/container";
import { getOverriddenPublicSiteConfig } from "@/lib/site-overrides";
import { getCurrentSite } from "@/lib/sites";
import { cn } from "@/lib/utils";
import { serviceSchema, webPageSchema } from "@/lib/schema";
import { withCanonical } from "@/lib/seo";
import { ArrowRight, Bot, CalendarCheck, CheckCircle2, MonitorCog, ShoppingBag, XCircle } from "lucide-react";
import type { Metadata } from "next";
import { TrackedLink } from "@/components/public/tracked-link";

export async function generateMetadata(): Promise<Metadata> {
  const currentSite = await getCurrentSite();
  const site = await getOverriddenPublicSiteConfig(currentSite?.slug);

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
  const site = await getOverriddenPublicSiteConfig(currentSite?.slug);
  const page = site.pages.services;
  const isFlexTech = site.slug === "flextech-media";

  const breadcrumbSchema = webPageSchema({
    name: "Services | " + site.brandName,
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
      {serviceSchemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <Section className={cn("pb-12", isFlexTech && "pb-8")}>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Services"
              title={page.title}
              description={page.description}
              align="center"
            />
          </Reveal>
        </Container>
      </Section>

      <Section className={cn(
        "pt-0 relative overflow-hidden",
        isFlexTech
          ? "bg-[color:var(--background)]"
          : "bg-gradient-to-b from-[color:var(--background)] to-[color:var(--background-elevated)]/12 technical-bg"
      )}>
        {!isFlexTech && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-20"
              style={{
                backgroundImage: `conic-gradient(at top, var(--primary-light) 0deg, var(--primary) 120deg, rgba(255,255,255,0) 220deg)`,
                opacity: 0.06,
                mixBlendMode: "soft-light"
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-[url('/assets/backgrounds/SVG/map-03.svg')] bg-bottom bg-cover opacity-12 blur-sm mix-blend-multiply"
            />
          </>
        )}

        <Container className="grid gap-6">
          {site.services.map((service, index) => (
            <Reveal key={service.id} delay={index * 0.05}>
              <article id={service.id} className="mx-auto max-w-6xl scroll-mt-32 overflow-hidden rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]/80 p-6 shadow-[0_3px_10px_rgba(0,0,0,0.06)] transition duration-200 lg:p-8">
                {/* Four-column grid: Identity | Who it helps | Common friction | Business results */}
                <div className="grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))] lg:gap-6">
                  {/* Identity column */}
                  <div className="flex h-full flex-col p-1 lg:pr-2">
                    <div className="flex items-center gap-4">
                      <ServiceIcon id={service.id} />
                      <h2 className="text-balance font-display text-2xl font-black leading-tight text-[color:var(--text-strong)] lg:text-3xl">{service.title}</h2>
                    </div>
                    <p className="mt-4 max-w-sm text-sm leading-7 text-[color:var(--text-muted)]">{service.summary}</p>
                    <TrackedLink
                      siteSlug={site.slug}
                      eventType="service_interest_clicked"
                      eventPage="/services"
                      eventSource="service_cta"
                      eventMetadata={{ service: service.id }}
                      href={`/start-project?service=${service.id}`}
                      className="group mt-5 inline-flex w-fit items-center gap-1.5 rounded-sm text-sm font-bold text-[color:var(--primary)] outline-offset-4 transition-colors hover:text-[color:var(--primary-dark)] focus-visible:outline-2 focus-visible:outline-[color:var(--primary)] lg:mt-auto lg:pt-6"
                    >
                      {page.ctaLabel}
                      <ArrowRight size={15} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1" />
                    </TrackedLink>
                  </div>

                  {/* Who it helps */}
                  <InfoBlock title="Who it helps" description={service.who} variant="help" />

                  {/* Common friction */}
                  <InfoBlock title="Common friction" items={service.problems} variant="friction" />

                  {/* Business results */}
                  <InfoBlock title="Business results" items={service.outcomes} variant="result" />
                </div>
              </article>
            </Reveal>
          ))}
        </Container>
      </Section>
    </>
  );
}

function ServiceIcon({ id }: { id: string }) {
  const icons = {
    "web-applications": MonitorCog,
    "booking-systems": CalendarCheck,
    ecommerce: ShoppingBag,
    "ai-automations": Bot
  };
  const iconColors = {
    "web-applications": "text-[color:var(--primary)] bg-[color:var(--primary-light)]/12 border-[color:var(--primary-light)]",
    "booking-systems": "text-[color:var(--primary)] bg-[color:var(--primary-light)]/12 border-[color:var(--primary-light)]",
    ecommerce: "text-[color:var(--primary)] bg-[color:var(--primary-light)]/12 border-[color:var(--primary-light)]",
    "ai-automations": "text-[color:var(--primary)] bg-[color:var(--primary-light)]/12 border-[color:var(--primary-light)]"
  };
  const Icon = icons[id as keyof typeof icons] ?? MonitorCog;
  const colorClass = iconColors[id as keyof typeof iconColors] ?? iconColors["web-applications"];

  return (
    <div className={"grid h-14 w-14 shrink-0 place-items-center rounded-full border bg-white/[0.03] " + colorClass}>
      <Icon size={26} />
    </div>
  );
}

function InfoBlock({
  title,
  description,
  items,
  variant
}: {
  title: string;
  description?: string;
  items?: string[];
  variant?: "friction" | "result" | "help";
}) {
  const isResult = variant === "result";

  return (
    <div className={cn(
      "h-full rounded-[18px] border border-[color:var(--border-subtle)] p-5 lg:p-6",
      variant === "help"
        ? "bg-[color:var(--surface-soft)]"
        : "bg-white/[0.03]"
    )}>
      <h3 className="text-balance text-sm font-bold text-[color:var(--text-strong)]">{title}</h3>
      {description ? (
        <p className="mt-4 text-sm leading-6 text-[color:var(--text-muted)]">{description}</p>
      ) : null}
      {items ? (
        <div className="mt-4 space-y-4">
          {items.map((item) => (
            <div key={item} className="flex items-start gap-3">
              {isResult
                ? <CheckCircle2 size={19} strokeWidth={1.8} className="mt-0.5 shrink-0 text-[color:var(--primary)]" aria-hidden="true" />
                : <XCircle size={19} strokeWidth={1.8} className="mt-0.5 shrink-0 text-[color:var(--primary)]" aria-hidden="true" />}
              <p className="text-sm leading-6 text-[color:var(--text-muted)]">{item}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
