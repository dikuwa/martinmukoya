import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { leadUpdateSchema } from "../src/lib/validation/content";
import { bookingCreateSchema } from "../src/lib/validation/finance";

const nativeRequire = createRequire(import.meta.url);

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

function loadModule(path: string, modules: Record<string, unknown>) {
  const exports: Record<string, (...args: unknown[]) => Promise<Response>> = {};
  const code = ts.transpileModule(source(path), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;

  vm.runInNewContext(code, {
    exports,
    Request,
    Response,
    URL,
    console,
    require: (name: string) => {
      if (Object.hasOwn(modules, name)) return modules[name];
      if (name === "@/generated/prisma/client") return { BusinessDocumentType: { PROPOSAL: "PROPOSAL" } };
      if (name === "@react-pdf/renderer" || name === "resend") return {};
      if (name === "@/lib/api") return {
        created: (data: unknown) => Response.json(data, { status: 201 }),
        ok: (data: unknown, init?: ResponseInit) => Response.json(data, init),
        notFound: () => Response.json({}, { status: 404 }),
        parseJson: async (request: Request, schema: { parse(input: unknown): unknown }) => schema.parse(await request.json()),
        serverError: (error: unknown) => { throw error; },
        validationError: () => Response.json({}, { status: 400 }),
      };
      if (name === "@/lib/customer-identity") return { matchingCustomers: async () => [] };
      if (name === "@/lib/payment-transaction") return { runPaymentTransaction: async () => { throw new Error("authorized operation reached"); } };
      if (name === "@/lib/validation/customer") return { customerSchema: { and: () => ({}) } };
      if (name === "@/lib/validation/finance") return { bookingCreateSchema };
      return name.startsWith("@/") ? {} : nativeRequire(name);
    },
  });
  return exports;
}

function loadRoute(path: string, role: "ADMIN" | "USER" | null, modules: Record<string, unknown> = {}) {
  const blocked = new Proxy({}, { get() { throw new Error("database accessed before authorization"); } });
  const guard = loadModule("src/lib/auth-guard.ts", {
    "@/lib/auth": { auth: { api: { getSession: async () => role ? { user: { id: "owner", role } } : null } } },
    "next/headers": { headers: async () => new Headers() },
    "next/server": { NextResponse: Response },
  });
  return loadModule(path, { "@/lib/auth-guard": guard, "@/lib/db": { db: blocked }, ...modules });
}

test("admin pages retain both session and role enforcement", () => {
  const layout = source("src/app/admin/layout.tsx");
  assert.match(layout, /auth\.api\.getSession/);
  assert.match(layout, /if \(!session\)/);
  assert.match(layout, /userRole !== "ADMIN"/);
  assert.match(source("middleware.ts"), /better-auth\.session_token/);
  assert.match(source("middleware.ts"), /__Secure-better-auth\.session_token/);
  assert.match(source("middleware.ts"), /pathname\.startsWith\("\/admin"\)/);
});

for (const [path, methods] of [
  ["src/app/api/admin/business-documents/route.ts", ["GET", "POST"]],
  ["src/app/api/admin/business-documents/[id]/route.ts", ["GET", "PATCH"]],
  ["src/app/api/admin/business-documents/[id]/issue/route.ts", ["POST"]],
  ["src/app/api/admin/business-documents/[id]/revise/route.ts", ["POST"]],
  ["src/app/api/admin/business-documents/[id]/pdf/route.tsx", ["GET"]],
  ["src/app/api/admin/business-documents/[id]/email/route.ts", ["POST"]],
  ["src/app/api/admin/business-documents/[id]/accept/route.ts", ["POST"]],
  ["src/app/api/admin/business-documents/[id]/decline/route.ts", ["POST"]],
  ["src/app/api/admin/business-templates/route.ts", ["GET", "POST"]],
  ["src/app/api/admin/business-templates/[id]/route.ts", ["GET", "PATCH", "DELETE"]],
  ["src/app/api/admin/finance-settings/route.ts", ["GET", "POST"]],
  ["src/app/api/admin/document-settings/route.ts", ["GET", "POST"]],
  ["src/app/api/leads/[id]/route.ts", ["GET", "PATCH", "DELETE"]],
  ["src/app/api/admin/leads/route.ts", ["POST"]],
  ["src/app/api/admin/bookings/route.ts", ["POST"]],
  ["src/app/api/admin/bookings/[id]/route.ts", ["PATCH"]],
  ["src/app/api/admin/bookings/from-lead/route.ts", ["POST"]],
  ["src/app/api/admin/customers/[id]/route.ts", ["PATCH"]],
  ["src/app/api/admin/documents/route.ts", ["POST"]],
  ["src/app/api/admin/documents/[id]/route.ts", ["PATCH"]],
  ["src/app/api/admin/documents/[id]/pdf/route.tsx", ["GET"]],
  ["src/app/api/admin/documents/[id]/email/route.tsx", ["POST"]],
  ["src/app/api/admin/documents/[id]/convert/route.ts", ["POST"]],
  ["src/app/api/admin/documents/[id]/issue/route.ts", ["POST"]],
  ["src/app/api/admin/documents/[id]/revise/route.ts", ["POST"]],
  ["src/app/api/admin/documents/[id]/void/route.ts", ["POST"]],
  ["src/app/api/admin/payments/route.ts", ["POST"]],
  ["src/app/api/admin/payments/[id]/reverse/route.ts", ["POST"]],
  ["src/app/api/admin/shared-documents/route.ts", ["GET", "POST"]],
  ["src/app/api/admin/shared-documents/[code]/route.ts", ["PATCH"]],
] as const) {
  for (const method of methods) {
    for (const [role, status] of [[null, 401], ["USER", 403]] as const) {
      test(`${path} ${method} blocks status ${status} before data access`, async () => {
        const route = loadRoute(path, role);
        const response = await route[method](new Request("https://example.test/api", {
          method,
          ...(method === "POST" || method === "PATCH" ? { body: "{}" } : {}),
        }), { params: Promise.resolve({ id: "synthetic" }) });
        assert.equal(response.status, status);
      });
    }
  }
}

test("one admin can read, edit, and download documents by ID in both identities", async () => {
  const docs = ["business", "personal"].map(siteId => ({
    id: `${siteId}-doc`, siteId, title: `${siteId} document`, documentNumber: `${siteId}-001`,
    documentType: "PROPOSAL", status: "DRAFT", leadId: `${siteId}-lead`,
  }));
  const db = {
    businessDocument: { findUnique: async ({ where }: { where: { id: string } }) => docs.find(doc => doc.id === where.id) },
    financialDocument: { findUnique: async ({ where }: { where: { id: string } }) => docs.find(doc => doc.id === where.id) },
    lead: { findUnique: async ({ where }: { where: { id: string } }) => docs.find(doc => doc.leadId === where.id) },
    site: { findFirst: async ({ where }: { where: { OR: [{ id: string }] } }) => ({ id: where.OR[0].id }) },
  };
  const edits: unknown[] = [];
  const fixtures = {
    "@/lib/db": { db },
    "@/lib/business-document-links": loadModule("src/lib/business-document-links.ts", { "@/lib/db": { db } }),
    "@/lib/business-document-service": {
      updateBusinessDocument: async (id: string, data: object) => {
        edits.push({ id, ...data });
        return { id, ...data };
      },
      businessDocumentIssuer: async (doc: { siteId: string }) => ({ name: doc.siteId }),
    },
    "@/lib/pdf/business-document": { BusinessDocumentPdf: () => null },
    "@/lib/pdf/financial-document": { FinancialPdf: () => null },
    "@react-pdf/renderer": {
      renderToBuffer: async ({ props }: { props: { issuerName?: string; document?: { siteId: string } } }) =>
        new TextEncoder().encode(`%PDF ${props.issuerName ?? props.document?.siteId}`),
    },
  };
  const route = loadRoute("src/app/api/admin/business-documents/[id]/route.ts", "ADMIN", fixtures);
  const pdfs = ["business-documents", "documents"].map(directory =>
    loadRoute(`src/app/api/admin/${directory}/[id]/pdf/route.tsx`, "ADMIN", fixtures));
  for (const doc of docs) {
    const other = docs.find(candidate => candidate.id !== doc.id)!;
    const url = `https://example.test/document/${doc.id}?site=${other.siteId}`;
    const context = { params: Promise.resolve({ id: doc.id }) };
    const read = await route.GET(new Request(url), context);
    assert.equal(read.status, 200);
    assert.equal((await read.json()).siteId, doc.siteId);
    for (const pdfRoute of pdfs) {
      const pdf = await pdfRoute.GET(new Request(url), context);
      assert.equal(pdf.status, 200);
      assert.equal(pdf.headers.get("cache-control"), "private, no-store");
      assert.equal(await pdf.text(), `%PDF ${doc.siteId}`);
    }
    const patch = (data: object) => route.PATCH(new Request(url, { method: "PATCH", body: JSON.stringify(data) }), context);
    assert.equal((await patch({ title: "Edited" })).status, 200);
    assert.equal((await patch({ siteId: other.siteId })).status, 400);
    assert.equal((await patch({ leadId: other.leadId })).status, 400);
    assert.equal((await patch({ financialDocumentId: other.id })).status, 400);
  }
  assert.deepEqual(edits.map(edit => (edit as { siteId: string }).siteId), ["business", "personal"]);
  const missing = { params: Promise.resolve({ id: "missing" }) };
  for (const directRoute of [route, ...pdfs]) {
    assert.equal((await directRoute.GET(new Request("https://example.test/document/missing"), missing)).status, 404);
  }
});

test("lead identity moves respect existing bookings, documents and project memberships", async () => {
  for (const [link, expected] of [["booking", 409], ["document", 409], ["private-project", 409], ["shared-project", 200], [null, 200]] as const) {
    const writes: { siteId?: string; siteSlug?: string }[] = [];
    const route = loadRoute("src/app/api/leads/[id]/route.ts", "ADMIN", {
      "@/lib/validation/content": { leadUpdateSchema },
      "@/lib/cache": { invalidateTag: async () => {}, tags: {} },
      "@/lib/db": { db: {
        lead: {
          findUnique: async () => ({ siteId: "business", linkedProjectId: link?.endsWith("project") ? link : null }),
          update: async ({ data }: { data: (typeof writes)[number] }) => { writes.push(data); return data; },
        },
        site: { findFirst: async () => ({ id: "personal" }) },
        booking: { findUnique: async () => link === "booking" ? { id: link } : null },
        businessDocument: { findFirst: async () => link === "document" ? { id: link } : null },
        project: { findUnique: async () => ({ sites: link === "shared-project" ? [{ id: "business" }, { id: "personal" }] : [{ id: "business" }] }) },
      } },
    });
    const patch = (data: object) => route.PATCH(new Request("https://example.test/api/leads/lead", { method: "PATCH", body: JSON.stringify(data) }), { params: Promise.resolve({ id: "lead" }) });
    assert.equal((await patch({ siteId: " " })).status, 400);
    assert.equal((await patch({ siteSlug: "" })).status, 400);
    assert.equal((await patch({ siteSlug: "martin-mukoya" })).status, expected);
    assert.equal(writes.length, expected === 200 ? 1 : 0);
    if (expected === 200) {
      assert.equal(writes[0].siteId, "personal");
      assert.equal("siteSlug" in writes[0], false);
    }
  }
});

test("public shared-document entry points validate the share before serving or mutating", () => {
  for (const path of [
    "src/app/d/[code]/page.tsx",
    "src/app/api/documents/share/[code]/route.ts",
    "src/app/api/documents/share/[code]/accept/route.ts",
    "src/app/api/documents/share/[code]/decline/route.ts",
    "src/app/api/documents/share/[code]/download/route.tsx",
  ]) {
    assert.match(source(path), /sharedDocumentIsPublic/);
  }
});
