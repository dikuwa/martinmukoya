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
              <article id={service.id} className="mx-auto max-w-4xl scroll-mt-32 overflow-hidden rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]/80 p-8 shadow-[0_3px_10px_rgba(0,0,0,0.06)] transition duration-200 lg:p-12">
                {/* Four-column grid: Identity | Who it helps | Common friction | Business results */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Identity column */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <ServiceIcon id={service.id} />
                    </div>
                    <div>
                      <h2 className="text-balance text-3xl font-display font-black text-[color:var(--text-strong)]">{service.title}</h2>
                      <p className="mt-3 max-w-xs text-sm leading-7 text-[color:var(--text-muted)]">{service.summary}</p>
                    </div>
                  </div>

                  {/* Who it helps */}
                  <InfoBlock title="Who it helps" description={service.who} variant="help" />

                  {/* Common friction */}
                  <InfoBlock title="Common friction" items={service.problems} variant="friction" />

                  {/* Business results */}
                  <InfoBlock title="Business results" items={service.outcomes} variant="result" />
                </div>

                {/* Learn more - centered plain link */}
                <div className="mt-8 flex justify-center">
                  <TrackedLink
                    siteSlug={site.slug}
                    eventType="service_interest_clicked"
                    eventPage="/services"
                    eventSource="service_cta"
                    eventMetadata={{ service: service.id }}
                    href={`/start-project?service=${service.id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--primary)] hover:text-[color:var(--primary-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)] rounded-md px-3 py-2 transition-colors"
                  >
                    {page.ctaLabel} <ArrowRight size={16} aria-hidden="true" />
                  </TrackedLink>
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
  const rowClass = isResult
    ? "border-[color:var(--primary-light)] bg-[color:var(--primary-light)]/10 text-[color:var(--text-strong)]"
    : "border-[color:var(--border-subtle)] bg-[color:var(--border-subtle)]/12 text-[color:var(--text-normal)]";

  return (
    <div className={cn(
      "rounded-[24px] border border-[color:var(--border-subtle)] p-5",
      variant === "help"
        ? "bg-[color:var(--surface-soft)]"
        : "bg-white/[0.03]"
    )}>
      <h3 className="text-balance text-sm font-bold text-[color:var(--text-strong)]">{title}</h3>
      {description ? (
        <p className="mt-4 text-sm leading-6 text-[color:var(--text-muted)]">{description}</p>
      ) : null}
      {items ? (
        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <div key={item} className={"flex gap-3 rounded-[20px] border p-4 " + rowClass}>
              <span className="mt-1 grid h-9 w-9 place-items-center rounded-2xl bg-[color:var(--primary)]/10 text-[color:var(--primary)] shrink-0" aria-hidden="true">
                {isResult ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              </span>
              <p className="text-sm leading-6 text-[color:var(--text-muted)]">{item}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}