import { NextResponse } from "next/server";
import { z } from "zod";
import { CLEANUP_CONFIRMATION } from "@/lib/activity-cleanup";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";

const requestSchema = z.object({
  runId: z.string().min(1),
  confirmation: z.literal(CLEANUP_CONFIRMATION)
});

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: `Type ${CLEANUP_CONFIRMATION} exactly.` }, { status: 400 });

    const result = await db.$transaction(async (tx) => {
      const runs = await tx.$queryRaw<Array<{ id: string; adminId: string; status: string; cutoffAt: Date; expiresAt: Date }>>`
        SELECT "id", "adminId", "status", "cutoffAt", "expiresAt"
        FROM "CleanupRun" WHERE "id" = ${parsed.data.runId} FOR UPDATE
      `;
      const run = runs[0];
      if (!run || run.adminId !== session!.user.id) throw new Error("INVALID_RUN");
      if (run.status !== "EXPORTED") throw new Error("USED_RUN");
      if (run.expiresAt <= new Date()) throw new Error("EXPIRED_RUN");
      await tx.$executeRaw`UPDATE "CleanupRun" SET "status" = 'RUNNING' WHERE "id" = ${run.id}`;
      const createdAt = { lte: run.cutoffAt };
      const chatMessages = await tx.chatMessage.deleteMany({ where: { createdAt } });
      const chatSessions = await tx.chatSession.deleteMany({
        where: { createdAt, messages: { none: { createdAt: { gt: run.cutoffAt } } } }
      });
      const notifications = await tx.notification.deleteMany({ where: { createdAt } });
      const analyticsEvents = await tx.analyticsEvent.deleteMany({ where: { createdAt } });
      const contactMessages = await tx.contactMessage.deleteMany({ where: { createdAt } });
      const leads = await tx.lead.deleteMany({ where: { createdAt } });
      const counts = {
        leads: leads.count, contactMessages: contactMessages.count,
        chatSessions: chatSessions.count, chatMessages: chatMessages.count,
        analyticsEvents: analyticsEvents.count, notifications: notifications.count
      };
      await tx.$executeRaw`
        UPDATE "CleanupRun" SET "status" = 'COMPLETED', "deletedCounts" = ${JSON.stringify(counts)}::jsonb, "completedAt" = NOW()
        WHERE "id" = ${run.id}
      `;
      return { runId: run.id, cutoffAt: run.cutoffAt, counts };
    }, { timeout: 30_000 });
    return NextResponse.json({ ...result, preserved: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "INVALID_RUN") return NextResponse.json({ error: "This backup run does not belong to the current administrator." }, { status: 404 });
    if (message === "USED_RUN") return NextResponse.json({ error: "This backup has already been used for cleanup." }, { status: 409 });
    if (message === "EXPIRED_RUN") return NextResponse.json({ error: "This backup expired. Download a fresh backup before cleaning up." }, { status: 410 });
    console.error("[cleanup/execute] Error:", error);
    return NextResponse.json({ error: "Cleanup failed. No partial cleanup was committed." }, { status: 500 });
  }
}
