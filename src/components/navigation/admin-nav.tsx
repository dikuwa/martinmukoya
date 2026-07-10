"use client";

import Link from "next/link";
import { BarChart3, FileQuestion, FolderKanban, Inbox, LayoutDashboard, MessageSquareText, Newspaper, Settings, Star, UserRound, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type NavCounts = {
  leads: number;
  messages: number;
  chats: number;
};

type AdminNavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  countKey?: keyof NavCounts;
  martinOnly?: boolean;
};

const adminNav: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/about", label: "About", icon: UserRound, martinOnly: true },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/leads", label: "Leads", icon: Users, countKey: "leads" as const },
  { href: "/admin/messages", label: "Messages", icon: Inbox, countKey: "messages" as const },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/faqs", label: "FAQs", icon: FileQuestion },
  { href: "/admin/chat", label: "Chat", icon: MessageSquareText, countKey: "chats" as const },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();
  const [counts, setCounts] = useState<NavCounts>({ leads: 0, messages: 0, chats: 0 });
  const [isMartin, setIsMartin] = useState(false);

  useEffect(() => {
    setIsMartin(!window.location.hostname.includes("flextech-media"));
    async function fetchCounts() {
      try {
        const res = await fetch("/api/admin/notifications/count");
        if (res.ok) {
          const data = await res.json();
          setCounts(data.counts ?? { leads: 0, messages: 0, chats: 0 });
        }
      } catch {
        // Silently fail
      }
    }
    fetchCounts();
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="mt-6 grid gap-0.5">
      {adminNav.filter((item) => !item.martinOnly || isMartin).map((item) => {
        const Icon = item.icon;
        const active = isActivePath(pathname, item.href);
        const badge = item.countKey ? counts[item.countKey] : 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-[calc(var(--radius)*0.75)] px-3 py-2.5 text-sm font-semibold transition-all duration-150",
              active
                ? "bg-[rgba(107,38,217,0.1)] text-[color:var(--text-strong)]"
                : "text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)]"
            )}
          >
            <Icon size={17} className={cn(
              "transition-colors duration-150",
              active ? "text-[color:var(--primary)]" : "text-[color:var(--text-faint)] group-hover:text-[color:var(--text-muted)]"
            )} />
            {item.label}
            {badge > 0 && (
              <span className="ml-auto grid min-w-[18px] place-items-center rounded-full bg-[color:var(--primary)] px-1 text-[10px] font-black leading-[18px] text-white">
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();
  const [counts, setCounts] = useState<NavCounts>({ leads: 0, messages: 0, chats: 0 });
  const [isMartin, setIsMartin] = useState(false);

  useEffect(() => {
    setIsMartin(!window.location.hostname.includes("flextech-media"));
    async function fetchCounts() {
      try {
        const res = await fetch("/api/admin/notifications/count");
        if (res.ok) {
          const data = await res.json();
          setCounts(data.counts ?? { leads: 0, messages: 0, chats: 0 });
        }
      } catch {
        // Silently fail
      }
    }
    fetchCounts();
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6 lg:hidden">
      {adminNav.filter((item) => !item.martinOnly || isMartin).map((item) => {
        const Icon = item.icon;
        const active = isActivePath(pathname, item.href);
        const badge = item.countKey ? counts[item.countKey] : 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition",
              active
                ? "border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] text-[color:var(--text-strong)]"
                : "border-[color:var(--border-subtle)] bg-[color:var(--surface)] text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)]"
            )}
          >
            <Icon size={15} />
            {item.label}
            {badge > 0 && (
              <span className="grid min-w-[16px] place-items-center rounded-full bg-[color:var(--primary)] px-1 text-[9px] font-black leading-[16px] text-white">
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
