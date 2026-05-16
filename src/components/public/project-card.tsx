import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { projects } from "@/lib/site-data";
import { ArrowUpRight, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Project = (typeof projects)[number];

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] shadow-[0_3px_10px_rgba(0,0,0,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(198,97,63,0.35)]">
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-[color:var(--surface-soft)]">
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          {project.services.slice(0, 2).map((service) => (
            <Badge key={service}>{service}</Badge>
          ))}
        </div>
        <h3 className="mt-5 font-display text-2xl font-black text-[color:var(--text-strong)]">
          <Link href={`/projects/${project.slug}`}>{project.title}</Link>
        </h3>
        <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-[color:var(--text-muted)]">{project.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.techStack.slice(0, 4).map((tech) => (
            <span key={tech} className="rounded-full bg-white/[0.04] px-3 py-1 text-xs font-semibold text-[color:var(--text-faint)]">
              {tech}
            </span>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap gap-3 pt-6">
          <Button asChild size="sm" variant="secondary">
            <Link href={`/projects/${project.slug}`}>Read Case Study</Link>
          </Button>
          <Button asChild size="icon" variant="ghost">
            <a aria-label={`${project.title} GitHub`} href={project.githubUrl} target="_blank" rel="noreferrer">
              <Github size={17} />
            </a>
          </Button>
          <Button asChild size="icon" variant="ghost">
            <a aria-label={`${project.title} live site`} href={project.liveUrl} target="_blank" rel="noreferrer">
              <ArrowUpRight size={17} />
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
