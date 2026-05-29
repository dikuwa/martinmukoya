import { Reveal } from "@/components/public/motion";
import { ProjectsClient } from "@/components/public/projects-client";
import { SectionHeading } from "@/components/public/section-heading";
import { Container, Section } from "@/components/ui/container";
import { getPublicContent } from "@/lib/public-content";
import { getOverriddenPublicSiteConfig } from "@/lib/site-overrides";
import { getCurrentSite } from "@/lib/sites";
import { webPageSchema } from "@/lib/schema";
import { withCanonical } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const currentSite = await getCurrentSite();
  const site = await getOverriddenPublicSiteConfig(currentSite?.slug);

  return withCanonical({
    title: "Projects",
    description: site.pages.projects.metadataDescription,
    openGraph: {
      title: `Projects | ${site.brandName}`,
      description: site.pages.projects.metadataDescription
    },
    twitter: {
      card: "summary_large_image",
      title: `Projects | ${site.brandName}`,
      description: site.pages.projects.metadataDescription
    }
  }, "/projects", site.slug);
}

export default async function ProjectsPage() {
  const currentSite = await getCurrentSite();
  const site = await getOverriddenPublicSiteConfig(currentSite?.slug);
  const content = await getPublicContent(site, currentSite?.id);
  const page = site.pages.projects;

  const breadcrumbSchema = webPageSchema({
    name: "Projects | " + site.brandName,
    description: page.metadataDescription,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Projects", url: "/projects" }
    ],
    url: "/projects"
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Section className="pb-10">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Projects"
              title={page.title}
              description={page.description}
              align="center"
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
