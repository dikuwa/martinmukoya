import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { z } from "zod";
import { normalizeFinanceSiteReference } from "../src/lib/validation/finance";
import type * as Links from "../src/lib/business-document-links";
import type * as Service from "../src/lib/business-document-service";

function load<T>(file: string, modules: Record<string, unknown>): T {
  const source = readFileSync(new URL(`../src/lib/${file}.ts`, import.meta.url), "utf8");
  const exports = {};
  runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
    exports, Response, URL, require: (name: string) => modules[name] ?? {},
  });
  return exports as T;
}

const template = { id: "template", documentCategory: "PROPOSAL", defaultBodyMarkdown: "Original", updatedAt: new Date() };
function table<T>(rows: Record<string, T>) {
  return { findUnique: async ({ where }: { where: { id: string } }) => rows[where.id] ?? null };
}
const db = {
  lead: table({ lead: { siteId: "A" }, global: { siteId: null } }),
  financialDocument: table({ quote: { siteId: "B" } }),
  businessDocumentTemplate: table({ template }),
  project: table({ project: { sites: [{ id: "A" }, { id: "B" }] }, personalProject: { sites: [{ id: "B" }] } }),
  site: {
    findFirst: async ({ where }: { where: { OR: [{ id: string }] } }) => ({ id: where.OR[0].id === "personal" ? "B" : where.OR[0].id }),
    findUnique: async () => ({ id: "A" }),
  },
};
const links = load<typeof Links>("business-document-links", { "@/lib/db": { db }, "@/generated/prisma/client": { Prisma: { DbNull: "db-null" } } });
const resolve = links.resolveBusinessDocumentLinks;

test("explicit, inferred and retained identities agree with every site-owned link", async () => {
  assert.equal((await resolve({ siteId: "personal", financialDocumentId: "quote", leadId: "global" })).siteId, "B");
  assert.equal((await resolve({ financialDocumentId: "quote" })).siteId, "B");
  await assert.rejects(resolve({ leadId: "lead", financialDocumentId: "quote" }), /match the document identity/);
  const draft = { documentType: "PROPOSAL", leadId: "lead", siteId: "A" } as const;
  for (const change of [{ siteId: "B" }, { financialDocumentId: "quote" }, { siteId: null }]) {
    await assert.rejects(resolve(change, draft), /match the document identity/);
  }
  assert.equal((await resolve({ siteId: null, leadId: null }, draft)).siteId, null);
  assert.equal((await resolve({}, draft)).siteId, "A");
  assert.equal((await resolve({ siteId: "B", leadId: null }, draft)).siteId, "B");
});

test("project memberships and shared templates retain valid links and stable snapshot provenance", async () => {
  assert.equal((await resolve({ projectId: "personalProject" })).siteId, "B");
  await assert.rejects(resolve({ siteId: "A", projectId: "personalProject" }), /selected project/);
  for (const siteId of ["A", "B"]) {
    const result = await resolve({ siteId, projectId: "project", documentType: "PROPOSAL", templateId: "template" });
    assert.equal(result.templateVersion, 1);
    assert.ok(result.templateSnapshot && "defaultBodyMarkdown" in result.templateSnapshot);
    assert.equal(result.templateSnapshot.defaultBodyMarkdown, "Original");
  }
  const draft = { siteId: "A", documentType: "PROPOSAL", templateId: "template" } as const;
  assert.equal((await resolve({}, draft)).templateSnapshot, undefined);
  assert.equal((await resolve({ templateId: null }, draft)).templateVersion, null);
  await assert.rejects(resolve({ documentType: "NDA" }, draft), /not compatible/);
  for (const key of ["projectId", "templateId", "leadId", "financialDocumentId"]) {
    await assert.rejects(resolve({ [key]: "missing" }, draft), /no longer exists/);
  }
});

test("issuance freezes only business display fields and old documents retain a site-aware fallback", async () => {
  let currentName = "Personal";
  const doc = { id: "draft", documentNumber: "TEST", status: "DRAFT", documentType: "NDA", siteId: "B", updatedAt: new Date() };
  let saved: Record<string, unknown> = {};
  const service = load<typeof Service>("business-document-service", {
    "@/lib/business-document-links": links,
    "@/lib/finance-service": { getIssuerSnapshot: async (id: string) => {
      assert.equal(id, "B");
      return { name: currentName, accountNumber: "private" };
    } },
    "@/lib/db": { db: {
      businessDocument: { findUnique: async () => doc, update: async ({ data }: { data: Record<string, unknown> }) => { saved = data; return data; } },
      sharedDocument: { findFirst: async () => ({}) },
    } },
    "@/lib/shared-document-access": { businessDocumentIsPublic: () => true, newShareToken: () => "synthetic" },
  });
  await service.issueBusinessDocument("draft");
  const frozen = saved.issuerSnapshot as { name: string };
  assert.equal(frozen.name, "Personal");
  assert.equal("accountNumber" in frozen, false);
  currentName = "New issuer";
  assert.equal((await service.businessDocumentIssuer({ siteId: "B", issuerSnapshot: frozen })).name, "Personal");
  assert.equal((await service.businessDocumentIssuer({ siteId: "B", issuerSnapshot: null })).name, "New issuer");
});

test("finance settings read and write the selected site without rewriting stored documents", async () => {
  const writes: Array<string | null> = [];
  const routes = load<typeof import("../src/app/api/admin/finance-settings/route")>("../app/api/admin/finance-settings/route", {
    zod: { z },
    "@/lib/validation/finance": { normalizeFinanceSiteReference },
    "@/lib/auth-guard": { requireAdmin: async () => ({}) },
    "@/lib/finance-service": { getIssuerSnapshot: async (siteId: string | null) => ({ siteId }) },
    "@/lib/api": { ok: Response.json, parseJson: async () => ({ name: "Synthetic" }), serverError: (err: unknown) => { throw err; } },
    "@/lib/db": { db: {
      site: { findFirst: async ({ where }: { where: { OR: { slug?: string }[] } }) => where.OR.some(entry => entry.slug === "martin-mukoya") ? { id: "personal-id" } : null },
      $transaction: async (fn: (tx: unknown) => Promise<void>) => fn({ siteSetting: {
        findFirst: async () => null,
        create: async ({ data }: { data: { siteId: string | null } }) => writes.push(data.siteId),
      } }),
    } },
  });
  for (const [query, expected] of [["personal", "personal-id"], ["global", null]] as const) {
    const request = new Request(`https://example.test/settings?site=${query}`);
    assert.equal((await (await routes.GET(request)).json()).issuer.siteId, expected);
    assert.equal((await routes.POST(request)).status, 200);
  }
  assert.equal((await routes.POST(new Request("https://example.test/settings?site=missing"))).status, 400);
  assert.deepEqual(writes, ["personal-id", null]);
});
