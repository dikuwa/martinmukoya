import { TrackedLink } from "@/components/public/tracked-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, Code2, Github, Layers3 } from "lucide-react";
import Image from "next/image";

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
  const githubUrl = getProjectExternalUrl(project.githubUrl, "github");
  const liveUrl = getProjectExternalUrl(project.liveUrl, "live");
  const services = Array.from(new Set(project.services || [])).slice(0, 2);
  const techStack = Array.from(new Set(project.techStack || [])).slice(0, 4);

  return (
    <article className="motion-card group flex h-full flex-col overflow-hidden rounded-[28px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] shadow-[0_18px_54px_rgba(107,38,217,0.08)] transition hover:-translate-y-1 hover:border-[color:var(--primary)]/35 hover:bg-[color:var(--surface-soft)] hover:shadow-[0_24px_70px_rgba(107,38,217,0.15)]">
      <TrackedLink
        siteSlug={siteSlug}
        eventType="project_card_clicked"
        eventPage={`/projects/${project.slug}`}
        eventSource="project_card_media"
        eventMetadata={{ contentId: project.id ?? project.slug, contentType: "Project" }}
        href={`/projects/${project.slug}`}
        className="block"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-[color:var(--surface-soft)]">
          <Image
            src={project.coverImage || "/assets/hero-images/webp/hero-image.webp"}
            alt={project.title}
            fill
            className="motion-media object-cover group-hover:scale-[1.035]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(15,5,30,0.74))]" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/10 bg-[color:var(--surface)]/82 px-3 py-1.5 text-xs font-black text-[color:var(--text-normal)] backdrop-blur">
            <Layers3 size={14} /> Case study
          </div>
        </div>
      </TrackedLink>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap gap-2">
          {services.map((service, index) => (
            <Badge key={`${project.slug}-${service}-${index}`}>{service}</Badge>
          ))}
        </div>
        <h3 className="text-balance mt-5 font-display text-2xl font-black text-[color:var(--text-strong)]">
          <TrackedLink
            siteSlug={siteSlug}
            eventType="project_card_clicked"
            eventPage={`/projects/${project.slug}`}
            eventSource="project_card_title"
            eventMetadata={{ contentId: project.id ?? project.slug, contentType: "Project" }}
            href={`/projects/${project.slug}`}
          >
            {project.title}
          </TrackedLink>
        </h3>
        <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-[color:var(--text-muted)]">{project.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-[color:var(--border-subtle)] pt-5">
          {techStack.map((tech, index) => (
            <span key={`${project.slug}-${tech}-${index}`} className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-3 py-1 text-[0.65rem] font-bold text-[color:var(--text-muted)]">
              <Code2 size={12} />
              {tech}
            </span>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap gap-3 pt-6">
          <Button asChild size="sm" variant="secondary">
            <TrackedLink
              siteSlug={siteSlug}
              eventType="read_case_study_clicked"
              eventPage={`/projects/${project.slug}`}
              eventSource="project_card_cta"
              eventMetadata={{ contentId: project.id ?? project.slug, contentType: "Project" }}
              href={`/projects/${project.slug}`}
            >
              Read Case Study <ArrowRight size={15} />
            </TrackedLink>
          </Button>
          {githubUrl ? (
            <Button asChild size="icon" variant="ghost">
              <a aria-label={`${project.title} GitHub`} href={githubUrl} target="_blank" rel="noopener noreferrer">
                <Github size={17} />
              </a>
            </Button>
          ) : null}
          {liveUrl ? (
            <Button asChild size="icon" variant="ghost">
              <a aria-label={`${project.title} live site`} href={liveUrl} target="_blank" rel="noopener noreferrer">
                <ArrowUpRight size={17} />
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function FlexTechProjectCard({ project, siteSlug }: { project: Project; siteSlug?: string }) {
  const githubUrl = getProjectExternalUrl(project.githubUrl, "github");
  const liveUrl = getProjectExternalUrl(project.liveUrl, "live");
  const services = Array.from(new Set(project.services || [])).slice(0, 2);
  const techStack = Array.from(new Set(project.techStack || [])).slice(0, 4);

  return (
    <article className="motion-card group flex h-full flex-col overflow-hidden rounded-[28px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] shadow-[0_18px_54px_rgba(107,38,217,0.08)] transition hover:-translate-y-1 hover:border-[color:var(--primary)]/35 hover:shadow-[0_24px_70px_rgba(107,38,217,0.16)]">
      <TrackedLink
        siteSlug={siteSlug}
        eventType="project_card_clicked"
        eventPage={`/projects/${project.slug}`}
        eventSource="project_card_media"
        eventMetadata={{ contentId: project.id ?? project.slug, contentType: "Project" }}
        href={`/projects/${project.slug}`}
        className="block"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-[color:var(--surface-soft)]">
          <Image
            src={project.coverImage || "/assets/hero-images/webp/hero-image.webp"}
            alt={project.title}
            fill
            className="motion-media object-cover group-hover:scale-[1.045]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_32%,rgba(15,5,30,0.70))]" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/10 bg-[color:var(--surface)]/82 px-3 py-1.5 text-xs font-black text-[color:var(--text-normal)] backdrop-blur">
            <BriefcaseBusiness size={14} /> Agency build
          </div>
        </div>
      </TrackedLink>
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
        <h3 className="text-balance mt-4 font-display text-2xl font-black text-[color:var(--text-strong)]">
          <TrackedLink
            siteSlug={siteSlug}
            eventType="project_card_clicked"
            eventPage={`/projects/${project.slug}`}
            eventSource="project_card_title"
            eventMetadata={{ contentId: project.id ?? project.slug, contentType: "Project" }}
            href={`/projects/${project.slug}`}
          >
            {project.title}
          </TrackedLink>
        </h3>
        <p className="mt-2 min-h-[4rem] text-sm leading-6 text-[color:var(--text-muted)]">{project.summary}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {techStack.map((tech, index) => (
            <span
              key={`${project.slug}-tech-${index}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--surface-soft)] px-2.5 py-1 text-[0.6rem] font-medium text-[color:var(--text-faint)]"
            >
              <Code2 size={11} />
              {tech}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-2 pt-5">
          <Button asChild size="sm" variant="secondary" className="rounded-[14px] px-4 py-2 text-xs">
            <TrackedLink
              siteSlug={siteSlug}
              eventType="read_case_study_clicked"
              eventPage={`/projects/${project.slug}`}
              eventSource="project_card_cta"
              eventMetadata={{ contentId: project.id ?? project.slug, contentType: "Project" }}
              href={`/projects/${project.slug}`}
            >
              Read Case Study <ArrowRight size={14} />
            </TrackedLink>
          </Button>
          <div className="ml-auto flex items-center gap-1">
            {githubUrl ? (
              <a
                aria-label={`${project.title} GitHub`}
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-8 w-8 place-items-center rounded-full text-[color:var(--text-faint)] transition hover:bg-[color:var(--primary)]/10 hover:text-[color:var(--primary)]"
              >
                <Github size={15} />
              </a>
            ) : null}
            {liveUrl ? (
              <a
                aria-label={`${project.title} live site`}
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-8 w-8 place-items-center rounded-full text-[color:var(--text-faint)] transition hover:bg-[color:var(--primary)]/10 hover:text-[color:var(--primary)]"
              >
                <ArrowUpRight size={15} />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function getProjectExternalUrl(value: string | null | undefined, kind: "github" | "live") {
  const url = value?.trim();
  if (!url) return null;
  if (kind === "github" && url === "https://github.com/") return null;
  if (kind === "live" && (url === "https://example.com" || url === "https://example.com/")) return null;
  return url;
}
