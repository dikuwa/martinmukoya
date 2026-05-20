import { TrackedLink } from "@/components/public/tracked-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Project = {
  id?: string;
  title: string;
  slug: string;
  summary?: string;
  coverImage?: string | null;
  services?: string[];
  techStack?: string[];
  githubUrl?: string | null;
  liveUrl?: string | null;
};

export function ProjectCard({ project, siteSlug }: { project: Project; siteSlug?: string }) {
  const githubUrl = project.githubUrl || "https://github.com/";
  const liveUrl = project.liveUrl || `/projects/${project.slug}`;
  const services = Array.from(new Set(project.services || [])).slice(0, 2);
  const techStack = Array.from(new Set(project.techStack || [])).slice(0, 4);

  return (
    <article className="motion-card group flex h-full flex-col overflow-hidden rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] shadow-[0_3px_10px_rgba(0,0,0,0.06)] hover:border-[color:var(--border-subtle)] hover:bg-[color:var(--surface-soft)] hover:shadow-[0_14px_36px_rgba(107,38,217,0.10)]">
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-[color:var(--surface-soft)]">
          <Image
            src={project.coverImage || "/assets/hero-images/webp/hero-image.webp"}
            alt={project.title}
            fill
            className="motion-media object-cover group-hover:scale-[1.035]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          {services.map((service, index) => (
            <Badge key={`${project.slug}-${service}-${index}`}>{service}</Badge>
          ))}
        </div>
        <h3 className="mt-5 font-display text-2xl font-black text-[color:var(--text-strong)]">
          <Link href={`/projects/${project.slug}`}>{project.title}</Link>
        </h3>
        <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-[color:var(--text-muted)]">{project.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {techStack.map((tech, index) => (
            <span key={`${project.slug}-${tech}-${index}`} className="rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-3 py-1 text-[0.65rem] font-bold text-[color:var(--text-muted)]">
              {tech}
            </span>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap gap-3 pt-6">
          <Button asChild size="sm" variant="secondary">
            <TrackedLink
              siteSlug={siteSlug}
              eventType="view_content"
              eventPage={`/projects/${project.slug}`}
              eventSource="project_card_cta"
              eventMetadata={{ contentId: project.id ?? project.slug, contentType: "Project" }}
              href={`/projects/${project.slug}`}
            >
              Read Case Study
            </TrackedLink>
          </Button>
          <Button asChild size="icon" variant="ghost">
            <a aria-label={`${project.title} GitHub`} href={githubUrl} target="_blank" rel="noreferrer">
              <Github size={17} />
            </a>
          </Button>
          <Button asChild size="icon" variant="ghost">
            <a aria-label={`${project.title} live site`} href={liveUrl} target="_blank" rel="noreferrer">
              <ArrowUpRight size={17} />
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}

export function FlexTechProjectCard({ project, siteSlug }: { project: Project; siteSlug?: string }) {
  const githubUrl = project.githubUrl || "https://github.com/";
  const liveUrl = project.liveUrl || `/projects/${project.slug}`;
  const services = Array.from(new Set(project.services || [])).slice(0, 2);
  const techStack = Array.from(new Set(project.techStack || [])).slice(0, 4);

  return (
    <article className="motion-card group flex h-full flex-col overflow-hidden rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] shadow-[0_3px_10px_rgba(0,0,0,0.06)] hover:border-[color:var(--primary)]/30 hover:shadow-[0_16px_46px_rgba(107,38,217,0.14)]">
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden bg-[color:var(--surface-soft)]">
          <Image
            src={project.coverImage || "/assets/hero-images/webp/hero-image.webp"}
            alt={project.title}
            fill
            className="motion-media object-cover group-hover:scale-[1.045]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--surface)]/20 to-transparent" />
        </div>
      </Link>
      <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
        <div className="flex flex-wrap gap-1.5">
          {services.map((service, index) => (
            <span
              key={`${project.slug}-svc-${index}`}
              className="rounded-full bg-[color:var(--primary)]/8 px-2.5 py-0.5 text-[0.65rem] font-semibold text-[color:var(--primary)]"
            >
              {service}
            </span>
          ))}
        </div>
        <h3 className="mt-4 font-display text-2xl font-black text-[color:var(--text-strong)]">
          <Link href={`/projects/${project.slug}`}>{project.title}</Link>
        </h3>
        <p className="mt-2 min-h-[4rem] text-sm leading-6 text-[color:var(--text-muted)]">{project.summary}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {techStack.map((tech, index) => (
            <span
              key={`${project.slug}-tech-${index}`}
              className="rounded-full bg-[color:var(--surface-soft)] px-2 py-0.5 text-[0.6rem] font-medium text-[color:var(--text-faint)]"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-2 pt-5">
          <Button asChild size="sm" variant="secondary" className="rounded-[14px] px-4 py-2 text-xs">
            <TrackedLink
              siteSlug={siteSlug}
              eventType="view_content"
              eventPage={`/projects/${project.slug}`}
              eventSource="project_card_cta"
              eventMetadata={{ contentId: project.id ?? project.slug, contentType: "Project" }}
              href={`/projects/${project.slug}`}
            >
              Read Case Study
            </TrackedLink>
          </Button>
          <div className="ml-auto flex items-center gap-1">
            <a
              aria-label={`${project.title} GitHub`}
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="grid h-8 w-8 place-items-center rounded-full text-[color:var(--text-faint)] transition hover:bg-[color:var(--primary)]/10 hover:text-[color:var(--primary)]"
            >
              <Github size={15} />
            </a>
            <a
              aria-label={`${project.title} live site`}
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="grid h-8 w-8 place-items-center rounded-full text-[color:var(--text-faint)] transition hover:bg-[color:var(--primary)]/10 hover:text-[color:var(--primary)]"
            >
              <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
