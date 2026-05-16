import { BlogClient } from "@/components/public/blog-client";
import { Reveal } from "@/components/public/motion";
import { SectionHeading } from "@/components/public/section-heading";
import { Container, Section } from "@/components/ui/container";
import { blogPosts } from "@/lib/site-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Practical notes from Martin Mukoya on websites, booking systems, automation, and business technology."
};

export default function BlogPage() {
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
        </Container>
      </Section>
      <Section className="pt-0 bg-gradient-to-b from-[color:var(--background-elevated)]/90 to-[color:var(--background)]/50">
        <Container>
          <BlogClient posts={blogPosts} />
        </Container>
      </Section>
    </>
  );
}
