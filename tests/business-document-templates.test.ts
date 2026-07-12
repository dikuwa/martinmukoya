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

test("maps every saved-template client alias from form and lead values", () => {
  const context = buildDocumentTemplateContext({
    values: { recipientName: "Manual Contact" },
    lead: { name: "Lead Contact", email: "client@example.com", phone: "0852942473", company: "Client Company", address: "Windhoek" },
  });
  assert.equal(context.client_name, "Manual Contact");
  assert.equal(context.client_contact_name, "Manual Contact");
  assert.equal(context.client_email, "client@example.com");
  assert.equal(context.client_phone, "0852942473");
  assert.equal(context.client_company, "Client Company");
  assert.equal(context.client_address, "Windhoek");
  assert.equal((context.client as Record<string, unknown>).contact_name, "Manual Contact");
});

test("uses subject as project name only when no linked project exists", () => {
  const fallback = buildDocumentTemplateContext({ values: { subject: "Website redesign project" } });
  const linked = buildDocumentTemplateContext({ values: { subject: "Fallback" }, project: { title: "Linked project" } });
  assert.equal(fallback.project_name, "Website redesign project");
  assert.equal(linked.project_name, "Linked project");
});

test("maps real project fields without inventing unavailable project facts", () => {
  const context = buildDocumentTemplateContext({
    values: {},
    project: { title: "Portal", summary: "Operations overview", description: "Detailed portal", outcome: "Faster processing" },
  });
  assert.equal(context.project_overview, "Operations overview");
  assert.equal(context.expected_outcome, "Faster processing");
  assert.equal(context.project_objective, "");
  assert.equal(context.target_audience, "");
  assert.equal(context.project_scope, "");
});
