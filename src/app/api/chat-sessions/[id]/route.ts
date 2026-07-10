import { notFound, ok, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const chatSessionUpdateSchema = z.object({
  mode: z.enum(["AI", "WAITING_FOR_HUMAN", "HUMAN"]).optional(),
  summary: z.string().trim().optional()
});

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await context.params;
    const session = await db.chatSession.findUnique({
      where: { id },
      include: { lead: true, messages: { orderBy: { createdAt: "asc" } } }
    });

    if (!session) return notFound("Chat session not found");
    return ok(session);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await context.params;
    const data = await parseJson(request, chatSessionUpdateSchema);
    const session = await db.chatSession.update({ where: { id }, data });
    await invalidateTag(tags.chatSessions);
    await invalidateTag(tags.dashboard);
    return ok(session);
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await context.params;
    await db.chatSession.delete({ where: { id } });
    await invalidateTag(tags.chatSessions);
    await invalidateTag(tags.dashboard);
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
