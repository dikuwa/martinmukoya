import { Reveal } from "@/components/public/motion";
import { SectionHeading } from "@/components/public/section-heading";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { getPublicSiteConfig } from "@/lib/public-site-config";
import { getCurrentSite } from "@/lib/sites";
import { cn } from "@/lib/utils";
import { ArrowRight, Bot, CalendarCheck, CheckCircle2, MonitorCog, ShoppingBag, XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);

  return {
    title: "Services",
    description: site.pages.services.metadataDescription
  };
}

export default async function ServicesPage() {
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);
  const page = site.pages.services;
  const isFlexTech = site.slug === "flextech-media";

  return (
    <>
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

        {isFlexTech ? (
          <Container className="grid gap-6">
            {site.services.map((service, index) => (
              <Reveal key={service.id} delay={index * 0.05}>
                <article className="mx-auto max-w-4xl rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]/80 p-8 shadow-[0_3px_10px_rgba(0,0,0,0.06)] transition duration-200 lg:p-12">
                  {/* Top: icon + title + description */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <ServiceIcon id={service.id} />
                    </div>
                    <div>
                      <h2 className="text-balance text-3xl font-display font-black text-[color:var(--text-strong)]">{service.title}</h2>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--text-muted)]">{service.summary}</p>
                    </div>
                  </div>

                  {/* Middle: three clean content blocks */}
                  <div className="mt-8 grid gap-3 lg:grid-cols-3">
                    <InfoBlock
                      title="What it helps"
                      description={service.who}
                      variant="help"
                    />
                    <InfoBlock
                      title="Common friction"
                      items={service.problems}
                      variant="friction"
                    />
                    <InfoBlock
                      title="Business results"
                      items={service.outcomes}
                      variant="result"
                    />
                  </div>

                  {/* Bottom: CTA */}
                  <div className="mt-8 flex justify-center">
                    <Button asChild size="md" variant="secondary" className="rounded-full px-6 py-3">
                      <Link href="/start-project">{page.ctaLabel} <ArrowRight size={16} /></Link>
                    </Button>
                  </div>
                </article>
              </Reveal>
            ))}
          </Container>
        ) : (
          <Container className="grid gap-6">
            {site.services.map((service, index) => (
              <Reveal key={service.id} delay={index * 0.05}>
                <article className="mx-auto max-w-4xl overflow-hidden rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]/88 p-8 shadow-[0_3px_10px_rgba(0,0,0,0.06)] transition duration-200 lg:p-10">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="mb-2">
                      <ServiceIcon id={service.id} />
                    </div>
                    <div>
                      <h2 className="text-balance text-3xl font-display font-black text-[color:var(--text-strong)]">{service.title}</h2>
                      <p className="mt-3 mx-auto max-w-3xl text-sm leading-7 text-[color:var(--text-muted)]">{service.summary}</p>
                    </div>
                  </div>

                  <div className="mt-10 grid gap-4 lg:grid-cols-3">
                    <InfoBlock title="Who it helps" description={service.who} />
                    <InfoBlock title="Common friction" items={service.problems} variant="friction" />
                    <InfoBlock title="Business results" items={service.outcomes} variant="result" />
                  </div>

                  <div className="mt-8 flex justify-center">
                    <Button asChild size="md" variant="secondary" className="rounded-full px-6 py-3">
                      <Link href="/start-project">{page.ctaLabel} <ArrowRight size={16} /></Link>
                    </Button>
                  </div>
                </article>
              </Reveal>
            ))}
          </Container>
        )}
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
              <span className="mt-1 grid h-9 w-9 place-items-center rounded-2xl bg-[color:var(--primary)]/10 text-[color:var(--primary)] shrink-0">
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
