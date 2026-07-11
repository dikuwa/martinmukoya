"use client";

import Link from "next/link";
import { BarChart3, CalendarCheck, FileQuestion, FileText, FolderKanban, Inbox, LayoutDashboard, Menu, MessageSquareText, Newspaper, PanelLeftClose, PanelLeftOpen, Settings, Star, UserRound, Users, X } from "lucide-react";
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
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/documents", label: "Financial", icon: FileText },
  { href: "/admin/business-documents", label: "Business docs", icon: FileText },
  { href: "/admin/business-templates", label: "Templates", icon: FileText },
  { href: "/admin/shared-documents", label: "Shared", icon: FileText },
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
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

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

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Open dashboard menu" aria-expanded={open} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] text-[color:var(--text-strong)] lg:hidden">
        <Menu size={20} aria-hidden="true" />
      </button>
      {open && <button type="button" aria-label="Close dashboard menu" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] lg:hidden" />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[color:var(--border-subtle)] bg-[color:var(--background-elevated)] p-3 shadow-2xl transition-[width,transform] duration-200 lg:hidden", compact ? "w-[76px]" : "w-[min(18rem,86vw)]", open ? "translate-x-0" : "-translate-x-full")} aria-hidden={!open}>
        <div className="flex h-11 items-center gap-2">
          <Link href="/admin" onClick={() => setOpen(false)} className={cn("flex min-w-0 items-center gap-2 font-display font-black text-[color:var(--text-strong)]", compact && "justify-center")}>
            <LayoutDashboard size={20} className="shrink-0 text-[color:var(--primary)]" />
            {!compact && <span>Admin</span>}
          </Link>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close dashboard menu" className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)]"><X size={19}/></button>
        </div>
        <button type="button" onClick={() => setCompact(value => !value)} aria-label={compact ? "Show menu labels" : "Show icons only"} className={cn("mt-3 flex h-9 items-center gap-2 rounded-lg px-2 text-xs font-bold text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)]", compact && "justify-center")}>
          {compact ? <PanelLeftOpen size={17}/> : <PanelLeftClose size={17}/>}
          {!compact && <span>Icons only</span>}
        </button>
        <nav aria-label="Dashboard navigation" className="mt-3 grid min-h-0 flex-1 content-start gap-1 overflow-y-auto pb-4">
          {adminNav.filter((item) => !item.martinOnly || isMartin).map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);
            const badge = item.countKey ? counts[item.countKey] : 0;
            return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} title={compact ? item.label : undefined} aria-current={active ? "page" : undefined} className={cn("group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition", compact && "justify-center px-2", active ? "bg-[rgba(107,38,217,0.1)] text-[color:var(--text-strong)]" : "text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)]")}>
              <Icon size={18} className={cn("shrink-0", active ? "text-[color:var(--primary)]" : "text-[color:var(--text-faint)]")}/>
              {!compact && <span className="truncate">{item.label}</span>}
              {badge > 0 && <span className={cn("grid min-w-[18px] place-items-center rounded-full bg-[color:var(--primary)] px-1 text-[9px] font-black leading-[18px] text-white", compact ? "absolute right-0 top-0" : "ml-auto")}>{badge > 99 ? "99+" : badge}</span>}
            </Link>;
          })}
        </nav>
      </aside>
    </>
  );
}
