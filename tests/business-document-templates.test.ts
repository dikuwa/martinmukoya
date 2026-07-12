import test from "node:test";
import assert from "node:assert/strict";
import { buildDocumentTemplateContext, findUnresolvedPlaceholders, formatDocumentDate, resolveTemplatePlaceholders } from "../src/lib/business-document-templates";

test("resolves simple, whitespace, nested, and repeated placeholders", () => {
  const context = { client_name: "Martin Mukoya", business_name: "FlexTech Media", sender: { name: "Martin Mukoya", role: "Managing Director" } };
  assert.equal(resolveTemplatePlaceholders("Hello {{client_name}} / {{ client_name }}", context), "Hello Martin Mukoya / Martin Mukoya");
  assert.equal(resolveTemplatePlaceholders("Prepared by {{sender.name}} – {{sender.role}}", context), "Prepared by Martin Mukoya – Managing Director");
  assert.equal(resolveTemplatePlaceholders("{{business_name}} for {{client_name}}. Thanks, {{client_name}}.", context), "FlexTech Media for Martin Mukoya. Thanks, Martin Mukoya.");
});

test("preserves missing, empty, null, and non-scalar values", () => {
  const output = resolveTemplatePlaceholders("{{missing}} {{empty}} {{nil}} {{object}}", { empty: "", nil: null, object: {} });
  assert.equal(output, "{{missing}} {{empty}} {{nil}} {{object}}");
  assert.doesNotMatch(output, /undefined|null/);
});

test("formats valid dates and leaves invalid dates unresolved through the context", () => {
  assert.equal(formatDocumentDate("2026-07-12"), "12 July 2026");
  assert.equal(formatDocumentDate("not-a-date"), "");
  const context = buildDocumentTemplateContext({ values: { issueDate: "not-a-date" } });
  assert.equal(resolveTemplatePlaceholders("Issued {{issue_date}}", context), "Issued {{issue_date}}");
});

test("detects each unresolved placeholder once", () => {
  assert.deepEqual(findUnresolvedPlaceholders("{{client_name}} {{ client_name }} {{valid_until}}"), ["client_name", "valid_until"]);
});

test("form recipient values override linked lead values and project data is normalised", () => {
  const context = buildDocumentTemplateContext({
    values: { recipientName: "Manual Name", recipientEmail: "manual@example.com" },
    lead: { name: "Old Name", email: "old@example.com", company: "Lead Co" },
    project: { title: "Catering website", description: "A modern catering site" },
  });
  assert.equal(context.client_name, "Manual Name");
  assert.equal(context.client_email, "manual@example.com");
  assert.equal(context.client_company, "Lead Co");
  assert.equal(context.project_name, "Catering website");
  assert.equal((context.project as Record<string, unknown>).description, "A modern catering site");
});
