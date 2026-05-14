import Link from "next/link";
import { BarChart3, FileQuestion, FolderKanban, Home, Inbox, LayoutDashboard, MessageSquareText, Newspaper, Settings, Star, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { headers } from "next/headers";

const adminNav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/faqs", label: "FAQs", icon: FileQuestion },
  { href: "/admin/chat", label: "Chat", icon: MessageSquareText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--text-normal)]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[color:var(--border-subtle)] bg-[color:var(--background-elevated)]/88 p-5 backdrop-blur-xl lg:block">
        <Link href="/admin" className="font-display text-xl font-black text-[color:var(--text-strong)]">
          Martin Admin
        </Link>
        <nav className="mt-8 grid gap-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-semibold text-[color:var(--text-muted)] transition hover:bg-white/[0.06] hover:text-[color:var(--text-strong)]"
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute inset-x-5 bottom-5 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-4">
          <p className="text-sm font-bold text-[color:var(--text-strong)]">{session?.user.name ?? "Admin"}</p>
          <p className="mt-1 truncate text-xs text-[color:var(--text-muted)]">{session?.user.email}</p>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-[color:var(--border-subtle)] bg-[color:var(--background)]/86 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
                Dashboard
              </p>
              <p className="text-sm text-[color:var(--text-muted)]">Content, leads, analytics, and settings</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <Button asChild variant="secondary">
                <Link href="/">
                  <Home size={16} /> Site
                </Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
