"use client";

import { AIChatbot } from "@/components/public/ai-chatbot";
import FinalCTA from "@/components/public/final-cta";
import { TrackedAnchor } from "@/components/public/tracked-anchor";
import { TrackedLink } from "@/components/public/tracked-link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { trackEvent } from "@/lib/analytics-client";
import type { PublicSiteConfig } from "@/lib/public-site-config";
import { cn } from "@/lib/utils";
import { BriefcaseBusiness, FolderKanban, Home, Mail, MessageCircle, Newspaper, Phone, Rocket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

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

export function PublicShell({ children, site }: { children: React.ReactNode; site: PublicSiteConfig }) {
  const pathname = usePathname();

  useEffect(() => {
    const eventType = pathname.startsWith("/blog/")
      ? "blog_view"
      : pathname.startsWith("/projects/")
      ? "project_view"
      : "page_view";

    trackEvent({
      eventType,
      siteSlug: site.slug,
      page: pathname,
      source: "public_navigation",
      metadata: { pathname }
    });
  }, [pathname, site.slug]);

  return (
    <div data-site={site.slug} className="relative min-h-screen pb-24 md:pb-0">
      <TopBar site={site} />
      <PrimaryNav site={site} />
      <AIChatbot siteSlug={site.slug} />
      <main>{children}</main>
      <FinalCTA site={site} />
      <Footer site={site} />
      <MobileBottomNav />
    </div>
  );
}

function TopBar({ site }: { site: PublicSiteConfig }) {
  const isFlexTech = site.slug === "flextech-media";

  return (
    <div
      className={cn(
        "border-b text-xs backdrop-blur",
        isFlexTech
          ? "border-[color:var(--border-subtle)] bg-[color:var(--background-elevated)]/78 text-[color:var(--text-normal)]"
          : "border-[color:var(--border-subtle)] bg-[color:var(--background-elevated)]/78 text-[color:var(--text-normal)]"
      )}
    >
      <Container className="flex h-10 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <TrackedAnchor
            siteSlug={site.slug}
            eventType="email_click"
            eventPage="global"
            eventSource="top_bar"
            className={cn(
              "hidden items-center gap-2 font-semibold transition sm:flex",
              isFlexTech ? "text-[color:var(--text-normal)] hover:text-[color:var(--text-strong)]" : "hover:text-[color:var(--text-strong)]"
            )}
            href={`mailto:${site.contact.email}`}
          >
            <Mail size={14} /> {site.contact.email}
          </TrackedAnchor>
          <a
            className={cn(
              "flex items-center gap-2 font-semibold transition",
              isFlexTech ? "text-[color:var(--text-normal)] hover:text-[color:var(--text-strong)]" : "hover:text-[color:var(--text-strong)]"
            )}
            href={site.contact.phoneHref}
          >
            <Phone size={14} /> {site.contact.phone}
          </a>
        </div>
        <div className="flex items-center gap-3">            <span className={cn("inline-flex items-center gap-2 whitespace-nowrap font-semibold", "text-[color:var(--text-normal)]")}>
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-[#22C55E]/40 animate-ping" />
                <span className="relative inline-block h-2 w-2 rounded-full bg-[#22C55E]" />
              </span>
            {site.availability}
          </span>
          <TrackedAnchor
            siteSlug={site.slug}
            aria-label="Chat on WhatsApp"
            eventType="whatsapp_click"
            eventPage="global"
            eventSource="top_bar"
            href={site.contact.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full border transition",
              isFlexTech
                ? "border-[color:var(--primary)]/25 bg-[color:var(--primary)]/10 text-[color:var(--primary)] hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)]/20"
                : "border-[color:var(--primary)]/25 bg-[color:var(--primary)]/10 text-[color:var(--primary)] hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)]/20"
            )}
          >
            <MessageCircle size={14} />
          </TrackedAnchor>
        </div>
      </Container>
    </div>
  );
}

function PrimaryNav({ site }: { site: PublicSiteConfig }) {
  const pathname = usePathname();
  const isFlexTech = site.slug === "flextech-media";
  const visibleNavItems = isFlexTech ? navItems.filter((item) => item.href !== "/about") : navItems;

  return (
    <header className={cn(
      "sticky top-0 z-40 border-b backdrop-blur-xl",
      isFlexTech
        ? "border-[color:var(--border-subtle)] bg-[color:var(--background)]/95"
        : "border-[color:var(--border-subtle)] bg-[color:var(--background)]/82"
    )}>
      <Container className="flex h-[72px] items-center justify-between gap-6">
        <Link href="/" className={cn("flex items-center gap-3 font-display font-black", isFlexTech ? "text-[color:var(--text-strong)]" : "text-[color:var(--text-strong)]")}>              <span className={cn("relative block overflow-hidden", isFlexTech ? "h-11 w-36 sm:w-40 md:h-12 md:w-48" : "h-11 w-11 rounded-full md:h-12 md:w-12")}>
                {isFlexTech ? (
                  <>
                    <Image src="/assets/backgrounds/SVG/SVG/flex-light.svg" alt={site.logoAlt} fill className="theme-logo-dark object-contain object-left" sizes="(max-width: 640px) 144px, (max-width: 768px) 160px, 192px" priority />
                    <Image src="/assets/backgrounds/SVG/SVG/flex-dark.svg" alt={site.logoAlt} fill className="theme-logo-light object-contain object-left" sizes="(max-width: 640px) 144px, (max-width: 768px) 160px, 192px" priority />
                  </>
                ) : (
                  <>
                    <Image src="/assets/logos/logo-light.svg" alt={site.logoAlt} fill className="theme-logo-dark object-contain opacity-80 brightness-90" sizes="(max-width: 768px) 44px, 48px" priority />
                    <Image src="/assets/logos/logo-dark.svg" alt={site.logoAlt} fill className="theme-logo-light object-contain" sizes="(max-width: 768px) 44px, 48px" priority />
                  </>
                )}
              </span>
          {!isFlexTech && (
            <span className="hidden leading-tight sm:grid">
              <span className="text-lg md:text-xl">{site.brandLines[0]}</span>
              <span className="-mt-1 text-lg md:text-xl">{site.brandLines[1]}</span>
            </span>
          )}
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {visibleNavItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-semibold transition xl:px-4",
                  active
                    ? isFlexTech
                      ? "bg-[#6b26d9]/12 text-[#6b26d9]"
                      : "bg-[color:var(--primary)]/12 text-[color:var(--primary)]"
                    : isFlexTech
                    ? "text-[color:var(--text-muted)] hover:bg-[#6b26d9]/12 hover:text-[color:var(--text-strong)]"
                    : "text-[color:var(--text-muted)] hover:bg-[color:var(--primary)]/12 hover:text-[color:var(--primary)]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <Button asChild className={cn("hidden lg:inline-flex shadow-[0_18px_40px_rgba(34,197,94,0.18)]", "bg-[#22C55E] text-white hover:bg-[#16A34A]")}>
            <TrackedLink siteSlug={site.slug} eventType="cta_click" eventPage={pathname} eventSource="primary_nav_start_project" href="/start-project" className="text-white">
              {site.finalCta.primary}
            </TrackedLink>
          </Button>
        </div>
      </Container>
    </header>
  );
}

function Footer({ site }: { site: PublicSiteConfig }) {
  const isFlexTech = site.slug === "flextech-media";

  if (isFlexTech) {
    return (
      <footer className="border-t border-[color:var(--border-subtle)] bg-[color:var(--background-elevated)]/60 backdrop-blur-sm">
        <Container className="py-12">
          <div className="grid gap-8 md:grid-cols-[1.8fr_1fr_1fr_1.2fr]">
            {/* Brand column */}
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="relative block h-16 w-16 overflow-hidden">
                  <Image src="/assets/backgrounds/SVG/SVG/flex-light.svg" alt={site.logoAlt} fill className="theme-logo-dark object-contain" sizes="64px" />
                  <Image src="/assets/backgrounds/SVG/SVG/flex-dark.svg" alt={site.logoAlt} fill className="theme-logo-light object-contain" sizes="64px" />
                </span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-6 text-[color:var(--text-muted)]">
                {site.footerDescription}
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--text-faint)]">Navigation</h4>
              <ul className="space-y-3">
                {[
                  { href: "/projects", label: "Projects" },
                  { href: "/services", label: "Services" },
                  { href: "/blog", label: "Blog" },
                  { href: "/contact", label: "Contact" }
                ].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm font-semibold text-[color:var(--text-muted)] transition hover:text-[color:var(--primary)]">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--text-faint)]">Contact</h4>
              <ul className="space-y-3">
                <li>
                  <TrackedAnchor siteSlug={site.slug} eventType="email_click" eventPage="global" eventSource="footer" href={`mailto:${site.contact.email}`} className="text-sm font-semibold text-[color:var(--text-muted)] transition hover:text-[color:var(--primary)]">
                    {site.contact.email}
                  </TrackedAnchor>
                </li>
                <li>
                  <TrackedAnchor siteSlug={site.slug} eventType="whatsapp_click" eventPage="global" eventSource="footer" href={site.contact.whatsappHref} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[color:var(--text-muted)] transition hover:text-[color:var(--primary)]">
                    WhatsApp
                  </TrackedAnchor>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--text-faint)]">Company</h4>
              <p className="text-sm leading-6 text-[color:var(--text-muted)]">
                Reg. No. CC/2024/00337<br />
                ERF 234, SILVER AVENUE<br />
                TAMARISKIA, SWAKOPMUND
              </p>
            </div>
          </div>
        </Container>
        <div className="border-t border-[color:var(--border-subtle)]">
          <Container className="flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
            <p className="text-xs text-[color:var(--text-faint)]">
              &copy; 2026 FlexTech Media. All rights reserved.
            </p>
            <p className="text-xs text-[color:var(--text-faint)]">
              Designed by{" "}
              <a href="https://martinmukoya.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-[color:var(--text-muted)] transition hover:text-[color:var(--primary)]">
                Martin Mukoya
              </a>
            </p>
          </Container>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-[color:var(--border-subtle)] bg-[color:var(--background)]">
      <Container className="grid gap-8 py-10 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <Link href="/" className="font-display text-xl font-black text-[color:var(--text-strong)]">
            {site.brandName}
          </Link>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[color:var(--text-muted)]">
            {site.footerDescription}
          </p>
          {site.registrationInfo ? (
            <p className="mt-3 max-w-xl text-sm leading-6 text-[color:var(--text-muted)]">
              {site.registrationInfo}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-[color:var(--text-muted)]">
          {navItems
            .filter((item) => item.href !== "/about")
            .map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-[color:var(--text-strong)]">
                {item.label}
              </Link>
            ))}
          <TrackedAnchor siteSlug={site.slug} eventType="email_click" eventPage="global" eventSource="footer" href={`mailto:${site.contact.email}`} className="transition hover:text-[color:var(--text-strong)]">
            Email
          </TrackedAnchor>
          <TrackedAnchor siteSlug={site.slug} eventType="whatsapp_click" eventPage="global" eventSource="footer" href={site.contact.whatsappHref} target="_blank" rel="noopener noreferrer" className="transition hover:text-[color:var(--text-strong)]">
            WhatsApp
          </TrackedAnchor>
        </div>
      </Container>
      <Container className="border-t border-[color:var(--border-subtle)] py-5 text-xs text-[color:var(--text-faint)]">
        &copy; 2026 {site.brandName}. {site.copyright}
      </Container>
    </footer>
  );
}

// Final CTA moved to shared component `FinalCTA`

function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed inset-x-3 bottom-3 z-50 rounded-[24px] border border-[color:var(--border-subtle)] bg-[color:var(--background-elevated)]/92 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "grid place-items-center gap-1 rounded-[16px] px-2 py-2 text-[11px] font-semibold text-[color:var(--text-muted)] transition hover:bg-[color:var(--primary)]/12 hover:text-[color:var(--primary)]",
                active && "bg-[color:var(--primary)]/12 !text-[color:var(--primary)]",
                item.href === "/start-project" && "bg-[#22C55E] !text-white hover:bg-[#16A34A] hover:!text-white"
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

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
