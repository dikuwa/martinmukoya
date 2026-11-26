import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export class PaymentBalanceConflict extends Error {}

export function isTransactionConflict(error: unknown) {
  const adapterConflict = error instanceof Error && error.name === "DriverAdapterError" &&
    typeof error.cause === "object" && error.cause !== null &&
    "kind" in error.cause && error.cause.kind === "TransactionWriteConflict";
  return adapterConflict || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034");
}

export async function runPaymentTransaction<T>(operation: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await db.$transaction(operation, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      // PrismaPg can surface a commit-time serialization failure directly from the adapter.
      if (attempt >= 3 || !isTransactionConflict(error)) {
        throw error;
      }
    }
  }
}
