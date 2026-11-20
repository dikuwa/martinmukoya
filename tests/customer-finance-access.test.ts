import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const nativeRequire = createRequire(import.meta.url);
const protectedRoutes = [
  ["src/app/api/admin/customers/route.ts", ["GET", "POST"]],
  ["src/app/api/admin/customers/[id]/route.ts", ["PATCH"]],
  ["src/app/api/admin/quick-jobs/route.ts", ["POST"]],
  ["src/app/api/admin/service-catalog/route.ts", ["GET", "POST"]],
  ["src/app/api/admin/invoice-reminders/route.ts", ["POST"]],
] as const;

for (const [path, methods] of protectedRoutes) {
  for (const method of methods) {
    for (const status of [401, 403]) {
      test(`${path} ${method} rejects ${status === 401 ? "anonymous" : "non-admin"} before data access`, async () => {
        let queried = false;
        const code = ts.transpileModule(readFileSync(path, "utf8"), {
          compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
        }).outputText;
        const exports: Record<string, (request: Request, context: unknown) => Promise<Response>> = {};
        const dependencies: Record<string, unknown> = {
          "@/lib/auth-guard": { requireAdmin: async () => ({ error: Response.json({ error: "Forbidden" }, { status }) }) },
          "@/lib/db": { db: new Proxy({}, { get() { queried = true; throw new Error("Must not access private data"); } }) },
        };
        const require = (name: string) => name in dependencies ? dependencies[name] : name.startsWith("@/") ? {} : nativeRequire(name);
        vm.runInNewContext(code, { exports, require, Request, Response, URL, console, process: { env: {} } });
        const request = new Request("https://example.test/api/admin", {
          method,
          ...(method !== "GET" ? { body: JSON.stringify({}), headers: { "content-type": "application/json" } } : {}),
        });
        const response = await exports[method](request, { params: Promise.resolve({ id: "synthetic" }) });
        assert.equal(response.status, status);
        assert.equal(queried, false);
      });
    }
  }
}
