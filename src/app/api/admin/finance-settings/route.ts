import { ok, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { defaultIssuer, personalIssuer, type IssuerSnapshot } from "@/lib/finance-service";
import type { Prisma } from "@/generated/prisma/client";
import { z } from "zod";

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
  signerTitle: z.string().min(1),
  signatureMode: z.enum(["text", "image"]),
  signatureImage: z.string(),
  showSignature: z.boolean(),
});

function getSiteId(site: string | null): string | null {
  if (!site || site === "global") return null;
  if (site === "personal" || site === "martin-mukoya") return "personal";
  return site;
}

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const url = new URL(request.url);
    const site = url.searchParams.get("site");
    const siteId = getSiteId(site);

    const isPersonal = siteId === "personal";
    const baseIssuer = isPersonal ? personalIssuer : defaultIssuer;

    const settings = await db.siteSetting.findMany({
      where: {
        OR: [
          { siteId: null, key: { startsWith: "finance." } },
          ...(siteId && siteId !== "personal" ? [{ siteId, key: { startsWith: "finance." } }] : []),
        ],
      },
    });

    const values = Object.fromEntries(settings.map((setting) => [setting.key.slice(8), setting.value]));

    let paymentMethods = baseIssuer.paymentMethods;
    if (typeof values.paymentMethods === "string") {
      try {
        const parsed = JSON.parse(values.paymentMethods);
        if (Array.isArray(parsed)) paymentMethods = parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
      } catch { }
    }
    const showSignature = values.showSignature === undefined ? baseIssuer.showSignature : values.showSignature === "true";

    const issuer = { ...baseIssuer, ...values, paymentMethods, showSignature } as IssuerSnapshot;
    return ok({ issuer });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const url = new URL(request.url);
    const site = url.searchParams.get("site");
    const siteId = getSiteId(site);

    const data = await parseJson(request, schema);
    const snapshot: IssuerSnapshot = {
      ...(siteId === "personal" ? personalIssuer : defaultIssuer),
      ...data,
    };

    await db.$transaction(async (tx) => {
      for (const [key, value] of Object.entries(data)) {
        const settingKey = `finance.${key}`;
        const storedValue = Array.isArray(value) ? JSON.stringify(value) : String(value);
        const existing = await tx.siteSetting.findFirst({ where: { siteId, key: settingKey } });
        if (existing) await tx.siteSetting.update({ where: { id: existing.id }, data: { value: storedValue } });
        else await tx.siteSetting.create({ data: { siteId, key: settingKey, value: storedValue } });
      }
      const whereSiteId = siteId ?? undefined;
      await tx.financialDocument.updateMany({
        where: { siteId: whereSiteId },
        data: { issuerSnapshot: snapshot as Prisma.InputJsonValue },
      });
    });

    return ok({ saved: true, allDocumentsUpdated: true });
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}