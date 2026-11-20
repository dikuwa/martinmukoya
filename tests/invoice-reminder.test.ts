import test from "node:test";
import assert from "node:assert/strict";
import { invoiceReminderDetails } from "../src/lib/reminder";

test("reminder includes outstanding amount after partial payments", () => {
  const result = invoiceReminderDetails({
    number: "INV-2026-001", customerName: "Example Customer", total: 3500,
    payments: [{ amount: 2000 }],
  });
  assert.equal(result.paid, 2000);
  assert.equal(result.balance, 1500);
  assert.match(result.message, /1,500\.00/);
  assert.match(result.message, /INV-2026-001/);
});
test("reversed payments are excluded from reminders", () => {
  const result = invoiceReminderDetails({
    number: "INV-2026-002", customerName: "Customer", total: 1000,
    payments: [{ amount: 900, reversedAt: new Date() }, { amount: 100 }],
  });
  assert.equal(result.balance, 900);
});
test("fully paid balance is zero", () => {
  assert.equal(invoiceReminderDetails({
    number: "INV-2026-003", customerName: "Customer", total: 500,
    payments: [{ amount: 500 }],
  }).balance, 0);
});