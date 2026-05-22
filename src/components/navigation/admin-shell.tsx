import Link from "next/link";
import { ExternalLink, LayoutDashboard } from "lucide-react";
import { AdminMobileNav, AdminNav } from "@/components/navigation/admin-nav";
import { NotificationCenter } from "@/components/admin/notification-center";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { headers } from "next/headers";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--text-normal)]">
      {/* ── Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[color:var(--border-subtle)] bg-[color:var(--background-elevated)]/90 p-5 backdrop-blur-xl lg:flex lg:flex-col">
        <Link href="/admin" className="flex items-center gap-2 font-display text-lg font-black tracking-tight text-[color:var(--text-strong)]">
          <LayoutDashboard size={20} className="text-[color:var(--primary)]" />
          <span>Admin</span>
        </Link>
        <AdminNav />
        <div className="mt-auto rounded-[var(--radius)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-3.5">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--primary)] text-xs font-black text-white">
              {session?.user.name?.charAt(0).toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[color:var(--text-strong)]">{session?.user.name ?? "Admin"}</p>
              <p className="truncate text-xs text-[color:var(--text-faint)]">{session?.user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="lg:pl-64">
        {/* ── Top bar ── */}
        <header className="sticky top-0 z-30 border-b border-[color:var(--border-subtle)] bg-[color:var(--background)]/90 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
                Dashboard
              </p>
              <p className="text-sm text-[color:var(--text-muted)] truncate">Content, leads, analytics, and settings</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <NotificationCenter />
              <ThemeSwitcher />
              <Button asChild variant="secondary" size="sm">
                <Link href="/">
                  <ExternalLink size={14} />
                  <span className="hidden sm:inline">View Site</span>
                </Link>
              </Button>
            </div>
          </div>
          <AdminMobileNav />
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
