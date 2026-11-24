import test from "node:test";
import assert from "node:assert/strict";
import { parsePaymentAmount } from "../src/lib/financial";
import { paymentCreateSchema } from "../src/lib/validation/finance";

const valid = ["0.01", "12.34", "0001.20", "999999999.99", 12, 12.34] as const;
const invalid = ["0", 0, "-1", "-0.01", "0.001", "0.009", 0.001, 12.345, "1e-3", "1.", "", "NaN", "Infinity", Infinity, 1000000000] as const;

for (const amount of valid) {
  test(`payment amount ${String(amount)} is accepted without losing cents`, () => {
    const result = parsePaymentAmount(amount);
    assert.ok(Number.isFinite(result));
    assert.ok(result > 0);
    assert.equal(paymentCreateSchema.safeParse({ invoiceId: "invoice", amount, method: "CASH" }).success, true);
  });
}

for (const amount of invalid) {
  test(`payment amount ${String(amount)} is rejected before transaction and receipt creation`, () => {
    assert.throws(() => parsePaymentAmount(amount));
    assert.equal(paymentCreateSchema.safeParse({ invoiceId: "invoice", amount, method: "CASH" }).success, false);
  });
}

test("a tiny positive fraction cannot become a zero-value payment", () => {
  assert.throws(() => parsePaymentAmount("0.001"), /two decimal places/);
});

test("invoice and booking payments use the same precise validator", () => {
  for (const field of ["invoiceId", "bookingId"] as const) {
    assert.equal(paymentCreateSchema.safeParse({ [field]: "synthetic", amount: "0.001", method: "CARD" }).success, false);
    assert.equal(paymentCreateSchema.safeParse({ [field]: "synthetic", amount: "0.01", method: "CARD" }).success, true);
  }
});
