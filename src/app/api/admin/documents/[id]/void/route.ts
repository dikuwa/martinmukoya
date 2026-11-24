import { ok, serverError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { runPaymentTransaction } from "@/lib/payment-transaction";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const { id } = await context.params;

    return await runPaymentTransaction(async tx => {
      const document = await tx.financialDocument.findUnique({
        where: { id },
        include: { payments: { where: { reversedAt: null } } },
      });
      if (!document || document.status === "DRAFT" || document.status === "VOID") {
        return Response.json({ error: "Document cannot be voided." }, { status: 409 });
      }
      if (document.payments.length) {
        return Response.json({ error: "Reverse recorded payments before voiding this invoice." }, { status: 409 });
      }
      // Receipt payments are linked via Payment.receiptDocumentId, not
      // FinancialDocument.payments (which covers invoice payments). Never
      // invalidate proof of an active payment without reversing that payment.
      if (document.type === "RECEIPT") {
        const activeReceiptPayment = await tx.payment.findFirst({
          where: { receiptDocumentId: id, reversedAt: null },
          select: { id: true },
        });
        if (activeReceiptPayment) {
          return Response.json(
            { error: "Reverse the recorded payment before voiding its receipt." },
            { status: 409 },
          );
        }
      }

      const voidedAt = new Date();
      await tx.sharedDocument.updateMany({
        where: { financialDocumentId: id },
        data: { shareEnabled: false, expiresAt: voidedAt },
      });
      return ok(await tx.financialDocument.update({
        where: { id },
        data: { status: "VOID", voidedAt, shareRevokedAt: voidedAt },
      }));
    });
  } catch (error) {
    return serverError(error);
  }
}
