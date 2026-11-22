import type { Prisma } from "@/generated/prisma/client";

type Details = { email?: string | null; phone?: string | null; whatsAppNumber?: string | null };

function phoneKey(value?: string | null) {
  const digits = value?.replace(/\D/g, "") ?? "";
  if (digits.length < 7) return "";
  return digits.replace(/^00/, "").replace(/^0(?=\d{9}$)/, "264");
}

export async function matchingCustomers(tx: Prisma.TransactionClient, details: Details, excludeId?: string) {
  const email = details.email?.trim().toLowerCase();
  const phones = [phoneKey(details.phone), phoneKey(details.whatsAppNumber)].filter(Boolean);
  if (!email && !phones.length) return [];

  const candidates = await tx.contact.findMany({
    where: excludeId ? { id: { not: excludeId } } : {},
    select: { id: true, email: true, phone: true, whatsAppNumber: true },
  });
  return candidates.filter(candidate =>
    (email && candidate.email?.trim().toLowerCase() === email) ||
    phones.some(phone => phone === phoneKey(candidate.phone) || phone === phoneKey(candidate.whatsAppNumber))
  );
}
