import { Reveal } from "@/components/public/motion";
import { ProjectsClient } from "@/components/public/projects-client";
import { Badge } from "@/components/ui/badge";
import { Container, Section } from "@/components/ui/container";
import { getPublicContent } from "@/lib/public-content";
import { getPublicSiteConfig } from "@/lib/public-site-config";
import { getCurrentSite } from "@/lib/sites";
import { webPageSchema } from "@/lib/schema";
import { withCanonical } from "@/lib/seo";
import { ArrowDownRight, BriefcaseBusiness, Layers3, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);

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
  const site = getPublicSiteConfig(currentSite?.slug);
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
      <Section className="relative overflow-hidden pb-10 pt-12 lg:pb-14 lg:pt-16">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(136,82,224,0.20),transparent_28rem),radial-gradient(circle_at_84%_20%,rgba(34,197,94,0.10),transparent_24rem)]" />
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.78fr] lg:items-end">
            <Reveal>
              <Badge className="mb-5">
                <Layers3 size={13} /> Projects
              </Badge>
              <h1 className="max-w-5xl text-balance font-display text-[clamp(2.5rem,6vw,5.8rem)] font-black leading-[0.94] text-[color:var(--text-strong)]">
                {page.title}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[color:var(--text-muted)] md:text-lg">
                {page.description}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="rounded-[30px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6 shadow-[0_20px_70px_rgba(107,38,217,0.12)]">
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[color:var(--primary)]/12 text-[color:var(--primary)]">
                    <Sparkles size={21} />
                  </span>
                  <div>
                    <p className="text-sm font-black text-[color:var(--text-strong)]">Built around business pressure</p>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
                      Each case study connects a visible interface to the quieter systems behind forms, follow-up, content, and operations.
                    </p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-4">
                    <BriefcaseBusiness size={18} className="text-[color:var(--primary)]" />
                    <p className="mt-3 text-2xl font-black text-[color:var(--text-strong)]">{content.projects.length}</p>
                    <p className="text-xs font-bold text-[color:var(--text-muted)]">case studies</p>
                  </div>
                  <a
                    href="#project-list"
                    className="group rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-4 text-sm font-black text-[color:var(--text-normal)] transition hover:border-[color:var(--primary)]/45 hover:text-[color:var(--text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
                  >
                    Browse work
                    <ArrowDownRight className="mt-3 text-[color:var(--primary)] transition group-hover:translate-x-0.5 group-hover:translate-y-0.5" size={20} />
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
      <Section id="project-list" className="pt-0 bg-[linear-gradient(180deg,var(--background-elevated),var(--background))]">
        <Container>
          <ProjectsClient projects={content.projects} siteSlug={site.slug} />
        </Container>
      </Section>
    </>
  );
}
