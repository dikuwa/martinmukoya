import test from "node:test";
import assert from "node:assert/strict";
import { normalizeFinanceSiteReference } from "../src/lib/validation/finance";

test("finance identity references use one canonical representation", () => {
  assert.equal(normalizeFinanceSiteReference(undefined), null);
  assert.equal(normalizeFinanceSiteReference(""), null);
  assert.equal(normalizeFinanceSiteReference(" global "), null);
  assert.equal(normalizeFinanceSiteReference(" martin-mukoya "), "personal");
  assert.equal(normalizeFinanceSiteReference("personal"), "personal");
  assert.equal(normalizeFinanceSiteReference("flextech-media"), "flextech-media");
});
