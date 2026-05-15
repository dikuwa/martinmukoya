import { notFound, ok, serverError } from "@/lib/api";
import { invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const event = await db.analyticsEvent.findUnique({ where: { id } });

    if (!event) return notFound("Analytics event not found");
    return ok(event);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await db.analyticsEvent.delete({ where: { id } });
    await invalidateTag(tags.analytics);
    await invalidateTag(tags.dashboard);
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
