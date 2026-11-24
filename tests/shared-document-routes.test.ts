import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import * as access from "../src/lib/shared-document-access";

const realRequire = createRequire(import.meta.url);
const financial = { id: "synthetic", type: "QUOTE", status: "ISSUED", shareRevokedAt: null, voidedAt: null, number: "TEST", total: 10, payments: [] };
const active = { id: "share-test", shortCode: "x".repeat(32), shareEnabled: true, expiresAt: null, documentType: "financial", financialDocumentId: financial.id, financialDocument: financial };

function loadRoute(path: string, share: unknown, file?: string) {
 const calls: string[] = [];
 const db = {
  sharedDocument: { findUnique: async () => share, updateMany: async () => { calls.push("share revoke"); }, update: async () => { calls.push("share update"); } },
  financialDocument: { findUnique: async () => financial, update: async () => { calls.push("financial update"); return financial; } },
  payment: { findUnique: async () => ({ id: "payment", reversedAt: null, receiptDocumentId: "synthetic", invoiceId: null }), update: async () => { calls.push("payment reverse"); } },
  notification: { create: async () => ({}) },
 };
 const transactionalDb = { ...db, $transaction: async (action: (tx: typeof db) => Promise<unknown>) => { calls.push("transaction start"); const result = await action(db); calls.push("transaction end"); return result; } };
 const exports: Record<string, (...args: unknown[]) => Promise<Response>> = {};
 const source = ts.transpileModule(readFileSync(new URL(file ?? `../src/app/api/documents/share/[code]/${path}`, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
 vm.runInNewContext(source, { exports, Response, URL, Uint8Array, console, require: (name: string) => {
  if (name === "next/server") return { NextResponse: Response };
  if (name === "@/lib/db") return { db: transactionalDb };
  if (name === "@/lib/payment-transaction") return { runPaymentTransaction: transactionalDb.$transaction };
  if (name === "@/lib/auth-guard") return { requireAdmin: async () => ({}) };
  if (name === "@/lib/api") return { ok: (data: unknown) => Response.json(data), serverError: () => Response.json({}, { status: 500 }) };
  if (name === "@/lib/shared-document-access") return access;
  if (name === "@/lib/rate-limit") return { getClientIp: () => "test", rateLimit: async () => ({ success: true }) };
  if (name === "@react-pdf/renderer") return { renderToBuffer: async () => new Uint8Array([1]) };
  if (name.startsWith("@/lib/pdf/")) return { FinancialPdf: () => null, BusinessDocumentPdf: () => null };
  if (name === "@/lib/business-document-service") return { trackSharedDocumentView: async () => {}, trackSharedDocumentDownload: async () => {}, acceptBusinessDocument: async () => { calls.push("accept"); }, declineBusinessDocument: async () => { calls.push("decline"); } };
  if (name === "@/lib/finance-service") return { acceptFinancialDocument: async () => { calls.push("accept"); }, declineFinancialDocument: async () => { calls.push("decline"); } };
  return realRequire(name);
 } });
 return { exports, calls };
}

for (const [path, method] of [["route.ts", "GET"], ["download/route.tsx", "GET"], ["accept/route.ts", "POST"], ["decline/route.ts", "POST"]]) {
 test(`public ${path} rejects revoked/void/old links before actions and accepts active synthetic link`, async () => {
  for (const share of [null, { ...active, shareEnabled: false }, { ...active, shortCode: "old1234" }, { ...active, financialDocument: { ...financial, status: "VOID" } }, { ...active, financialDocument: { ...financial, shareRevokedAt: new Date() } }, { ...active, documentType: "business", businessDocument: { status: "SENT", revokedAt: new Date() } }]) {
   const route = loadRoute(path, share);
   const response = await route.exports[method](new Request("https://example.com/test", { method, ...(method === "POST" ? { body: JSON.stringify({ name: "Synthetic", reason: "Test" }) } : {}) }), { params: Promise.resolve({ code: active.shortCode }) });
   assert.equal(response.status, 404);
   assert.deepEqual(route.calls, []);
  }
  const route = loadRoute(path, active);
  const response = await route.exports[method](new Request("https://example.com/test", { method, ...(method === "POST" ? { body: JSON.stringify({ name: "Synthetic", reason: "Test" }) } : {}) }), { params: Promise.resolve({ code: active.shortCode }) });
  assert.equal(response.status, 200);
 });
}

for (const file of ["../src/app/api/admin/documents/[id]/void/route.ts", "../src/app/api/admin/payments/[id]/reverse/route.ts"]) {
 test(`${file} revokes share inside the financial state transaction`, async () => {
  const route = loadRoute("", null, file);
  const response = await route.exports.POST(new Request("https://example.com/test", { method: "POST" }), { params: Promise.resolve({ id: "synthetic" }) });
  assert.equal(response.status, 200);
  assert.equal(route.calls[0], "transaction start");
  assert.equal(route.calls.at(-1), "transaction end");
  assert.ok(route.calls.indexOf("share revoke") > 0);
  assert.ok(route.calls.indexOf("financial update") > route.calls.indexOf("share revoke"));
 });
}

test("regeneration and revocation retire legacy financial credentials within the share transaction", async () => {
 for (const action of ["regenerateShareLink", "revokeShareLink"]) {
  const changes: Array<{ kind: string; data?: Record<string, unknown> }> = [];
  const tx = {
   sharedDocument: { findUnique: async () => active, update: async ({ data }: { data: Record<string, unknown> }) => { changes.push({ kind: "share", data }); return { ...active, ...data }; } },
   financialDocument: { findUnique: async () => financial, update: async ({ data }: { data: Record<string, unknown> }) => { changes.push({ kind: "financial", data }); return financial; } },
  };
  const exports: Record<string, (code: string) => Promise<unknown>> = {};
  const source = ts.transpileModule(readFileSync(new URL("../src/lib/business-document-service.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { exports, require: (name: string) => {
   if (name === "@/lib/db") return { db: { $transaction: async (fn: (db: typeof tx) => Promise<unknown>) => { changes.push({ kind: "start" }); const result = await fn(tx); changes.push({ kind: "end" }); return result; } } };
   if (name === "@/lib/shared-document-access") return access;
   if (name === "crypto") return realRequire(name);
   return {};
  } });
  await exports[action](active.shortCode);
  assert.deepEqual(changes.map(item => item.kind), ["start", "financial", "share", "end"]);
  assert.equal(changes[1].data?.shareToken, null);
  if (action === "regenerateShareLink") {
   assert.match(String(changes[2].data?.shortCode), /^[\w-]{32}$/);
   assert.notEqual(changes[2].data?.shortCode, active.shortCode);
  } else assert.equal(changes[2].data?.shareEnabled, false);
 }
});
