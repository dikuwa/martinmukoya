import { ok, serverError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { computeOutstanding, sumActivePayments } from "@/lib/financial";
import { runPaymentTransaction } from "@/lib/payment-transaction";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const { id } = await context.params;

    return ok(await runPaymentTransaction(async tx => {
      const payment = await tx.payment.findUnique({ where: { id } });
      if (!payment || payment.reversedAt) throw new Error("Payment is already reversed or missing.");

      const reversedAt = new Date();
      await tx.payment.update({ where: { id }, data: { reversedAt } });
      if (payment.receiptDocumentId) {
        await tx.sharedDocument.updateMany({
          where: { financialDocumentId: payment.receiptDocumentId },
          data: { shareEnabled: false, expiresAt: reversedAt },
        });
        await tx.financialDocument.update({
          where: { id: payment.receiptDocumentId },
          data: { status: "VOID", voidedAt: reversedAt, shareRevokedAt: reversedAt },
        });
      }
      if (payment.invoiceId) {
        const invoice = await tx.financialDocument.findUnique({
          where: { id: payment.invoiceId },
          include: { payments: { where: { reversedAt: null } } },
        });
        if (invoice && invoice.status !== "VOID") {
          const paid = sumActivePayments(invoice.payments);
          const status = paid <= 0 ? "ISSUED" : computeOutstanding(invoice.total, paid) < 0.001 ? "PAID" : "PARTIALLY_PAID";
          await tx.financialDocument.update({ where: { id: invoice.id }, data: { status } });
        }
      }
      return { reversed: true };
    }));
  } catch (error) {
    return serverError(error);
  }
}
