import { createHash } from "node:crypto";
import { Prisma, type PaymentMethod } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { runPaymentTransaction } from "@/lib/payment-transaction";

export class PaymentIdempotencyConflict extends Error {
  constructor() {
    super("This idempotency key is already in use for another payment request.");
  }
}

export type PaymentInput = {
  amount: string | number;
  method: PaymentMethod;
  paidAt?: string | null;
  reference?: string | null;
  notes?: string | null;
  idempotencyKey?: string;
  userId?: string;
};

export function paymentIdempotency(input: PaymentInput, target: ["invoice" | "booking", string], amount: number, paidAt: Date | undefined) {
  const { idempotencyKey } = input;
  const idempotencyFingerprint = idempotencyKey ? createHash("sha256").update(JSON.stringify([
    ...target, amount.toFixed(2), input.method, paidAt?.toISOString() ?? null,
    input.reference ?? null, input.notes ?? null, input.userId ?? null,
  ])).digest("hex") : undefined;
  return { idempotencyKey, idempotencyFingerprint };
}

export async function runIdempotentPayment<T extends { idempotencyFingerprint: string | null }>(
  { idempotencyKey, idempotencyFingerprint }: ReturnType<typeof paymentIdempotency>,
  findPayment: (client: Prisma.TransactionClient, key: string) => Promise<T | null>,
  createPayment: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  async function replay(client: Prisma.TransactionClient) {
    if (!idempotencyKey) return null;
    const existing = await findPayment(client, idempotencyKey);
    // Older keyed rows have no fingerprint and cannot prove a payload match.
    if (existing && existing.idempotencyFingerprint !== idempotencyFingerprint) {
      throw new PaymentIdempotencyConflict();
    }
    return existing;
  }

  let payment: T;
  try {
    payment = await runPaymentTransaction(async tx => (await replay(tx)) ?? createPayment(tx));
  } catch (error) {
    if (!idempotencyKey || !(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
    const existing = await replay(db);
    if (!existing) throw error;
    payment = existing;
  }
  const { idempotencyFingerprint: _, ...response } = payment;
  return response;
}
