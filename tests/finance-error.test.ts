import assert from "node:assert/strict";
import test from "node:test";
import { financeErrorMessage } from "../src/lib/finance-error";

test("shows precise finance input validation feedback", () => {
  assert.equal(
    financeErrorMessage({
      error: "Validation failed",
      issues: [{ path: ["lines", 0, "unitPrice"], message: "Enter a valid amount with at most two decimal places." }],
    }, "Unable to save"),
    "Enter a valid amount with at most two decimal places."
  );
});

test("keeps server errors when the response is not a validation failure", () => {
  assert.equal(
    financeErrorMessage({ error: "Payment cannot exceed the outstanding balance.", issues: [{ message: "Other" }] }, "Unable to save"),
    "Payment cannot exceed the outstanding balance."
  );
});

test("uses a nonempty issue and tolerates malformed API errors", () => {
  assert.equal(
    financeErrorMessage({ error: "Validation failed", issues: [null, { message: "" }, { message: "Amount is required" }] }, "Unable to save"),
    "Amount is required"
  );
  assert.equal(financeErrorMessage({ error: "Validation failed", issues: [] }, "Unable to save"), "Validation failed");
  assert.equal(financeErrorMessage({ error: "" }, "Unable to save"), "Unable to save");
  assert.equal(financeErrorMessage(null, "Unable to save"), "Unable to save");
  assert.equal(financeErrorMessage("bad payload", "Unable to save"), "Unable to save");
});
