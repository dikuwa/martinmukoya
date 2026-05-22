"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Inbox, MessageSquareText, Users, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: string;
  type: "lead" | "message" | "chat";
  title: string;
  detail: string;
  href: string;
  createdAt: string;
};

type NotificationData = {
  total: number;
  counts: { leads: number; messages: number; chats: number };
  items: NotificationItem[];
};

const typeConfig = {
  lead: { icon: Users, label: "Lead", color: "text-[color:var(--primary)]" },
  message: { icon: Inbox, label: "Message", color: "text-[color:var(--accent)]" },
  chat: { icon: MessageSquareText, label: "Chat", color: "text-[color:var(--primary-light)]" }
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/admin/notifications");
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const totalUnread = data?.total ?? 0;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "relative grid h-9 w-9 place-items-center rounded-[calc(var(--radius)*0.75)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] text-[color:var(--text-muted)] transition hover:border-[color:var(--primary)]/40 hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)]",
          open && "border-[color:var(--primary)]/40 bg-[color:var(--surface-soft)]"
        )}
        aria-label={`Notifications${totalUnread > 0 ? `, ${totalUnread} unread` : ""}`}
      >
        <Bell size={16} />
        {totalUnread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-[color:var(--primary)] px-1 text-[10px] font-black leading-[18px] text-white">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[360px] origin-top-right animate-in rounded-[var(--radius)] border border-[color:var(--border-subtle)] bg-[color:var(--background-elevated)] shadow-[var(--shadow-lg)] backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[color:var(--border-subtle)] px-4 py-3">
            <div>
              <h3 className="text-sm font-black text-[color:var(--text-strong)]">Notifications</h3>
              {data && (
                <p className="text-xs text-[color:var(--text-faint)]">
                  {data.counts.leads > 0 && `${data.counts.leads} lead${data.counts.leads > 1 ? "s" : ""}`}
                  {data.counts.leads > 0 && (data.counts.messages > 0 || data.counts.chats > 0) && " · "}
                  {data.counts.messages > 0 && `${data.counts.messages} message${data.counts.messages > 1 ? "s" : ""}`}
                  {data.counts.messages > 0 && data.counts.chats > 0 && " · "}
                  {data.counts.chats > 0 && `${data.counts.chats} chat${data.counts.chats > 1 ? "s" : ""}`}
                  {data.counts.leads === 0 && data.counts.messages === 0 && data.counts.chats === 0 && "All caught up"}
                </p>
              )}
            </div>
            {data && data.total > 0 && (
              <Link
                href="/admin"
                className="text-xs font-bold text-[color:var(--primary)] hover:text-[color:var(--primary-light)]"
                onClick={() => setOpen(false)}
              >
                View all
              </Link>
            )}
          </div>

          {/* Items */}
          <div className="max-h-[360px] overflow-y-auto">
            {loading ? (
              <div className="grid gap-2 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-[calc(var(--radius)*0.75)] bg-[color:var(--surface-soft)]" />
                ))}
              </div>
            ) : !data || data.items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Bell size={24} className="text-[color:var(--text-faint)]" />
                <p className="text-sm font-semibold text-[color:var(--text-muted)]">No new notifications</p>
                <p className="text-xs text-[color:var(--text-faint)]">Leads, messages, and chat handovers will appear here.</p>
              </div>
            ) : (
              <div className="grid divide-y divide-[color:var(--border-subtle)]">
                {data.items.map((item) => {
                  const config = typeConfig[item.type];
                  const Icon = config.icon;
                  return (
                    <Link
                      key={`${item.type}-${item.id}`}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="group grid gap-1.5 px-4 py-3 transition hover:bg-[color:var(--surface-soft)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon size={14} className={cn("shrink-0", config.color)} />
                          <span className="text-xs font-bold uppercase tracking-[0.08em] text-[color:var(--text-faint)]">
                            {config.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] text-[color:var(--text-faint)]">
                            {timeAgo(item.createdAt)}
                          </span>
                          <ExternalLink size={12} className="text-[color:var(--text-faint)] opacity-0 transition group-hover:opacity-100" />
                        </div>
                      </div>
                      <p className="truncate text-sm font-bold text-[color:var(--text-strong)]">{item.title}</p>
                      <p className="line-clamp-1 text-xs text-[color:var(--text-muted)]">{item.detail}</p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
