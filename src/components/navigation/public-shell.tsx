import Image from "next/image";
import Link from "next/link";
import { BriefcaseBusiness, FolderKanban, Home, Mail, Newspaper, Phone, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen pb-24 md:pb-0">
      <TopBar />
      <PrimaryNav />
      <main>{children}</main>
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
          <ThemeSwitcher />
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
          <span className="relative h-10 w-10 overflow-hidden rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface)]">
            <Image src="/assets/logos/MK-WHITEGreen.svg" alt="" fill className="object-contain p-2" sizes="40px" />
          </span>
          <span>Martin Mukoya</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-[color:var(--text-muted)] transition hover:bg-white/[0.05] hover:text-[color:var(--text-strong)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button asChild className="hidden md:inline-flex">
          <Link href="/start-project">Start Project</Link>
        </Button>
      </Container>
    </header>
  );
}

function MobileBottomNav() {
  return (
    <nav className="safe-bottom fixed inset-x-3 bottom-3 z-50 rounded-[24px] border border-[color:var(--border-subtle)] bg-[color:var(--background-elevated)]/92 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.38)] backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {mobileItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "grid place-items-center gap-1 rounded-[16px] px-2 py-2 text-[11px] font-semibold text-[color:var(--text-muted)] transition hover:bg-white/[0.06] hover:text-[color:var(--text-strong)]",
                index === 4 && "bg-[color:var(--accent)] text-white hover:bg-[#D98263] hover:text-white"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
