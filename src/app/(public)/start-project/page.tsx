import { Reveal } from "@/components/public/motion";
import { StartProjectWizard } from "@/components/public/start-project-wizard";
import { Badge } from "@/components/ui/badge";
import { Container, Section } from "@/components/ui/container";
import { getPublicSiteConfig } from "@/lib/public-site-config";
import { getCurrentSite } from "@/lib/sites";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);

  return {
    title: site.pages.startProject.eyebrow,
    description: site.pages.startProject.metadataDescription
  };
}

export default async function StartProjectPage() {
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);
  const page = site.pages.startProject;

  return (
    <Section className="relative overflow-hidden bg-[color:var(--background-elevated)] pb-12 pt-12 lg:pb-16 lg:pt-16">
      <Container>
        <Reveal className="mx-auto max-w-5xl text-center">
          <Badge>{page.eyebrow}</Badge>
          <h1 className="mt-6 font-display text-[clamp(2.25rem,calc(1.7rem+3vw),4.25rem)] font-black leading-none text-[color:var(--text-strong)]">
            {page.title}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-[clamp(1rem,calc(0.95rem+0.5vw),1.2rem)] leading-8 text-[color:var(--text-muted)]">
            {page.description}
          </p>
        </Reveal>
        <Reveal className="mt-16 lg:mt-20" delay={0.08}>
          <StartProjectWizard site={site} />
        </Reveal>
      </Container>
    </Section>
  );
}
