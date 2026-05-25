import { webPageSchema } from "@/lib/schema";
import { Reveal } from "@/components/public/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { getPublicContent } from "@/lib/public-content";
import { getPublicSiteConfig, publicSiteConfigs } from "@/lib/public-site-config";
import { absoluteUrl, canonicalSiteForSharedContent, PRIMARY_SITE_SLUG, siteUrl, withCanonical } from "@/lib/seo";
import { getCurrentSite } from "@/lib/sites";
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, Code2, Compass, FileText, Github, Layers3, type LucideIcon, Target, Wrench } from "lucide-react";
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

  const isSharedWithPrimary = publicSiteConfigs[PRIMARY_SITE_SLUG].projects.some((item) => item.slug === project.slug);

  return withCanonical({
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      images: [project.coverImage]
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.summary,
      images: [project.coverImage]
    }
  }, `/projects/${project.slug}`, site.slug, { canonicalSiteSlug: canonicalSiteForSharedContent(site.slug, isSharedWithPrimary) });
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

  const liveUrl = project.liveUrl?.trim();
  const githubUrl = project.githubUrl?.trim();
  const showLiveUrl = Boolean(liveUrl && liveUrl !== "https://example.com" && liveUrl !== "https://example.com/");
  const showGithubUrl = Boolean(githubUrl && githubUrl !== "https://github.com/");
  const services = Array.from(new Set(project.services));
  const techStack = Array.from(new Set(project.techStack));

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

  const breadcrumbSchema = webPageSchema({
    name: `${project.title} | ${site.brandName}`,
    description: project.summary,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Projects", url: "/projects" },
      { name: project.title, url: `/projects/${project.slug}` }
    ],
    url: `/projects/${project.slug}`
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Section className="relative overflow-hidden pb-12 pt-10 lg:pb-16 lg:pt-16">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(136,82,224,0.22),transparent_30rem),radial-gradient(circle_at_86%_18%,rgba(34,197,94,0.10),transparent_24rem)]" />
        <Container>
          <Reveal>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 py-2 text-sm font-bold text-[color:var(--text-muted)] transition hover:border-[color:var(--primary)]/45 hover:text-[color:var(--text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
            >
              <ArrowLeft size={16} /> Back to projects
            </Link>
          </Reveal>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.92fr] lg:items-end">
            <Reveal>
              <Badge>{project.clientType} · {project.industry}</Badge>
              <h1 className="mt-5 max-w-5xl text-balance font-display text-[clamp(2.5rem,7vw,6.2rem)] font-black leading-[0.92] text-[color:var(--text-strong)]">
                {project.title}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[color:var(--text-muted)] md:text-lg">{project.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {showLiveUrl ? (
                  <Button asChild>
                    <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                      Open Live Site <ArrowUpRight size={17} />
                    </a>
                  </Button>
                ) : null}
                {showGithubUrl ? (
                  <Button asChild variant="secondary">
                    <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github size={17} /> View GitHub
                    </a>
                  </Button>
                ) : null}
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="relative overflow-hidden rounded-[30px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] shadow-[0_24px_80px_rgba(107,38,217,0.14)]">
                <div className="relative aspect-[16/11]">
                  <Image src={project.coverImage} alt={project.title} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(15,5,30,0.78))]" />
                </div>
                <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2">
                  {services.slice(0, 3).map((service) => (
                    <span key={service} className="rounded-full border border-white/10 bg-[color:var(--surface)]/82 px-3 py-1.5 text-xs font-black text-[color:var(--text-normal)] backdrop-blur">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section className="bg-[linear-gradient(180deg,var(--background-elevated),var(--background))]">
        <Container className="grid gap-5 md:grid-cols-3">
          {[
            { title: "Problem", body: project.problem, icon: Target },
            { title: "Solution", body: project.solution, icon: Wrench },
            { title: "Outcome", body: project.outcome, icon: CheckCircle2 }
          ].map(({ title, body, icon: Icon }, index) => (
            <Reveal key={title} delay={index * 0.05}>
              <article className="h-full rounded-[28px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6 shadow-[0_16px_48px_rgba(107,38,217,0.08)]">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[color:var(--primary)]/12 text-[color:var(--primary)]">
                  <Icon size={21} />
                </span>
                <h2 className="mt-6 text-balance font-display text-2xl font-black text-[color:var(--text-strong)]">{title}</h2>
                <p className="mt-4 text-sm leading-7 text-[color:var(--text-muted)]">{body}</p>
              </article>
            </Reveal>
          ))}
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <Reveal>
            <Badge className="mb-5">
              <Compass size={13} /> Build notes
            </Badge>
            <h2 className="text-balance font-display text-[clamp(2rem,4vw,4rem)] font-black leading-[0.98] text-[color:var(--text-strong)]">
              Features, stack, and the system shape behind the interface.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[color:var(--text-muted)]">
              Built as a maintainable web system with clear user flows, admin-ready data structures, and a path toward deeper automation.
            </p>
            <div className="mt-8 space-y-6">
              <TagGroup title="Services" icon={Layers3} items={services} />
              <TagGroup title="Stack" icon={Code2} items={techStack} />
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="grid gap-4 sm:grid-cols-2">
              {project.gallery.map((image, index) => (
                <div
                  key={`${project.slug}-gallery-${image}-${index}`}
                  className="group relative aspect-[16/10] overflow-hidden rounded-[24px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] shadow-[0_14px_44px_rgba(107,38,217,0.08)]"
                >
                  <Image src={image} alt={`${project.title} project screenshot ${index + 1}`} fill className="object-cover transition duration-500 group-hover:scale-[1.04]" sizes="(max-width: 768px) 100vw, 50vw" />
                  <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-[color:var(--surface)]/82 px-3 py-1 text-xs font-black text-[color:var(--text-normal)] backdrop-blur">
                    View {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section className="bg-[linear-gradient(180deg,var(--background-elevated),var(--background))]">
        <Container>
          <div className="relative overflow-hidden rounded-[30px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-7 shadow-[0_24px_80px_rgba(107,38,217,0.12)] md:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(136,82,224,0.20),transparent_22rem)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <Badge className="mb-5">
                  <FileText size={13} /> Next brief
                </Badge>
                <h2 className="text-balance font-display text-3xl font-black text-[color:var(--text-strong)] md:text-4xl">Need a system like this?</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--text-muted)]">
                  Share the business problem, the customer journey, and what needs to happen after someone gets in touch.
                </p>
              </div>
              <Button asChild className="w-full sm:w-auto">
                <Link href={`/start-project?project=${project.slug}`}>
                  {site.finalCta.primary} <ArrowRight size={17} />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

function TagGroup({ title, icon: Icon, items }: { title: string; icon: LucideIcon; items: string[] }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-black text-[color:var(--text-strong)]">
        <Icon size={16} className="text-[color:var(--primary)]" /> {title}
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span key={`${title}-${item}-${index}`} className="rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-3 py-1.5 text-xs font-bold text-[color:var(--text-muted)]">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
