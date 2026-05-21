import { Reveal } from "@/components/public/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { getPublicContent } from "@/lib/public-content";
import { getPublicSiteConfig, publicSiteConfigs } from "@/lib/public-site-config";
import { absoluteUrl, siteUrl } from "@/lib/seo";
import { getCurrentSite } from "@/lib/sites";
import { ArrowUpRight, Github } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.values(publicSiteConfigs).flatMap((site) => site.projects.map((project) => ({ slug: project.slug })));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);
  const content = await getPublicContent(site, currentSite?.id);
  const project = content.projects.find((item) => item.slug === slug);

  if (!project) {
    return { title: "Project not found" };
  }

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.summary,
      url: `/projects/${project.slug}`,
      images: [project.coverImage]
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.summary,
      images: [project.coverImage]
    }
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);
  const content = await getPublicContent(site, currentSite?.id);
  const project = content.projects.find((item) => item.slug === slug);

  if (!project) {
    notFound();
  }
  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    image: absoluteUrl(project.coverImage),
    url: absoluteUrl(`/projects/${project.slug}`),
    creator: { "@type": site.slug === "flextech-media" ? "Organization" : "Person", name: site.brandName, url: siteUrl },
    about: project.services,
    keywords: project.techStack.join(", ")
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Section className="pb-12">
        <Container>
          <Reveal>
            <div className="max-w-4xl">
              <Badge>{project.clientType} · {project.industry}</Badge>
              <h1 className="text-balance mt-5 font-display text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.96] text-[color:var(--text-strong)]">
                {project.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[color:var(--text-muted)]">{project.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                  <a href={project.liveUrl} target="_blank" rel="noreferrer">
                    Open Live Site <ArrowUpRight size={17} />
                  </a>
                </Button>
                <Button asChild variant="secondary">
                  <a href={project.githubUrl} target="_blank" rel="noreferrer">
                    <Github size={17} /> View GitHub
                  </a>
                </Button>
              </div>
            </div>
          </Reveal>
          <Reveal className="relative mt-12 aspect-[16/9] overflow-hidden rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]">
            <Image src={project.coverImage} alt={project.title} fill priority className="object-cover" sizes="100vw" />
          </Reveal>
        </Container>
      </Section>

      <Section className="bg-gradient-to-b from-[color:var(--background-elevated)]/95 to-[color:var(--background)]/50">
        <Container className="grid gap-5 md:grid-cols-3">
          {[
            ["Problem", project.problem],
            ["Solution", project.solution],
            ["Outcome", project.outcome]
          ].map(([title, body], index) => (
            <Reveal key={title} delay={index * 0.05}>
              <article className="h-full rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6">
                <h2 className="text-balance font-display text-2xl font-black text-[color:var(--text-strong)]">{title}</h2>
                <p className="mt-4 text-sm leading-6 text-[color:var(--text-muted)]">{body}</p>
              </article>
            </Reveal>
          ))}
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <h2 className="text-balance font-display text-4xl font-black text-[color:var(--text-strong)]">Features and stack</h2>
            <p className="mt-4 text-sm leading-6 text-[color:var(--text-muted)]">
              Built as a maintainable web system with clear user flows, admin-ready data structures, and a path toward deeper automation.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {Array.from(new Set(project.techStack)).map((tech, index) => (
                <Badge key={`${project.slug}-detail-tech-${tech}-${index}`}>{tech}</Badge>
              ))}
            </div>
          </Reveal>
          <Reveal className="grid gap-4 sm:grid-cols-2">
            {project.gallery.map((image, index) => (
              <div key={`${project.slug}-gallery-${image}-${index}`} className="relative aspect-[16/10] overflow-hidden rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)]">
                <Image src={image} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            ))}
          </Reveal>
        </Container>
      </Section>

      <Section className="bg-gradient-to-b from-[color:var(--background-elevated)]/95 to-[color:var(--background)]/50">
        <Container>
          <div className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6 md:p-8">
            <h2 className="text-balance font-display text-3xl font-black text-[color:var(--text-strong)]">Need a system like this?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)]">
              Share the business problem, the customer journey, and what needs to happen after someone gets in touch.
            </p>
            <Button asChild className="mt-6">
              <Link href="/start-project">{site.finalCta.primary}</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
