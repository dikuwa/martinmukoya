import test from "node:test";
import assert from "node:assert/strict";
import { computeOutstanding, paymentSettlesInvoice, sumActivePayments } from "../src/lib/financial";

// Sample project: a N$3,000 invoice, the client pays a N$2,000 deposit.

test("a deposit leaves the rest of the invoice outstanding", () => {
  const total = 3000;
  const deposit = 2000;
  const paid = sumActivePayments([{ amount: deposit }]);

  assert.equal(paid, 2000);
  assert.equal(computeOutstanding(total, paid), 1000);
  assert.equal(paymentSettlesInvoice(total, 0, deposit), false);
});

test("the settling payment clears the outstanding balance", () => {
  const total = 3000;
  const paidBeforeDepositSettles = 2000;
  const finalPayment = 1000;

  assert.equal(paymentSettlesInvoice(total, paidBeforeDepositSettles, finalPayment), true);
  assert.equal(computeOutstanding(total, paidBeforeDepositSettles + finalPayment), 0);
});

test("a payment equal to the full invoice settles it in one go", () => {
  // The real case from production: a N$350 deposit invoice paid in full.
  assert.equal(paymentSettlesInvoice(350, 0, 350), true);
  assert.equal(computeOutstanding(350, 350), 0);
});

test("several partial payments accumulate toward settlement", () => {
  const total = 3000;
  const payments = [{ amount: 2000 }, { amount: 500 }];
  const paid = sumActivePayments(payments);

  assert.equal(paid, 2500);
  assert.equal(computeOutstanding(total, paid), 500);
  assert.equal(paymentSettlesInvoice(total, paid, 500), true);
});

test("reversed payments are not counted as paid", () => {
  const payments = [{ amount: 2000 }, { amount: 500, reversedAt: new Date() }];
  assert.equal(sumActivePayments(payments), 2000);
});

test("outstanding never reports a negative balance", () => {
  assert.equal(computeOutstanding(1000, 1200), 0);
});

test("settlement is exact to the cent", () => {
  assert.equal(paymentSettlesInvoice("1000.00", "333.33", "666.67"), true);
  assert.equal(paymentSettlesInvoice("1000.00", "333.33", "666.66"), false);
});

// Booking-level contract: deposits reduce one outstanding project balance.

test("a deposit against a project contract reduces the project outstanding", () => {
  const contract = 3000;
  const paid = sumActivePayments([{ amount: 2000 }]);

  assert.equal(computeOutstanding(contract, paid), 1000);
  assert.equal(paymentSettlesInvoice(contract, paid, 1000), true);
});

test("the project outstanding reaches zero once the balance is paid", () => {
  const contract = 3000;
  const paid = sumActivePayments([{ amount: 2000 }, { amount: 1000 }]);

  assert.equal(paid, 3000);
  assert.equal(computeOutstanding(contract, paid), 0);
});

test("a reversed deposit is added back to the project outstanding", () => {
  const contract = 3000;
  const payments = [{ amount: 2000, reversedAt: new Date() }];

  assert.equal(computeOutstanding(contract, sumActivePayments(payments)), 3000);
});
