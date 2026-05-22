"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Inbox, MessageSquareText, Users, ExternalLink, X, CheckCheck, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type CountData = {
  total: number;
  counts: { leads: number; messages: number; chats: number };
};

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
  hasRead: boolean;
  totalRead: number;
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
  const [dismissing, setDismissing] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
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
  }, []);

  /**
   * Lightweight count poll — runs every 5 seconds.
   * Updates the badge total/counts and triggers a full data refresh
   * immediately when new notifications arrive so the dropdown always
   * has real items when opened.
   */
  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications/count");
      if (res.ok) {
        const json: CountData = await res.json();

        // Check if the total went up since the last poll
        let totalIncreased = false;
        setData((prev) => {
          if (prev) {
            totalIncreased = json.total > prev.total;
            return { ...prev, total: json.total, counts: json.counts };
          }
          // No full data yet but count endpoint has items — create
          // a skeleton entry. Full data will arrive from the triggered
          // fetchNotifications() below.
          totalIncreased = json.total > 0;
          if (json.total > 0) {
            return {
              total: json.total,
              counts: json.counts,
              items: [],
              hasRead: false,
              totalRead: 0
            };
          }
          return null;
        });

        // When total increases, eagerly pull full data so the dropdown
        // has real items when the user opens it.
        if (totalIncreased) {
          fetchNotifications();
        }
      }
    } catch {
      // Silently fail
    }
  }, [fetchNotifications]);

  // ── Polling & visibility ──
  useEffect(() => {
    fetchNotifications();

    // Lightweight count poll every 5s for real-time badge updates
    const countInterval = setInterval(fetchCount, 5000);
    // Full-data sync poll every 30s to keep items fresh
    const fullInterval = setInterval(fetchNotifications, 30000);

    // Refetch when the tab becomes visible again
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchCount();
        fetchNotifications();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(countInterval);
      clearInterval(fullInterval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchNotifications, fetchCount]);

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

  // ── Actions ─────────────────────────────────────────────────

  const markAsRead = useCallback(async (id: string) => {
    setDismissing((prev) => new Set(prev).add(id));
    const prevData = data;
    // Optimistically remove from local state
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        total: Math.max(0, prev.total - 1),
        items: prev.items.filter((item) => item.id !== id)
      };
    });
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to mark as read");
    } catch {
      // Revert optimistic update on failure
      setData(prevData);
    } finally {
      setDismissing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [data]);

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, total: 0, totalRead: prev.totalRead + prev.total, hasRead: true, items: [] };
    });
    try {
      await fetch("/api/admin/notifications", { method: "PATCH" });
      await fetchNotifications();
    } catch {
      await fetchNotifications();
    }
  }, [fetchNotifications]);

  const clearRead = useCallback(async () => {
    const prevData = data;
    // Optimistic update
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, totalRead: 0, hasRead: false };
    });
    try {
      await fetch("/api/admin/notifications", { method: "DELETE" });
    } catch {
      setData(prevData);
    }
  }, [data]);

  const clearAll = useCallback(async () => {
    const prevData = data;
    // Optimistic update — clear everything
    setData((prev) => {
      if (!prev) return null;
      return { ...prev, total: 0, totalRead: 0, hasRead: false, items: [] };
    });
    try {
      await fetch("/api/admin/notifications?all=true", { method: "DELETE" });
      await fetchNotifications();
    } catch {
      setData(prevData);
    }
  }, [data, fetchNotifications]);

  const handleItemClick = useCallback(
    (e: React.MouseEvent, item: NotificationItem) => {
      // Mark as read in background before navigating
      fetch(`/api/admin/notifications/${item.id}`, { method: "PATCH" }).catch(() => {});
      setOpen(false);
    },
    []
  );

  const totalUnread = data?.total ?? 0;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => {
          // Fetch fresh data whenever the bell is clicked
          fetchNotifications();
          setOpen(!open);
        }}
        className={cn(
          "relative grid h-9 w-9 place-items-center rounded-[calc(var(--radius)*0.75)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] text-[color:var(--text-muted)] transition hover:border-[color:var(--primary)]/40 hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)]",
          open && "border-[color:var(--primary)]/40 bg-[color:var(--surface-soft)]"
        )}
        aria-label={`Notifications${totalUnread > 0 ? `, ${totalUnread} unread` : ""}`}
      >
        <Bell size={16} />          {totalUnread > 0 && (
            <span
              key={totalUnread}
              className="absolute -right-0.5 -top-0.5 grid min-w-[18px] animate-badge-pop place-items-center rounded-full bg-[color:var(--primary)] px-1 text-[10px] font-black leading-[18px] text-white"
            >
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[380px] origin-top-right animate-in rounded-[var(--radius)] border border-[color:var(--border-subtle)] bg-[color:var(--background-elevated)] shadow-[var(--shadow-lg)] backdrop-blur-xl">
          {/* ── Header ── */}
          <div className="flex items-center justify-between gap-2 border-b border-[color:var(--border-subtle)] px-4 py-3">
            <div className="min-w-0">
              <h3 className="text-sm font-black text-[color:var(--text-strong)]">Notifications</h3>
              {data && (
                <p className="truncate text-xs text-[color:var(--text-faint)]">
                  {data.counts.leads > 0 && `${data.counts.leads} lead${data.counts.leads > 1 ? "s" : ""}`}
                  {data.counts.leads > 0 && (data.counts.messages > 0 || data.counts.chats > 0) && " · "}
                  {data.counts.messages > 0 && `${data.counts.messages} message${data.counts.messages > 1 ? "s" : ""}`}
                  {data.counts.messages > 0 && data.counts.chats > 0 && " · "}
                  {data.counts.chats > 0 && `${data.counts.chats} chat${data.counts.chats > 1 ? "s" : ""}`}
                  {data.total === 0 && data.totalRead > 0 && `${data.totalRead} read`}
                  {data.total === 0 && data.totalRead === 0 && !loading && "All caught up"}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Mark all as read */}
              {data && data.total > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold text-[color:var(--primary)] transition hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--primary-light)]"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}

              {/* Clear all notifications (seed data cleanup, bulk dismiss) */}
              {data && (data.total > 0 || data.hasRead) && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold text-[color:var(--destructive)] transition hover:bg-[color:var(--destructive)]/10 hover:text-[color:var(--destructive)]"
                  title="Clear all notifications"
                >
                  <Trash2 size={13} />
                  <span className="hidden sm:inline">Clear all</span>
                </button>
              )}

              <Link
                href="/admin"
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold text-[color:var(--text-faint)] transition hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)]"
                onClick={() => setOpen(false)}
                title="View all in dashboard"
              >
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>

          {/* ── Items ── */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="grid gap-2 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-[calc(var(--radius)*0.75)] bg-[color:var(--surface-soft)]" />
                ))}
              </div>
            ) : !data || data.items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Bell size={24} className="text-[color:var(--text-faint)]" />
                <p className="text-sm font-semibold text-[color:var(--text-muted)]">
                  {data?.totalRead && data.totalRead > 0 ? "All notifications read" : "No new notifications"}
                </p>
                <p className="text-xs text-[color:var(--text-faint)]">
                  {data?.totalRead && data.totalRead > 0
                    ? "Clear read notifications to free up space."
                    : "Leads, messages, and chat handovers will appear here."}
                </p>
              </div>
            ) : (
              <div className="grid divide-y divide-[color:var(--border-subtle)]">
                {data.items.map((item) => {
                  const config = typeConfig[item.type];
                  const Icon = config.icon;
                  const isDismissing = dismissing.has(item.id);

                  return (
                    <div
                      key={item.id}
                      className="group relative grid grid-cols-[1fr_auto] transition hover:bg-[color:var(--surface-soft)]"
                    >
                      <Link
                        href={item.href}
                        onClick={(e) => handleItemClick(e, item)}
                        className="grid gap-1.5 px-4 py-3"
                        aria-label={`${config.label}: ${item.title}`}
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
                          </div>
                        </div>
                        <p className="truncate text-sm font-bold text-[color:var(--text-strong)]">{item.title}</p>
                        <p className="line-clamp-1 text-xs text-[color:var(--text-muted)]">{item.detail}</p>
                      </Link>

                      {/* Dismiss button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(item.id);
                        }}
                        disabled={isDismissing}
                        className={cn(
                          "flex items-center justify-center self-stretch px-3 text-[color:var(--text-faint)] opacity-0 transition group-hover:opacity-100 hover:text-[color:var(--text-strong)] hover:bg-[color:var(--surface)]",
                          isDismissing && "opacity-100"
                        )}
                        aria-label={`Dismiss ${config.label.toLowerCase()} notification`}
                      >
                        {isDismissing ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <X size={14} />
                        )}
                      </button>
                    </div>
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
