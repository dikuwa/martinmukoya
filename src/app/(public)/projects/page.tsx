import { Reveal } from "@/components/public/motion";
import { ProjectsClient } from "@/components/public/projects-client";
import { SectionHeading } from "@/components/public/section-heading";
import { Container, Section } from "@/components/ui/container";
import { getPublicContent } from "@/lib/public-content";
import { getPublicSiteConfig } from "@/lib/public-site-config";
import { getCurrentSite } from "@/lib/sites";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);

  return {
    title: "Projects",
    description: site.pages.projects.metadataDescription
  };
}

export default async function ProjectsPage() {
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);
  const content = await getPublicContent(site, currentSite?.id);
  const page = site.pages.projects;

  return (
    <>
      <Section className="pb-10">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Projects"
              title={page.title}
              description={page.description}
            />
          </Reveal>
        </Container>
      </Section>
      <Section className="pt-0 bg-gradient-to-b from-[color:var(--background-elevated)]/90 to-[color:var(--background)]/50">
        <Container>
          <ProjectsClient projects={content.projects} siteSlug={site.slug} />
        </Container>
      </Section>
    </>
  );
}
