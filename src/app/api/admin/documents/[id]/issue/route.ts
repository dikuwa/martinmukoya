import { ok, serverError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { issueDocument } from "@/lib/finance-service";
type Context = { params: Promise<{ id: string }> };
export async function POST(_request: Request, context: Context) {
  try { const { error } = await requireAdmin(); if (error) return error; return ok(await issueDocument((await context.params).id)); }
  catch (error) { return serverError(error); }
}

