import { db } from "@/lib/db";
import { getCurrentSite } from "@/lib/sites";

// ── Types ───────────────────────────────────────────────────

export type NotificationInput = {
  siteId: string | null;
  type: "lead" | "message" | "chat";
  sourceId: string;
  title: string;
  detail: string;
  href: string;
  createdAt: Date;
};

type SyncRow = {
  siteId: string | null;
  type: string;
  sourceId: string;
  title: string;
  detail: string;
  href: string;
  createdAt: Date;
};

// ── Create ──────────────────────────────────────────────────

/**
 * Create a single notification record. Silently ignores unique
 * constraint violations (type + sourceId already exists) but
 * logs everything else so we can debug silent failures.
 */
export async function createNotification(input: NotificationInput) {
  try {
    await db.notification.create({
      data: {
        siteId: input.siteId,
        type: input.type,
        sourceId: input.sourceId,
        title: input.title,
        detail: input.detail.slice(0, 120),
        href: input.href,
        createdAt: input.createdAt,
        read: false,
      },
    });
  } catch (error) {
    // Prisma unique-constraint errors contain a code like P2002.
    // We also check the message string as a fallback for older versions.
    const isUniqueViolation =
      (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "P2002") ||
      (error instanceof Error && error.message.includes("Unique constraint"));

    if (!isUniqueViolation) {
      console.error(
        `[notifications] createNotification failed for ${input.type}:${input.sourceId}`,
        error
      );
    }
  }
}

// ── Sync ────────────────────────────────────────────────────

/**
 * Scan the database for source records (leads, messages, chat
 * handovers) that don't have a Notification row yet and create
 * them. Designed to be called from the GET endpoints so missed
 * notifications (e.g. from transient errors) are back-filled.
 */
export async function syncNotifications(siteIdOverride?: string) {
  const site = siteIdOverride
    ? await db.site.findUnique({ where: { id: siteIdOverride } })
    : await getCurrentSite();

  const siteFilter = site ? { siteId: site.id } : {};

  // Existing notification (type, sourceId) pairs for the site
  const existing = await db.notification.findMany({
    where: siteFilter,
    select: { type: true, sourceId: true },
  });

  const seen = new Set(existing.map((n) => `${n.type}:${n.sourceId}`));
  const has = (type: string, id: string) => seen.has(`${type}:${id}`);

  const rows: SyncRow[] = [];

  // Leads with status NEW
  const leads = await db.lead.findMany({
    where: { ...siteFilter, status: "NEW" },
    select: { id: true, name: true, projectGoal: true, createdAt: true },
  });
  for (const l of leads) {
    if (!has("lead", l.id)) {
      rows.push({
        siteId: site?.id ?? null,
        type: "lead",
        sourceId: l.id,
        title: l.name,
        detail: l.projectGoal.slice(0, 120),
        href: `/admin/leads/${l.id}`,
        createdAt: l.createdAt,
      });
    }
  }

  // Contact messages with status NEW
  const msgs = await db.contactMessage.findMany({
    where: { ...siteFilter, status: "NEW" },
    select: { id: true, name: true, inquiryType: true, message: true, createdAt: true },
  });
  for (const m of msgs) {
    if (!has("message", m.id)) {
      rows.push({
        siteId: site?.id ?? null,
        type: "message",
        sourceId: m.id,
        title: m.name,
        detail: `${m.inquiryType ?? "General"} — ${m.message.slice(0, 100)}`,
        href: `/admin/messages/${m.id}`,
        createdAt: m.createdAt,
      });
    }
  }

  // Chat sessions handed to human
  const chats = await db.chatSession.findMany({
    where: { ...siteFilter, handedToHuman: true },
    select: {
      id: true,
      visitorId: true,
      summary: true,
      updatedAt: true,
      lead: { select: { name: true } },
    },
  });
  for (const c of chats) {
    if (!has("chat", c.id)) {
      rows.push({
        siteId: site?.id ?? null,
        type: "chat",
        sourceId: c.id,
        title: c.lead?.name ?? c.visitorId ?? "Anonymous visitor",
        detail: c.summary?.slice(0, 120) ?? "Handed over for follow-up",
        href: `/admin/chat/${c.id}`,
        createdAt: c.updatedAt,
      });
    }
  }

  if (rows.length > 0) {
    await db.notification.createMany({ data: rows, skipDuplicates: true });
    console.log(`[notifications] syncNotifications created ${rows.length} missing notification(s)`);
  }

  return site; // return resolved site so callers can reuse it
}
