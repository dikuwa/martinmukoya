import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/public/motion";
import { SectionHeading } from "@/components/public/section-heading";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { techStack } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "About",
  description: "About Martin Mukoya, a science teacher, curious builder, and practical business-systems developer based in Namibia."
};

export default function AboutPage() {
  return (
    <>
      <Section className="pb-12">
        <Container className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <SectionHeading
              eyebrow="About Martin"
              title="More than just lines of code."
              description="👋 Hi there! I'm a science teacher by day and a curious human all the time. My life is a happy collision of lesson plans, bug reports, birdsong, and dog-eared books. I believe the best ideas live at the intersection of the natural world and the digital one, and I'm always trying to find them."
            />
            <Button asChild className="mt-7">
              <Link href="/contact">Let’s Talk</Link>
            </Button>
          </Reveal>
          <Reveal className="relative mx-auto aspect-[4/5] w-full max-w-[460px] overflow-hidden rounded-[22px]">
            <Image
              src="/assets/hero-images/webp/about.webp"
              alt="Martin Mukoya"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 460px"
            />
          </Reveal>
        </Container>
      </Section>
      <Section className="bg-[color:var(--background-elevated)]">
        <Container className="grid gap-5 md:grid-cols-3">
          {[
            ["Teacher's clarity", "Lesson planning taught me to explain complex ideas without draining the life out of them."],
            ["Nature-led curiosity", "Birdsong, books, and quiet observation keep me asking better questions before I build."],
            ["Practical foundations", "I still care deeply about maintainable patterns, typed data, tested flows, and useful admin controls."]
          ].map(([title, text], index) => (
            <Reveal key={title} delay={index * 0.05}>
              <article className="h-full rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6">
                <h2 className="font-display text-2xl font-black text-[color:var(--text-strong)]">{title}</h2>
                <p className="mt-4 text-sm leading-6 text-[color:var(--text-muted)]">{text}</p>
              </article>
            </Reveal>
          ))}
        </Container>
      </Section>
      <Section>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Stack"
              title="Modern tools, used for practical outcomes."
              description="The stack is chosen to keep interfaces fast, data structured, admin work manageable, and future integrations possible."
            />
          </Reveal>
          <div className="mt-8 flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <span key={tech} className="rounded-full border border-[color:var(--border-subtle)] bg-white/[0.04] px-4 py-2 text-sm font-bold text-[color:var(--text-muted)]">
                {tech}
              </span>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
