"use client";

import { Reveal } from "@/components/public/motion";
import { Badge } from "@/components/ui/badge";
import type { PublicBlogPost } from "@/lib/public-content";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

const flextechTagMap: Record<string, string> = {
  Business: "Websites",
  Technology: "AI Automation",
  Process: "Business Systems",
  Design: "Websites",
  Strategy: "Business Systems",
  Development: "Booking"
};

function getDisplayTag(category: string, isFlexTech: boolean): string {
  if (!isFlexTech) return category;
  return flextechTagMap[category] ?? category;
}

function TagButton({
  label,
  isActive,
  onClick
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[0.68rem] font-bold leading-none transition",
        isActive
          ? "border-[color:var(--primary)] bg-[color:var(--primary)]/15 text-[color:var(--text-strong)]"
          : "border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] text-[color:var(--text-muted)] hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)]/10 hover:text-[color:var(--text-strong)]"
      )}
    >
      {label}
    </button>
  );
}

function BlogCard({ post, isFlexTech }: { post: PublicBlogPost; isFlexTech: boolean }) {
  if (isFlexTech) {
    return (
      <article className="group h-full overflow-hidden rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] shadow-[0_3px_10px_rgba(0,0,0,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--accent)]">
        <Link href={`/blog/${post.slug}`} className="block">
          <div className="relative aspect-[16/10] overflow-hidden bg-[color:var(--surface-soft)]">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover opacity-85 transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        </Link>
        <div className="p-5">
          <Badge>{getDisplayTag(post.category, true)}</Badge>
          <h2 className="mt-5 font-display text-2xl font-black text-[color:var(--text-strong)]">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">{post.excerpt}</p>
          <Link
            href={`/blog/${post.slug}`}
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[color:var(--accent)]"
          >
            Read article <ArrowRight size={16} />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group h-full overflow-hidden rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] shadow-[0_3px_10px_rgba(0,0,0,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--accent)]">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-[color:var(--surface-soft)]">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover opacity-85 transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </Link>
      <div className="p-5">
        <Badge>{post.category}</Badge>
        <h2 className="mt-5 font-display text-2xl font-black text-[color:var(--text-strong)]">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">{post.excerpt}</p>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[color:var(--accent)]"
        >
          Read article <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

export function BlogClient({
  posts,
  siteSlug
}: {
  posts: PublicBlogPost[];
  siteSlug?: string;
}) {
  const isFlexTech = siteSlug === "flextech-media";

  const rawCategories = useMemo(
    () => ["All", ...Array.from(new Set(posts.map((post) => post.category)))],
    [posts]
  );

  const displayCategories = useMemo(() => {
    if (!isFlexTech) return rawCategories;
    return ["All", ...Array.from(new Set(rawCategories.filter((c) => c !== "All").map((c) => getDisplayTag(c, true))))];
  }, [rawCategories, isFlexTech]);

  const [activeCategory, setActiveCategory] = useState("All");

  const displayedPosts = useMemo(
    () =>
      activeCategory === "All"
        ? posts
        : posts.filter((post) => getDisplayTag(post.category, isFlexTech) === activeCategory),
    [activeCategory, posts, isFlexTech]
  );

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {displayCategories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <TagButton
              key={category}
              label={category}
              isActive={isActive}
              onClick={() => setActiveCategory(category)}
            />
          );
        })}
      </div>
      <div className="grid gap-5 md:grid-cols-3 mt-6">
        {displayedPosts.map((post, index) => (
          <Reveal key={post.slug} delay={isFlexTech ? 0 : index * 0.05}>
            <BlogCard post={post} isFlexTech={isFlexTech} />
          </Reveal>
        ))}
      </div>
    </>
  );
}
