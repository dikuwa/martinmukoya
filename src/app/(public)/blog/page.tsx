import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/public/motion";
import { SectionHeading } from "@/components/public/section-heading";
import { Badge } from "@/components/ui/badge";
import { Container, Section } from "@/components/ui/container";
import { blogPosts } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Blog",
  description: "Practical notes from Martin Mukoya on websites, booking systems, automation, and business technology."
};

export default function BlogPage() {
  const categories = ["All", ...Array.from(new Set(blogPosts.map((post) => post.category)))];

  return (
    <>
      <Section className="pb-10">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Blog"
              title="Notes on practical business technology."
              description="Plain-English ideas for business owners, recruiters, and builders who care about useful digital systems."
            />
          </Reveal>
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <Badge
                key={category}
                className={index === 0 ? "border-[color:var(--accent)] bg-[rgba(198,97,63,0.1)] text-[color:var(--text-strong)]" : ""}
              >
                {category}
              </Badge>
            ))}
          </div>
        </Container>
      </Section>
      <Section className="pt-0">
        <Container className="grid gap-5 md:grid-cols-3">
          {blogPosts.map((post, index) => (
            <Reveal key={post.slug} delay={index * 0.05}>
              <article className="group h-full overflow-hidden rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] shadow-[0_8px_22px_rgba(0,0,0,0.1)] transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(198,97,63,0.35)]">
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[color:var(--surface-soft)]">
                    <Image src={post.coverImage} alt="" fill className="object-cover opacity-85 transition duration-500 group-hover:scale-[1.03]" sizes="(max-width: 768px) 100vw, 33vw" />
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
        </Container>
      </Section>
    </>
  );
}
