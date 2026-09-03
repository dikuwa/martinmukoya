"use client";

import { Reveal } from "@/components/public/motion";
import { TrackedAnchor } from "@/components/public/tracked-anchor";
import { TrackedLink } from "@/components/public/tracked-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { PublicProject, ProjectGalleryImage, ProjectListItem } from "@/lib/public-content";
import { resolveProjectIcon } from "@/lib/project-icons";
import type { PublicSiteConfig } from "@/lib/public-site-config";
import { ArrowUpRight, Github, MessageCircle } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ProjectGallery } from "@/components/public/project-gallery";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function populated(value?: string | null) { return Boolean(value?.trim()); }

export function ProjectCaseStudy({ project, site }: { project: PublicProject; site: PublicSiteConfig }) {
  const path = `/projects/${project.slug}`;
  const liveUrl = project.liveUrl?.trim();
  const githubUrl = project.githubUrl?.trim();
  const showLive = Boolean(liveUrl && liveUrl !== "https://example.com" && liveUrl !== "https://example.com/");
  const showGithub = Boolean(githubUrl && githubUrl !== "https://github.com/");
  const facts = [
    ["Industry", project.industry, "industry"], ["Client type", project.clientType, "client"],
    ["Timeline", project.timeline, "timeline"], ["Role", project.role, "role"],
    ["Deliverables", project.deliverables?.join(", "), "deliverables"]
  ].filter(([, value]) => populated(value)) as Array<[string, string, string]>;
  const insights = [
    { title: "Problem", body: project.problem, iconKey: "problem" },
    { title: "Solution", body: project.solution, iconKey: "solution" },
    { title: "Outcome", body: project.outcome, iconKey: "outcome" }
  ].filter((item) => populated(item.body));
  const gallery: ProjectGalleryImage[] = project.galleryImages?.length
    ? [...project.galleryImages].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    : project.gallery.map((url, index) => ({ url, alt: `${project.title} project screenshot ${index + 1}`, sortOrder: index }));

  return (
    <article className="project-case-study overflow-hidden">
      <section className="relative pb-12 pt-12 sm:pt-16 lg:pb-16 lg:pt-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_32rem)]" />
        <Container className="relative grid items-center gap-10 lg:max-w-[1320px] lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
          <Reveal>
            <Badge>{project.eyebrow || "Featured project"}</Badge>
            <h1 className="mt-5 max-w-[14ch] font-display text-[clamp(2.55rem,5.3vw,5.25rem)] font-black leading-[0.96] tracking-[-0.055em] text-[color:var(--text-strong)]">{project.title}</h1>
            <p className="mt-6 max-w-[62ch] text-base leading-7 text-[color:var(--text-muted)] sm:text-lg sm:leading-8">{project.summary || project.description}</p>
            {(showLive || showGithub) && <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
              {showLive && <Button asChild size="lg"><TrackedAnchor siteSlug={site.slug} eventType="cta_click" eventPage={path} eventSource="project_live_site" href={liveUrl} target="_blank" rel="noopener noreferrer">Open Live Site <ArrowUpRight size={17} /></TrackedAnchor></Button>}
              {showGithub && <Button asChild size="lg" variant="secondary"><TrackedAnchor siteSlug={site.slug} eventType="cta_click" eventPage={path} eventSource="project_github" href={githubUrl} target="_blank" rel="noopener noreferrer"><Github size={17} /> View GitHub</TrackedAnchor></Button>}
            </div>}
          </Reveal>
          <Reveal delay={0.08} className="min-w-0">
            <ProjectGallery
              coverImage={project.coverImage}
              coverAlt={project.coverImageAlt || `${project.title} project preview`}
              gallery={gallery}
              projectTitle={project.title}
            />
          </Reveal>
        </Container>
      </section>

      {facts.length > 0 && <section aria-label="Project facts"><Container className="lg:max-w-[1320px]"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">{facts.map(([label, value, iconKey]) => { const Icon = resolveProjectIcon(iconKey, `${label} ${value}`); return <div key={label} className="border border-[color:var(--border-subtle)] rounded-[14px] bg-[color:var(--surface)] px-4 py-4 sm:px-5"><div className="flex items-start gap-3"><Icon className="mt-0.5 shrink-0 text-[color:var(--primary)]" size={18} aria-hidden="true" /><div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[color:var(--text-faint)]">{label}</p><p className="mt-1 break-words text-sm font-bold leading-5 text-[color:var(--text-strong)]">{value}</p></div></div></div>})}</div></Container></section>}

      <OptionalItems items={project.benefits} label="Project impact" className="pt-10 lg:pt-12" />

      <section className="py-14 md:py-18 lg:py-20"><Container className="lg:max-w-[1320px]"><div className="grid lg:grid-cols-3 gap-4">{insights.map((item, index) => { const Icon = resolveProjectIcon(item.iconKey, item.title); return <Reveal key={item.title} delay={index * 0.05}><div className="border border-[color:var(--border-subtle)] rounded-[14px] bg-[color:var(--surface)] p-6 sm:p-8 h-full"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-[color:var(--primary)]/12 text-[color:var(--primary)]"><Icon size={19} aria-hidden="true" /></span><h2 className="font-display text-2xl font-black text-[color:var(--text-strong)]">{item.title}</h2></div><div className="mt-5 whitespace-pre-line text-sm leading-7 text-[color:var(--text-muted)]">{item.body}</div></div></Reveal>})}</div></Container></section>

      {(project.techStack.length > 0 || gallery.length > 0) && <section className="border-y border-[color:var(--border-subtle)] bg-[color:var(--background-elevated)]/55 py-14 md:py-20"><Container className="grid gap-10 lg:max-w-[1320px] lg:grid-cols-[0.72fr_1.28fr] lg:gap-14"><Reveal><h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-black leading-tight text-[color:var(--text-strong)]">Features &amp; stack</h2><p className="mt-4 max-w-[55ch] text-sm leading-7 text-[color:var(--text-muted)]">{project.stackSummary || project.description}</p>{project.techStack.length > 0 && <div className="mt-6 flex flex-wrap gap-2">{Array.from(new Set(project.techStack)).map((tech) => <Badge key={tech}>{tech}</Badge>)}</div>}</Reveal>{gallery.length > 0 && <Reveal className={`grid gap-3 ${gallery.length > 1 ? "sm:grid-cols-2" : ""}`}>{gallery.map((image, index) => <figure key={`${image.url}-${index}`} className={`relative overflow-hidden rounded-[16px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] ${gallery.length === 3 && index === 0 ? "sm:row-span-2 sm:aspect-auto sm:min-h-full" : "aspect-[16/10]"}`}><Image src={image.url} alt={image.alt || `${project.title} project screenshot ${index + 1}`} fill className="object-cover object-top" sizes="(max-width: 1024px) 100vw, 36vw" />{image.caption && <figcaption className="sr-only">{image.caption}</figcaption>}</figure>)}</Reveal>}</Container></section>}

      <OptionalItems items={project.capabilities} label="What was built" heading="What was built" className="py-14 md:py-20" />

      {populated(project.caseStudyContent) && <section className="pb-16 md:pb-20"><Container><div className="mx-auto max-w-[760px]"><h2 className="font-display text-3xl font-black text-[color:var(--text-strong)]">Inside the build</h2><div className="case-study-prose mt-7"><ReactMarkdown remarkPlugins={[remarkGfm]}>{project.caseStudyContent!}</ReactMarkdown></div></div></Container></section>}

      <section className="pb-14 md:pb-20"><Container><div className="relative overflow-hidden rounded-[24px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-7 sm:p-10"><div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_70%)]" /><div className="relative flex flex-col items-center gap-7 text-center"><div><p className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--primary)]">{project.ctaEyebrow || site.finalCta.eyebrow}</p><h2 className="mt-3 max-w-[22ch] font-display text-[clamp(1.9rem,4vw,3.4rem)] font-black leading-tight text-[color:var(--text-strong)]">{project.ctaTitle || site.finalCta.title}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--text-muted)]">{project.ctaDescription || site.finalCta.description}</p></div><div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">{project.ctaPrimaryUrl ? <Button asChild size="lg"><TrackedAnchor siteSlug={site.slug} eventType="cta_click" eventPage={path} eventSource="project_footer_primary" href={project.ctaPrimaryUrl}>{project.ctaPrimaryLabel || site.finalCta.primary}</TrackedAnchor></Button> : <Button asChild size="lg"><TrackedLink siteSlug={site.slug} eventType="cta_click" eventPage={path} eventSource="project_footer_primary" href="/start-project">{project.ctaPrimaryLabel || site.finalCta.primary}</TrackedLink></Button>}<Button asChild size="lg" variant="secondary"><TrackedAnchor siteSlug={site.slug} eventType="whatsapp_click" eventPage={path} eventSource="project_footer_secondary" href={project.ctaSecondaryUrl || site.contact.whatsappHref} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> {project.ctaSecondaryLabel || site.finalCta.secondary}</TrackedAnchor></Button></div></div></div></Container></section>
    </article>
  );
}

