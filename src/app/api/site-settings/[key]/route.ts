import { Prisma } from "@/generated/prisma/client";
import { notFound, ok, parseJson, serverError, validationError } from "@/lib/api";
import { invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { siteSettingUpdateSchema } from "@/lib/validation/content";
import { z } from "zod";

type RouteContext = { params: Promise<{ key: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { key } = await context.params;
    const setting = await db.siteSetting.findUnique({ where: { key } });

    if (!setting) return notFound("Site setting not found");
    return ok(setting);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { key } = await context.params;
    const data = await parseJson(request, siteSettingUpdateSchema);
    const setting = await db.siteSetting.update({
      where: { key },
      data: { value: data.value as Prisma.InputJsonValue }
    });
    await invalidateTag(tags.settings);
    await invalidateTag(tags.dashboard);
    return ok(setting);
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { key } = await context.params;
    await db.siteSetting.delete({ where: { key } });
    await invalidateTag(tags.settings);
    await invalidateTag(tags.dashboard);
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
