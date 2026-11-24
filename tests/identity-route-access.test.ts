import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const nativeRequire = createRequire(import.meta.url);

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

function loadRoute(path: string, status: 401 | 403) {
  const exports: Record<string, (...args: unknown[]) => Promise<Response>> = {};
  const blocked = new Proxy({}, { get() { throw new Error("authorized operation reached"); } });
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
      if (name === "@/generated/prisma/client") return { BusinessDocumentType: { PROPOSAL: "PROPOSAL" } };
      if (name === "@react-pdf/renderer" || name === "resend") return {};
      if (name === "@/lib/auth-guard") return { requireAdmin: async () => ({ error: Response.json({}, { status }) }) };
      if (name === "@/lib/db") return { db: blocked };
      if (name === "@/lib/api") return {
        created: () => Response.json({}, { status: 201 }),
        ok: () => Response.json({}),
        parseJson: async () => ({}),
        serverError: () => Response.json({}, { status: 500 }),
        validationError: () => Response.json({}, { status: 400 }),
      };
      if (name === "@/lib/customer-identity") return { matchingCustomers: async () => [] };
      if (name === "@/lib/payment-transaction") return { runPaymentTransaction: async () => { throw new Error("authorized operation reached"); } };
      if (name === "@/lib/validation/customer") return { customerSchema: { and: () => ({}) } };
      return name.startsWith("@/") ? {} : nativeRequire(name);
    },
  });
  return exports;
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
] as const) {
  for (const method of methods) {
    for (const status of [401, 403] as const) {
      test(`${path} ${method} blocks status ${status} before data access`, async () => {
        const route = loadRoute(path, status);
        const response = await route[method](new Request("https://example.test/api", {
          method,
          ...(method === "POST" || method === "PATCH" ? { body: "{}" } : {}),
        }), { params: Promise.resolve({ id: "synthetic" }) });
        assert.equal(response.status, status);
      });
    }
  }
}

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