function OptionalItems({ items, label, heading, className = "" }: { items?: ProjectListItem[]; label: string; heading?: string; className?: string }) {
  const sorted = items?.filter((item) => populated(item.title)).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) ?? [];
  
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  useEffect(() => {
    if (sorted.length === 0) return;
    if (cardRefs.current.length === 0) return;
    
    const validRefs = cardRefs.current.filter((ref): ref is HTMLDivElement => ref !== null);
    if (validRefs.length === 0) return;
    
    // Set initial state via gsap.set (not via class)
    gsap.set(validRefs, { opacity: 0, y: 30 });
    
    // Use ScrollTrigger.batch for batch animation
    const batch = ScrollTrigger.batch(validRefs, {
      start: "top 88%",
      once: true,
      onEnter: (elements) => {
        gsap.to(elements, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.035,
        });
      },
    });
    
    return () => {
      batch.forEach((st: ScrollTrigger) => st.kill());
    };
  }, [sorted]);
  
  if (!sorted.length) return null;
  
  return <section aria-label={label} className={className}><Container className="lg:max-w-[1320px]">{heading && <h2 className="mb-7 font-display text-3xl font-black text-[color:var(--text-strong)]">{heading}</h2>}<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{sorted.map((item, index) => { const Icon = resolveProjectIcon(item.iconKey, `${item.title} ${item.description || ""}`); return <div key={item.id || `${item.title}-${index}`} ref={(el) => { cardRefs.current[index] = el; gsap.set(el, { opacity: 0, y: 30 }); }} className="border border-[color:var(--border-subtle)] rounded-[14px] bg-[color:var(--surface)] p-5"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[color:var(--primary)]/12 text-[color:var(--primary)]"><Icon size={17} aria-hidden="true" /></span><div><h3 className="font-display text-sm font-black leading-5 text-[color:var(--text-strong)]">{item.title}</h3>{item.description && <p className="mt-2 text-xs leading-5 text-[color:var(--text-muted)]">{item.description}</p>}</div></div></div>})}</div></Container></section>;
}
