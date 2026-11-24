import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const nativeRequire = createRequire(import.meta.url);
const routePath = "src/app/api/admin/documents/[id]/void/route.ts";

type DocumentRow = { id: string; type: "INVOICE" | "RECEIPT"; status: string; payments: unknown[] };

function loadRoute(input: { document: DocumentRow; activeReceiptPayment?: boolean; forbidden?: boolean }) {
  const changes: string[] = [];
  let receiptLookup: { receiptDocumentId: string; reversedAt: null } | undefined;
  const tx = {
    financialDocument: {
      findUnique: async () => input.document,
      update: async () => {
        changes.push("document");
        return { status: "VOID" };
      },
    },
    payment: {
      findFirst: async ({ where }: { where: { receiptDocumentId: string; reversedAt: null } }) => {
        receiptLookup = where;
        return input.activeReceiptPayment ? { id: "active-payment" } : null;
      },
    },
    sharedDocument: {
      updateMany: async () => {
        changes.push("sharing");
        return { count: 1 };
      },
    },
  };
  const source = readFileSync(routePath, "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const exports: Record<string, (request: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>> = {};
  const dependencies: Record<string, unknown> = {
    "@/lib/api": {
      ok: (value: unknown) => Response.json(value),
      serverError: () => Response.json({ error: "Internal error" }, { status: 500 }),
    },
    "@/lib/auth-guard": {
      requireAdmin: async () => input.forbidden
        ? { error: Response.json({ error: "Forbidden" }, { status: 403 }) }
        : { error: null },
    },
    "@/lib/payment-transaction": {
      runPaymentTransaction: async (fn: (client: typeof tx) => Promise<Response>) => fn(tx),
    },
  };
  const require = (name: string) =>
    name in dependencies ? dependencies[name] : nativeRequire(name);
  vm.runInNewContext(code, { exports, require, Response, console });
  return {
    changes,
    get receiptLookup() { return receiptLookup; },
    request: () => exports.POST(
      new Request("https://example.test/api/admin/documents/receipt/void", { method: "POST" }),
      { params: Promise.resolve({ id: input.document.id }) },
    ),
  };
}

test("active invoice payment blocks voiding the invoice", async () => {
  const harness = loadRoute({ document: { id: "invoice", type: "INVOICE", status: "PARTIALLY_PAID", payments: [{}] } });
  assert.equal((await harness.request()).status, 409);
  assert.deepEqual(harness.changes, []);
});

test("active payment blocks direct receipt void without touching sharing or document", async () => {
  const harness = loadRoute({
    document: { id: "receipt", type: "RECEIPT", status: "PAID", payments: [] },
    activeReceiptPayment: true,
  });
  const result = await harness.request();
  assert.equal(result.status, 409);
  assert.match((await result.json()).error, /reverse the recorded payment/i);
  assert.equal(harness.receiptLookup?.receiptDocumentId, "receipt");
  assert.equal(harness.receiptLookup?.reversedAt, null);
  assert.deepEqual(harness.changes, []);
});

test("unlinked receipt follows existing standalone void policy", async () => {
  const harness = loadRoute({ document: { id: "standalone", type: "RECEIPT", status: "PAID", payments: [] } });
  assert.equal((await harness.request()).status, 200);
  assert.equal(harness.receiptLookup?.receiptDocumentId, "standalone");
  assert.equal(harness.receiptLookup?.reversedAt, null);
  assert.deepEqual(harness.changes, ["sharing", "document"]);
});

test("non-admin cannot query or void an active receipt", async () => {
  const harness = loadRoute({
    document: { id: "receipt", type: "RECEIPT", status: "PAID", payments: [] },
    activeReceiptPayment: true,
    forbidden: true,
  });
  assert.equal((await harness.request()).status, 403);
  assert.equal(harness.receiptLookup, undefined);
  assert.deepEqual(harness.changes, []);
});
