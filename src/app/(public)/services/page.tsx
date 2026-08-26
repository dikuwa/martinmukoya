import { Reveal } from "@/components/public/motion";
import { SectionHeading } from "@/components/public/section-heading";
import { TrackedLink } from "@/components/public/tracked-link";
import { Container, Section } from "@/components/ui/container";
import { serviceSchema, webPageSchema } from "@/lib/schema";
import { withCanonical } from "@/lib/seo";
import { getOverriddenPublicSiteConfig } from "@/lib/site-overrides";
import { getCurrentSite } from "@/lib/sites";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  CheckCircle2,
  MonitorCog,
  ShoppingBag,
  XCircle
} from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const currentSite = await getCurrentSite();
  const site = await getOverriddenPublicSiteConfig(currentSite?.slug);

  return withCanonical(
    {
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
    },
    "/services",
    site.slug
  );
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
      {serviceSchemas.map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
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

      <Section
        className={cn(
          "relative overflow-hidden pt-0",
          isFlexTech
            ? "bg-[color:var(--background)]"
            : "technical-bg bg-gradient-to-b from-[color:var(--background)] to-[color:var(--background-elevated)]/12"
        )}
      >
        {!isFlexTech ? (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-20"
              style={{
                backgroundImage:
                  "conic-gradient(at top, var(--primary-light) 0deg, var(--primary) 120deg, rgba(255,255,255,0) 220deg)",
                opacity: 0.06,
                mixBlendMode: "soft-light"
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-[url('/assets/backgrounds/SVG/map-03.svg')] bg-bottom bg-cover opacity-12 blur-sm mix-blend-multiply"
            />
          </>
        ) : null}

        <Container className="grid gap-6">
          {site.services.map((service, index) => (
            <Reveal key={service.id} delay={index * 0.05}>
              <article
                id={service.id}
                className="mx-auto w-full max-w-6xl scroll-mt-32 overflow-hidden rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]/80 p-5 shadow-[0_3px_10px_rgba(0,0,0,0.06)] transition duration-200 sm:p-6 lg:p-8"
              >
                <div className="grid gap-0 md:grid-cols-2 md:gap-y-8 lg:grid-cols-4 lg:gap-y-0">
                  <div className="flex min-w-0 flex-col pb-6 md:pr-6 lg:pb-0 lg:pr-7">
                    <div className="flex min-w-0 items-start gap-3.5">
                      <ServiceIcon id={service.id} />
                      <h2 className="min-w-0 text-balance font-display text-[clamp(1.25rem,1.05rem+0.55vw,1.65rem)] font-semibold leading-[1.18] tracking-[-0.02em] text-[color:var(--text-strong)]">
                        {service.title}
                      </h2>
                    </div>
                    <p className="mt-4 max-w-md text-sm leading-7 text-[color:var(--text-muted)]">
                      {service.summary}
                    </p>
                  </div>

                  <InfoBlock title="Who it helps" description={service.who} variant="help" />
                  <InfoBlock title="Common friction" items={service.problems} variant="friction" />
                  <InfoBlock title="Business results" items={service.outcomes} variant="result" />
                </div>

                <div className="mt-7 flex justify-center">
                  <TrackedLink
                    siteSlug={site.slug}
                    eventType="service_interest_clicked"
                    eventPage="/services"
                    eventSource="service_cta"
                    eventMetadata={{ service: service.id }}
                    href={`/start-project?service=${service.id}`}
                    className="group inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-sm font-semibold text-[color:var(--primary)] outline-offset-4 transition-colors hover:text-[color:var(--primary-dark)] focus-visible:outline-2 focus-visible:outline-[color:var(--primary)]"
                  >
                    Learn more
                    <ArrowRight
                      size={15}
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1"
                    />
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

  const Icon = icons[id as keyof typeof icons] ?? MonitorCog;

  return (
    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[color:var(--primary-light)] bg-[color:var(--primary-light)]/12 text-[color:var(--primary)] sm:h-13 sm:w-13">
      <Icon size={23} aria-hidden="true" />
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
    <div className="min-w-0 border-t border-[color:var(--border-subtle)] py-6 md:px-6 lg:border-l lg:border-t-0 lg:py-0 lg:px-7">
      <h3 className="text-balance text-sm font-semibold text-[color:var(--text-strong)]">{title}</h3>

      {description ? (
        <p className="mt-4 text-sm leading-6 text-[color:var(--text-muted)]">{description}</p>
      ) : null}

      {items ? (
        <div className="mt-4 space-y-4">
          {items.map((item) => (
            <div key={item} className="flex items-start gap-3">
              {isResult ? (
                <CheckCircle2
                  size={18}
                  strokeWidth={1.8}
                  className="mt-0.5 shrink-0 text-[color:var(--primary)]"
                  aria-hidden="true"
                />
              ) : (
                <XCircle
                  size={18}
                  strokeWidth={1.8}
                  className="mt-0.5 shrink-0 text-[color:var(--primary)]"
                  aria-hidden="true"
                />
              )}
              <p className="text-sm leading-6 text-[color:var(--text-muted)]">{item}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
