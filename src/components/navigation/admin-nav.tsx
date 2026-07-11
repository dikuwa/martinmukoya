"use client";

import Link from "next/link";
import { BarChart3, CalendarCheck, FileQuestion, FileText, FolderKanban, Inbox, LayoutDashboard, MessageSquareText, Newspaper, Settings, Star, UserRound, Users } from "lucide-react";
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
  group: "Content" | "Finance & documents" | "System";
};

const adminNav: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, group: "Content" },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban, group: "Content" },
  { href: "/admin/about", label: "About", icon: UserRound, martinOnly: true, group: "Content" },
  { href: "/admin/blog", label: "Blog", icon: Newspaper, group: "Content" },
  { href: "/admin/leads", label: "Leads", icon: Users, countKey: "leads", group: "Content" },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck, group: "Content" },
  { href: "/admin/documents", label: "Financial", icon: FileText, group: "Finance & documents" },
  { href: "/admin/business-documents", label: "Business docs", icon: FileText, group: "Finance & documents" },
  { href: "/admin/business-templates", label: "Templates", icon: FileText, group: "Finance & documents" },
  { href: "/admin/shared-documents", label: "Shared", icon: FileText, group: "Finance & documents" },
  { href: "/admin/messages", label: "Messages", icon: Inbox, countKey: "messages", group: "System" },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star, group: "System" },
  { href: "/admin/faqs", label: "FAQs", icon: FileQuestion, group: "System" },
  { href: "/admin/chat", label: "Chat", icon: MessageSquareText, countKey: "chats", group: "System" },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, group: "System" },
  { href: "/admin/settings", label: "Settings", icon: Settings, group: "System" }
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ compact }: { compact: boolean }) {
  const pathname = usePathname();
  const [counts, setCounts] = useState<NavCounts>({ leads: 0, messages: 0, chats: 0 });
  const [isMartin, setIsMartin] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setIsMartin(!window.location.hostname.includes("flextech-media")));
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
    window.addEventListener("admin-activity-cleaned", fetchCounts);
    return () => { clearInterval(interval); window.removeEventListener("admin-activity-cleaned", fetchCounts); };
  }, []);

  const visibleItems = adminNav.filter((item) => !item.martinOnly || isMartin);
  const groups = ["Content", "Finance & documents", "System"] as const;

  return (
    <nav aria-label="Dashboard navigation" className="grid gap-4">
      {groups.map((group) => <div key={group} className={cn("grid gap-0.5", compact && "border-t border-[color:var(--border-subtle)] pt-3 first:border-t-0 first:pt-0")}>
        {!compact && <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-faint)]">{group}</p>}
      {visibleItems.filter(item => item.group === group).map((item) => {
        const Icon = item.icon;
        const active = isActivePath(pathname, item.href);
        const badge = item.countKey ? counts[item.countKey] : 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            aria-label={compact ? item.label : undefined}
            title={compact ? item.label : undefined}
            className={cn(
              "group relative flex min-h-10 items-center gap-3 rounded-[calc(var(--radius)*0.75)] px-3 text-sm font-semibold transition-all duration-150",
              compact && "justify-center px-2",
              active
                ? "bg-[rgba(107,38,217,0.1)] text-[color:var(--text-strong)]"
                : "text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)]"
            )}
          >
            <Icon size={17} className={cn(
              "transition-colors duration-150",
              active ? "text-[color:var(--primary)]" : "text-[color:var(--text-faint)] group-hover:text-[color:var(--text-muted)]"
            )} />
            {!compact && item.label}
            {badge > 0 && (
              <span className={cn("grid min-w-[18px] place-items-center rounded-full bg-[color:var(--primary)] px-1 text-[10px] font-black leading-[18px] text-white", compact ? "absolute right-0 top-0" : "ml-auto")}>
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </Link>
        );
      })}
      </div>)}
    </nav>
  );
}
