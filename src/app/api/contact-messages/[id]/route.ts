import { notFound, ok, parseJson, serverError, validationError } from "@/lib/api";
import { invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { contactMessageUpdateSchema } from "@/lib/validation/content";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const message = await db.contactMessage.findUnique({ where: { id } });

    if (!message) return notFound("Contact message not found");
    return ok(message);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const data = await parseJson(request, contactMessageUpdateSchema);
    const message = await db.contactMessage.update({ where: { id }, data });
    await invalidateTag(tags.contactMessages);
    await invalidateTag(tags.dashboard);
    return ok(message);
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await db.contactMessage.delete({ where: { id } });
    await invalidateTag(tags.contactMessages);
    await invalidateTag(tags.dashboard);
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
