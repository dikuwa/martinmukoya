"use client";

import { Reveal } from "@/components/public/motion";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type BlogPost = (typeof import("@/lib/site-data").blogPosts)[number];

export function BlogClient({ posts }: { posts: BlogPost[] }) {
  const categories = ["All", ...Array.from(new Set(posts.map((post) => post.category)))];
  const [activeCategory, setActiveCategory] = useState("All");
  const displayedPosts = useMemo(
    () => (activeCategory === "All" ? posts : posts.filter((post) => post.category === activeCategory)),
    [activeCategory, posts]
  );

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold transition ${
                isActive
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)]/15 text-[color:var(--text-strong)]"
                  : "border-[color:var(--border-subtle)] bg-white/[0.04] text-[color:var(--text-muted)] hover:border-[color:var(--accent)] hover:bg-[color:var(--accent)]/10 hover:text-[color:var(--text-strong)]"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
      <div className="grid gap-5 md:grid-cols-3 mt-6">
        {displayedPosts.map((post, index) => (
          <Reveal key={post.slug} delay={index * 0.05}>
            <article className="group h-full overflow-hidden rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] shadow-[0_3px_10px_rgba(0,0,0,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--accent)]">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative aspect-[16/10] overflow-hidden bg-[color:var(--surface-soft)]">
                  <Image src={post.coverImage} alt={post.title} fill className="object-cover opacity-85 transition duration-500 group-hover:scale-[1.03]" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
              </Link>
              <div className="p-5">
                <Badge>{post.category}</Badge>
                <h2 className="mt-5 font-display text-2xl font-black text-[color:var(--text-strong)]">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">{post.excerpt}</p>
                <Link href={`/blog/${post.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[color:var(--accent)]">
                  Read article <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </>
  );
}
