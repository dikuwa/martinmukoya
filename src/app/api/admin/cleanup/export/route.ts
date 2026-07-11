import { NextResponse } from "next/server";
import { CLEANUP_RUN_TTL_MS, createActivityWorkbook } from "@/lib/activity-cleanup";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST() {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;
    const cutoffAt = new Date();
    const { buffer, counts } = await createActivityWorkbook(cutoffAt);
    const runId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + CLEANUP_RUN_TTL_MS);
    await db.$executeRaw`
      INSERT INTO "CleanupRun" ("id", "adminId", "status", "cutoffAt", "expiresAt", "exportedCounts", "createdAt")
      VALUES (${runId}, ${session!.user.id}, 'EXPORTED', ${cutoffAt}, ${expiresAt}, ${JSON.stringify(counts)}::jsonb, NOW())
    `;
    const stamp = cutoffAt.toISOString().replace(/[:.]/g, "-");
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="activity-backup-${stamp}.xlsx"`,
        "Cache-Control": "no-store",
        "X-Cleanup-Run-Id": runId,
        "X-Cleanup-Cutoff": cutoffAt.toISOString(),
        "X-Cleanup-Counts": encodeURIComponent(JSON.stringify(counts))
      }
    });
  } catch (error) {
    console.error("[cleanup/export] Error:", error);
    return NextResponse.json({ error: "Could not create the activity backup." }, { status: 500 });
  }
}
