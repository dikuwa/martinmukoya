import { Reveal } from "@/components/public/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import Link from "next/link";

export function FinalCTA() {
  return (
    <Section className="py-14 bg-[color:var(--background-elevated)]">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <Badge>Ready to build?</Badge>
            <h2 className="mt-4 font-display text-[clamp(2rem,calc(1.45rem+2.5vw),4rem)] font-black leading-tight text-[color:var(--text-strong)]">
              Let’s turn your next enquiry into a cleaner system.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)]">
              Send the goal, the current friction, and the kind of customers you want to serve better.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/start-project">Start Your Project</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="/contact">WhatsApp Martin</a>
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

export default FinalCTA;
