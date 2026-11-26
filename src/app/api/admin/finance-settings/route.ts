import { ok, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { getIssuerSnapshot } from "@/lib/finance-service";
import { z } from "zod";
import { normalizeFinanceSiteReference } from "@/lib/validation/finance";

const schema = z.object({
  name: z.string().min(1),
  logo: z.string().min(1),
  address: z.string(),
  phone: z.string(),
  email: z.string().email(),
  registration: z.string(),
  taxNumber: z.string(),
  bankName: z.string(),
  accountName: z.string(),
  accountNumber: z.string(),
  branch: z.string(),
  swiftCode: z.string(),
  companyDetails: z.string(),
  paymentMethods: z.array(z.string().trim().min(1)).max(12),
  paymentInstructions: z.string(),
  signerName: z.string().min(1),
  signerTitle: z.string(),
  signatureMode: z.enum(["text", "image"]),
  signatureImage: z.string(),
  showSignature: z.boolean(),
});

async function selectedSiteId(request: Request) {
  const reference = normalizeFinanceSiteReference(new URL(request.url).searchParams.get("site"));
  if (!reference) return null;
  const slug = reference === "personal" ? "martin-mukoya" : reference;
  const site = await db.site.findFirst({ where: { OR: [{ id: reference }, { slug }] }, select: { id: true } });
  return site?.id;
}

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const siteId = await selectedSiteId(request);
    if (siteId === undefined) return Response.json({ error: "Site not found." }, { status: 400 });
    return ok({ issuer: await getIssuerSnapshot(siteId) });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const siteId = await selectedSiteId(request);
    if (siteId === undefined) return Response.json({ error: "Site not found." }, { status: 400 });
    const data = await parseJson(request, schema);
    await db.$transaction(async (tx) => {
      for (const [key, value] of Object.entries(data)) {
        const settingKey = `finance.${key}`;
        const storedValue = Array.isArray(value) ? JSON.stringify(value) : String(value);
        const existing = await tx.siteSetting.findFirst({ where: { siteId, key: settingKey } });
        if (existing) await tx.siteSetting.update({ where: { id: existing.id }, data: { value: storedValue } });
        else await tx.siteSetting.create({ data: { siteId, key: settingKey, value: storedValue } });
      }
    });
    return ok({ saved: true, allDocumentsUpdated: false });
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}
