import test from "node:test";
import assert from "node:assert/strict";
import { calculateDocumentTotals } from "../src/lib/financial";
import { bookingCreateSchema, documentDraftSchema, paymentCreateSchema } from "../src/lib/validation/finance";

const draft = {
  bookingId: "synthetic-booking", type: "INVOICE" as const,
  customerName: "Synthetic Customer",
  lines: [{ description: "Synthetic job", quantity: "1", unitPrice: "19.99" }],
};

for (const [name, changes] of [
  ["line unit price", { lines: [{ description: "Synthetic job", quantity: "1", unitPrice: "19.999" }] }],
  ["line quantity", { lines: [{ description: "Synthetic job", quantity: "1.2345", unitPrice: "19.99" }] }],
  ["tax rate", { taxRate: "15.999" }],
  ["discount amount", { discountAmount: "0.001" }],
  ["additional charges", { additionalCharges: "1.001" }],
] as const) {
  test(`financial draft rejects silent precision loss in ${name}`, () => {
    const parsed = documentDraftSchema.safeParse({ ...draft, ...changes });
    assert.equal(parsed.success, false);
  });
}

test("financial draft permits extra trailing zeros without altering its amount", () => {
  const parsed = documentDraftSchema.parse({
    ...draft, lines: [{ description: "Synthetic job", quantity: "1.0000", unitPrice: "19.9900" }],
    discountAmount: "0.000", additionalCharges: "0.000", taxRate: "0.000",
  });
  assert.equal(calculateDocumentTotals(parsed).total, "19.99");
});

test("direct calculator invocation refuses excess nonzero monetary precision", () => {
  assert.throws(() => calculateDocumentTotals({
    lines: [{ description: "Synthetic job", quantity: 1, unitPrice: "19.999" }],
  }), /Too many decimal places/);
  assert.throws(() => calculateDocumentTotals({
    lines: [{ description: "Synthetic job", quantity: "1.2345", unitPrice: 19.99 }],
  }), /Too many decimal places/);
});

test("payment and booking schemas reject excess monetary precision", () => {
  assert.equal(paymentCreateSchema.safeParse({
    invoiceId: "synthetic-invoice", amount: "0.001", method: "CASH",
  }).success, false);
  assert.equal(bookingCreateSchema.safeParse({
    siteId: "synthetic-site", customerName: "Synthetic Customer",
    projectDescription: "Synthetic repair", contractAmount: "3000.001",
  }).success, false);
});

test("existing two-decimal money and three-decimal quantities remain valid", () => {
  const parsed = documentDraftSchema.parse({
    ...draft, lines: [{ description: "Synthetic job", quantity: "1.234", unitPrice: "19.99" }],
  });
  assert.equal(calculateDocumentTotals(parsed).total, "24.67");
  assert.equal(paymentCreateSchema.safeParse({
    invoiceId: "synthetic-invoice", amount: "1000.00", method: "BANK_TRANSFER",
  }).success, true);
});
