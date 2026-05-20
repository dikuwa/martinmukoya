import { Reveal } from "@/components/public/motion";
import { SectionHeading } from "@/components/public/section-heading";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { getPublicSiteConfig } from "@/lib/public-site-config";
import { getCurrentSite } from "@/lib/sites";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);

  return {
    title: "About",
    description: site.pages.about.metadataDescription
  };
}

export default async function AboutPage() {
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);
  const page = site.pages.about;

  return (
    <>
      <Section className="relative pb-12 overflow-hidden">
        <Container className="relative grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <SectionHeading
              eyebrow={page.eyebrow}
              title={page.title}
              description={page.description}
            />
            <Button asChild className="mt-7">
              <Link href="/contact">{page.ctaLabel}</Link>
            </Button>
          </Reveal>
          <Reveal className="relative mx-auto aspect-[4/5] w-full max-w-[460px] overflow-hidden rounded-[22px]">
            <Image
              src={site.home.aboutImage}
              alt={site.home.aboutAlt}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 460px"
            />
          </Reveal>
        </Container>
      </Section>
      <Section className="bg-gradient-to-b from-[color:var(--background-elevated)]/95 to-[color:var(--background)]/50">
        <Container className="grid gap-5 md:grid-cols-3">
          {page.cards.map((card, index) => (
            <Reveal key={card.title} delay={index * 0.05}>
              <article className="h-full rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6">
                <h2 className="font-display text-2xl font-black text-[color:var(--text-strong)]">{card.title}</h2>
                <p className="mt-4 text-sm leading-6 text-[color:var(--text-muted)]">{card.description}</p>
              </article>
            </Reveal>
          ))}
        </Container>
      </Section>
      <Section>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Stack"
              title={page.stackTitle}
              description={page.stackDescription}
            />
          </Reveal>
          <div className="mt-8 flex flex-wrap gap-2">
            {site.home.techStack.map((tech, index) => (
              <span key={`${site.slug}-about-tech-${tech}-${index}`} className="rounded-full border border-[color:var(--border-subtle)] bg-white/[0.04] px-4 py-2 text-[0.65rem] font-bold text-[color:var(--text-muted)]">
                {tech}
              </span>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
