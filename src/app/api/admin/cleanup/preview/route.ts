import { NextResponse } from "next/server";
import { countActivity, preservedResources } from "@/lib/activity-cleanup";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  return NextResponse.json({ counts: await countActivity(), preserved: preservedResources });
}
