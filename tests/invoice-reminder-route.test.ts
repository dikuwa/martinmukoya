import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import { invoiceReminderDetails } from "../src/lib/reminder";

const nativeRequire = createRequire(import.meta.url);
const routeSource = ts.transpileModule(
  readFileSync("src/app/api/admin/invoice-reminders/route.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } },
).outputText;

function loadRoute(options: {
  invoice?: Record<string, unknown> | null;
  deniedStatus?: number;
}) {
  const calls: { lookedUp: number; created: Record<string, unknown>[] } = { lookedUp: 0, created: [] };
  const exports: Record<string, (request: Request) => Promise<Response>> = {};
  const invoice = options.invoice === undefined ? {
    id: "synthetic-invoice", number: "INV-TEST-1", customerName: "Synthetic Customer",
    total: 350, type: "INVOICE", status: "PARTIALLY_PAID",
    customerEmail: "client@example.invalid", customerPhone: null,
    payments: [{ amount: 100, reversedAt: null }],
    booking: { contact: { whatsAppNumber: "+264811111111" }, lead: null },
  } : options.invoice;
  const dependencies: Record<string, unknown> = {
    "@/lib/auth-guard": {
      requireAdmin: async () => options.deniedStatus
        ? { error: Response.json({ error: "Forbidden" }, { status: options.deniedStatus }) }
        : { error: null },
    },
    "@/lib/db": {
      db: {
        financialDocument: { findUnique: async () => { calls.lookedUp++; return invoice; } },
        invoiceReminder: { create: async ({ data }: { data: Record<string, unknown> }) => {
          calls.created.push(data);
          return { id: "synthetic-reminder", ...data };
        } },
      },
    },
    "@/lib/reminder": { invoiceReminderDetails },
    "@/lib/api": {
      created: (value: unknown) => Response.json(value, { status: 201 }),
      validationError: (error: { issues: unknown }) => Response.json({ error: "Validation failed", issues: error.issues }, { status: 400 }),
      serverError: (error: unknown) => { throw error; },
    },
  };
  const require = (name: string) => name in dependencies ? dependencies[name] : nativeRequire(name);
  vm.runInNewContext(routeSource, { exports, require, Request, Response, URL, console });
  const post = (body: Record<string, unknown> = { invoiceId: "synthetic-invoice", channel: "COPY", message: "Test payment reminder" }) =>
    exports.POST(new Request("https://example.invalid/api/admin/invoice-reminders", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
    }));
  return { post, calls };
}

for (const status of [401, 403]) {
  test(`reminder API refuses ${status} without querying customer financial data`, async () => {
    const { post, calls } = loadRoute({ deniedStatus: status });
    assert.equal((await post()).status, status);
    assert.equal(calls.lookedUp, 0);
    assert.deepEqual(calls.created, []);
  });
}

for (const [name, invoice] of [
  ["missing invoice", null],
  ["draft invoice", { type: "INVOICE", status: "DRAFT" }],
  ["quotation", { type: "QUOTATION", status: "ISSUED" }],
  ["fully settled invoice", { status: "PARTIALLY_PAID", payments: [{ amount: 350, reversedAt: null }] }],
] as const) {
  test(`reminder API rejects ${name} without logging a reminder`, async () => {
    const base = {
      id: "synthetic-invoice", number: "INV-TEST-1", customerName: "Synthetic Customer",
      total: 350, type: "INVOICE", status: "PARTIALLY_PAID", customerEmail: "client@example.invalid",
      customerPhone: null, payments: [{ amount: 100, reversedAt: null }],
      booking: { contact: { whatsAppNumber: "+264811111111" }, lead: null },
    };
    const { post, calls } = loadRoute({ invoice: invoice ? { ...base, ...invoice } : null });
    assert.equal((await post()).status, 400);
    assert.equal(calls.lookedUp, 1);
    assert.equal(calls.created.length, 0);
  });
}

test("reminder API rejects WhatsApp requests without a customer number", async () => {
  const { post, calls } = loadRoute({ invoice: {
    id: "synthetic-invoice", number: "INV-TEST-1", customerName: "Synthetic Customer",
    total: 350, type: "INVOICE", status: "PARTIALLY_PAID",
    customerEmail: null, customerPhone: null, payments: [{ amount: 100 }],
    booking: { contact: null, lead: null },
  } });
  assert.equal((await post({ invoiceId: "synthetic-invoice", channel: "WHATSAPP", message: "Test payment reminder" })).status, 400);
  assert.equal(calls.created.length, 0);
});

test("reminder API logs COPY preparation for partially paid invoice without claiming delivery", async () => {
  const { post, calls } = loadRoute({});
  const response = await post();
  assert.equal(response.status, 201);
  assert.equal(calls.lookedUp, 1);
  assert.equal(calls.created.length, 1);
  assert.deepEqual({ ...calls.created[0] }, {
    invoiceId: "synthetic-invoice", channel: "COPY", destination: null, message: "Test payment reminder",
  });
});

test("reminder API resolves the verified WhatsApp destination for an outstanding invoice", async () => {
  const { post, calls } = loadRoute({});
  const response = await post({ invoiceId: "synthetic-invoice", channel: "WHATSAPP", message: "Test payment reminder" });
  assert.equal(response.status, 201);
  assert.equal(calls.created.length, 1);
  assert.equal(calls.created[0].destination, "+264811111111");
});
