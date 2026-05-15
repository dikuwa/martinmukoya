import type { Metadata } from "next";
import { FAQList } from "@/components/public/faq-list";
import { Reveal } from "@/components/public/motion";
import { SectionHeading } from "@/components/public/section-heading";
import { Container, Section } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about Martin Mukoya's pricing, timelines, process, support, hosting, AI automation, and ecommerce work."
};

export default function FAQPage() {
  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="FAQ"
            title="Straight answers about the process."
            description="A quick place to understand pricing, timelines, support, and what kind of digital systems are a good fit."
          />
        </Reveal>
        <Reveal className="mt-10 max-w-4xl">
          <FAQList />
        </Reveal>
      </Container>
    </Section>
  );
}
