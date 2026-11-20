import { created, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { bookingNumber } from "@/lib/finance-service";
import { quickJobSchema } from "@/lib/validation/customer";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAdmin(); if (error) return error;
    const input = await parseJson(request, quickJobSchema);
    const [customer, site] = await Promise.all([
      db.contact.findUnique({ where: { id: input.customerId } }),
      db.site.findUnique({ where: { id: input.siteId } }),
    ]);
    if (!customer || !site)
      return Response.json({ error: "Customer or business identity not found" }, { status: 404 });
    return created(await db.booking.create({ data: {
      number: bookingNumber(), kind: "SERVICE", siteId: site.id, contactId: customer.id,
      customerName: customer.name, customerEmail: customer.email, customerPhone: customer.phone,
      company: customer.company, projectDescription: input.description,
      contractAmount: input.amount?.toFixed(2), createdById: session.user.id,
    } }));
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}