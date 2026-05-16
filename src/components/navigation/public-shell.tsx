import { AIChatbot } from "@/components/public/ai-chatbot";
import FinalCTA from "@/components/public/final-cta";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { BriefcaseBusiness, FolderKanban, Home, Mail, MessageCircle, Newspaper, Phone, Rocket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const navItems = [
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" }
];

const mobileItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/services", label: "Services", icon: BriefcaseBusiness },
  { href: "/blog", label: "Blog", icon: Newspaper },
  { href: "/start-project", label: "Start", icon: Rocket }
];

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen pb-24 md:pb-0">
      <TopBar />
      <PrimaryNav />
      <AIChatbot />
      <main>{children}</main>
      <FinalCTA />
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

function TopBar() {
  return (
    <div className="border-b border-[color:var(--border-subtle)] bg-[color:var(--background-elevated)]/78 text-xs text-[color:var(--text-muted)] backdrop-blur">
      <Container className="flex h-10 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <a className="hidden items-center gap-2 transition hover:text-[color:var(--text-strong)] sm:flex" href="mailto:info@martinmukoya.com">
            <Mail size={14} /> info@martinmukoya.com
          </a>
          <a className="flex items-center gap-2 transition hover:text-[color:var(--text-strong)]" href="tel:+264818563005">
            <Phone size={14} /> +264 81 8563 005
          </a>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
            Available for new projects
          </span>
          <a
            aria-label="Chat on WhatsApp"
            href="https://wa.me/264818563005"
            target="_blank"
            rel="noreferrer"
            className="grid h-10 w-10 place-items-center rounded-full border border-[color:var(--border-subtle)] bg-white/[0.03] text-[color:var(--text-muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--text-strong)]"
          >
            <MessageCircle size={18} />
          </a>
        </div>
      </Container>
    </div>
  );
}

function PrimaryNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border-subtle)] bg-[color:var(--background)]/82 backdrop-blur-xl">
      <Container className="flex h-[72px] items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 font-display text-lg font-black text-[color:var(--text-strong)]">
          <span className="relative h-12 w-12 overflow-hidden rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface)]">
            <Image src="/assets/logos/MK-WHITEGreen.svg" alt="" fill className="theme-logo-dark object-contain p-2" sizes="48px" />
            <Image src="/assets/logos/MK-MAIN-PUPPLEGreen.svg" alt="" fill className="theme-logo-light object-contain p-2" sizes="48px" />
          </span>
          <span>Martin Mukoya</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-[color:var(--text-muted)] transition hover:bg-[color:var(--accent)]/12 hover:text-[color:var(--text-strong)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <ThemeSwitcher />
          <Button asChild>
            <Link href="/start-project">Start Project</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[color:var(--border-subtle)] bg-[color:var(--background)]">
      <Container className="grid gap-8 py-10 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <Link href="/" className="font-display text-xl font-black text-[color:var(--text-strong)]">
            Martin Mukoya
          </Link>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[color:var(--text-muted)]">
            Practical websites, booking systems, ecommerce flows, and AI automations for businesses that need cleaner leads and smoother operations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-[color:var(--text-muted)]">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[color:var(--text-strong)]">
              {item.label}
            </Link>
          ))}
          <a href="mailto:info@martinmukoya.com" className="transition hover:text-[color:var(--text-strong)]">
            Email
          </a>
          <a href="https://wa.me/264818563005" target="_blank" rel="noreferrer" className="transition hover:text-[color:var(--text-strong)]">
            WhatsApp
          </a>
        </div>
      </Container>
      <Container className="border-t border-[color:var(--border-subtle)] py-5 text-xs text-[color:var(--text-faint)]">
        © 2026 Martin Mukoya. Built for practical business systems.
      </Container>
    </footer>
  );
}

// Final CTA moved to shared component `FinalCTA`

function MobileBottomNav() {
  return (
    <nav className="safe-bottom fixed inset-x-3 bottom-3 z-50 rounded-[24px] border border-[color:var(--border-subtle)] bg-[color:var(--background-elevated)]/92 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl md:hidden">
      <div className="grid gap-2">
        <div className="flex justify-end">
          <ThemeSwitcher />
        </div>
        <div className="grid grid-cols-5 gap-1">
          {mobileItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "grid place-items-center gap-1 rounded-[16px] px-2 py-2 text-[11px] font-semibold text-[color:var(--text-muted)] transition hover:bg-[color:var(--accent)]/12 hover:text-[color:var(--text-strong)]",
                  index === 4 && "bg-[color:var(--primary)] !text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary-light)] hover:!text-[color:var(--primary-foreground)]"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
