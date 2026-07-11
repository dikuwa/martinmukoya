"use client";

import Link from "next/link";
import { ExternalLink, LayoutDashboard, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminNav } from "@/components/navigation/admin-nav";
import { NotificationCenter } from "@/components/admin/notification-center";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from "@/lib/utils";

type Props = { children: React.ReactNode; user: { name: string; email: string } };
const preferenceKey = "admin-sidebar-compact";

export function AdminDashboardFrame({ children, user }: Props) {
  const [compact, setCompact] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem(preferenceKey);
    const next = saved === null ? window.matchMedia("(max-width: 767px)").matches : saved === "true";
    queueMicrotask(() => setCompact(next));
  }, []);

  function toggleSidebar() {
    setCompact(current => {
      const next = !current;
      window.localStorage.setItem(preferenceKey, String(next));
      return next;
    });
  }

  return <div className="min-h-screen overflow-x-hidden bg-[color:var(--background)] text-[color:var(--text-normal)]">
    <aside className={cn("fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[color:var(--border-subtle)] bg-[color:var(--background-elevated)]/95 backdrop-blur-xl transition-[width] duration-200", compact ? "w-[76px] p-3" : "w-64 p-5")}>
      <div className={cn("flex min-h-11 items-center", compact ? "justify-center" : "justify-between gap-2")}>
        <Link href="/admin" aria-label="Admin overview" className={cn("flex min-w-0 items-center gap-2 font-display text-lg font-black tracking-tight text-[color:var(--text-strong)]", compact && "justify-center")}>
          <LayoutDashboard size={21} className="shrink-0 text-[color:var(--primary)]" />
          {!compact && <span>Admin</span>}
        </Link>
      </div>
      <button type="button" onClick={toggleSidebar} aria-label={compact ? "Expand dashboard sidebar" : "Collapse dashboard sidebar"} aria-expanded={!compact} className={cn("mt-3 grid h-11 place-items-center rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] text-[color:var(--text-muted)] transition hover:border-[color:var(--primary)]/30 hover:text-[color:var(--text-strong)] focus-visible:outline-2 focus-visible:outline-[color:var(--primary)]", compact ? "w-full" : "ml-auto w-11")}>
        {compact ? <PanelLeftOpen size={19} aria-hidden="true"/> : <PanelLeftClose size={19} aria-hidden="true"/>}
      </button>
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin]">
        <AdminNav compact={compact}/>
      </div>
      <div className={cn("mt-3 border-t border-[color:var(--border-subtle)] pt-3", compact ? "grid place-items-center" : "rounded-[var(--radius)] bg-[color:var(--surface)] p-3")}>
        <div className={cn("flex items-center", compact ? "justify-center" : "gap-3")} title={compact ? `${user.name} · ${user.email}` : undefined}>
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--primary)] text-xs font-black text-white">{user.name.charAt(0).toUpperCase()}</div>
          {!compact && <div className="min-w-0"><p className="truncate text-sm font-bold text-[color:var(--text-strong)]">{user.name}</p><p className="truncate text-xs text-[color:var(--text-faint)]">{user.email}</p></div>}
        </div>
      </div>
    </aside>

    <div className={cn("min-w-0 transition-[padding-left] duration-200", compact ? "pl-[76px]" : "pl-64")}>
      <header className="sticky top-0 z-30 border-b border-[color:var(--border-subtle)] bg-[color:var(--background)]/90 backdrop-blur-xl">
        <div className="flex min-h-14 items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
          <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-faint)] sm:text-xs">Dashboard</p><p className="hidden truncate text-sm text-[color:var(--text-muted)] sm:block">Content, leads, analytics, and settings</p></div>
          <div className="flex shrink-0 items-center gap-1.5"><NotificationCenter/><ThemeSwitcher/><Button asChild variant="secondary" size="sm"><Link href="/"><ExternalLink size={14}/><span className="hidden md:inline">View Site</span></Link></Button></div>
        </div>
      </header>
      <main className="min-w-0 px-3 py-5 sm:px-6 lg:px-8">{children}</main>
    </div>
  </div>;
}
