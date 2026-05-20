import { Reveal } from "@/components/public/motion";
import { TrackedLink } from "@/components/public/tracked-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { TrackedAnchor } from "@/components/public/tracked-anchor";
import type { PublicSiteConfig } from "@/lib/public-site-config";

export function FinalCTA({ site }: { site: PublicSiteConfig }) {
  const isFlexTech = site.slug === "flextech-media";

  if (isFlexTech) {
    return (
      <Section className="relative overflow-hidden bg-[color:var(--background-elevated)] py-14 lg:py-20">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-[color:var(--primary)]/8 blur-[120px]" />
        </div>
        <Container>
          <Reveal scale={0.98} distance={20}>
            <div className="motion-card relative mx-auto max-w-4xl rounded-[32px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]/70 p-8 shadow-[0_8px_30px_rgba(107,38,217,0.08)] backdrop-blur-sm sm:p-12 lg:p-16">
              <div className="mx-auto max-w-2xl text-center">
                <Badge>{site.finalCta.eyebrow}</Badge>
                <h2 className="mt-4 font-display text-[clamp(2rem,calc(1.45rem+2.5vw),4rem)] font-black leading-tight text-[color:var(--text-strong)]">
                  {site.finalCta.title}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)]">
                  {site.finalCta.description}
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button asChild size="lg" className="motion-sheen">
                    <TrackedLink siteSlug={site.slug} eventType="cta_click" eventPage="global" eventSource="final_cta_start_project" href="/start-project">{site.finalCta.primary}</TrackedLink>
                  </Button>
                  <Button asChild size="lg" variant="secondary">
                    <TrackedAnchor siteSlug={site.slug} eventType="whatsapp_click" eventPage="global" eventSource="final_cta_whatsapp" href={site.contact.whatsappHref} target="_blank" rel="noreferrer">{site.finalCta.secondary}</TrackedAnchor>
                  </Button>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-[color:var(--text-faint)]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-[color:var(--primary)]" />
                    Built for long-term usability
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-[color:var(--primary)]" />
                    Designed around real workflows
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-[color:var(--primary)]" />
                    Clearer follow-up systems
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="py-14 bg-[color:var(--background-elevated)]">
      <Container>
        <Reveal scale={0.98} distance={20}>
          <div className="mx-auto max-w-3xl text-center">
            <Badge>{site.finalCta.eyebrow}</Badge>
            <h2 className="mt-4 font-display text-[clamp(2rem,calc(1.45rem+2.5vw),4rem)] font-black leading-tight text-[color:var(--text-strong)]">
              {site.finalCta.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)]">
              {site.finalCta.description}
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="motion-sheen">
                <TrackedLink siteSlug={site.slug} eventType="cta_click" eventPage="global" eventSource="final_cta_start_project" href="/start-project">{site.finalCta.primary}</TrackedLink>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <TrackedAnchor siteSlug={site.slug} eventType="whatsapp_click" eventPage="global" eventSource="final_cta_whatsapp" href={site.contact.whatsappHref} target="_blank" rel="noreferrer">{site.finalCta.secondary}</TrackedAnchor>
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

export default FinalCTA;
