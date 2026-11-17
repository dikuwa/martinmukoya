import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const nativeRequire = createRequire(import.meta.url);
function loadRoute(path: string, dependencies: Record<string, unknown>) {
  const exports: Record<string, (...args: unknown[]) => Promise<Response>> = {};
  const code = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
  }).outputText;
  const require = (name: string) => name in dependencies ? dependencies[name] : name.startsWith("@/") ? {} : nativeRequire(name);
  vm.runInNewContext(code, { exports, require, Response, Request, URL, console, process: { env: { OPENAI_CHATBOT_API_KEY: "synthetic" } }, setTimeout, TextEncoder, TextDecoder, ReadableStream });
  return exports;
}
const routes = [
  ["src/app/api/admin/notifications/route.ts", ["GET", "PATCH", "DELETE"]],
  ["src/app/api/admin/notifications/count/route.ts", ["GET"]],
  ["src/app/api/admin/notifications/[id]/route.ts", ["PATCH", "DELETE"]],
  ["src/app/api/site-settings/route.ts", ["GET"]],
  ["src/app/api/site-settings/[key]/route.ts", ["GET"]]
] as const;
for (const [path, methods] of routes) {
  for (const method of methods) {
    for (const status of [401, 403, 200]) {
      test(`${path} ${method}: ${status === 401 ? "anonymous" : status === 403 ? "non-admin" : "admin"}`, async () => {
        let accessed = false;
        const stop = new Error("authorized operation reached");
        const blocked = new Proxy({}, { get() { accessed = true; throw stop; } });
        const route = loadRoute(path, {
          "next/server": { NextResponse: Response },
          "@/lib/auth-guard": { requireAdmin: async () => ({ error: status === 200 ? null : Response.json({}, { status }) }) },
          "@/lib/db": { db: blocked },
          "@/lib/notifications": { syncNotifications: async () => { accessed = true; throw stop; } },
          "@/lib/api": { parseListQuery: () => { accessed = true; throw stop; }, serverError: () => Response.json({}, { status: 500 }) }
        });
        const result = await route[method](new Request("https://example.test/api"), { params: Promise.resolve({ id: "synthetic", key: "finance" }) });
        assert.equal(accessed, status === 200);
        assert.equal(result.status, status === 200 ? 500 : status);
      });
    }
  }
}
for (const path of ["src/app/api/ai-chat/route.ts", "src/app/api/chatbot/leads/route.ts"]) {
  for (const token of [undefined, "incorrect-token", "visitor-secret"]) {
    test(`${path}: session credential ${token ?? "missing"}`, async () => {
      let matched = false;
      let wrote = false;
      const route = loadRoute(path, {
        "next/server": { NextResponse: Response },
        "@/generated/prisma/client": {},
        "@/lib/rate-limit": { getClientIp: () => "test", rateLimit: async () => ({ success: true }) },
        "@/lib/sites": { getCurrentSite: async () => { throw new Error("valid credentials passed"); } },
        "@/lib/db": { db: {
          chatSession: { findFirst: async ({ where }: { where: { id: string; visitorToken: string } }) => { matched = where.id === "synthetic" && where.visitorToken === "visitor-secret"; return matched ? { id: "synthetic", visitorToken: "visitor-secret" } : null; }, create: () => { wrote = true; } },
          lead: { create: () => { wrote = true; } }, chatMessage: { create: () => { wrote = true; } }
        } }
      });
      const result = await route.POST(new Request("https://example.test/api", { method: "POST", body: JSON.stringify({ sessionId: "synthetic", visitorToken: token, content: "Hello", name: "Synthetic", email: "synthetic@example.test", service: "Website", description: "Test" }) }));
      assert.equal(result.status, token === "visitor-secret" ? 500 : 403);
      assert.equal(matched, token === "visitor-secret");
      assert.equal(wrote, false);
      assert.equal(result.headers.get("X-Chat-Visitor-Token"), null);
    });
  }
}

for (const content of ["Hello", "Talk to human"]) {
  test(`owned chat preserves ${content === "Hello" ? "AI conversation" : "human handoff"}`, async () => {
    const writes: Array<{ sessionId: string; content: string }> = [];
    let historyRead = false;
    let handedOff = false;
    const own = { id: "visitor-a", visitorToken: "secret-a", mode: "AI", summary: "Synthetic", leadId: "lead-a" };
    const route = loadRoute("src/app/api/ai-chat/route.ts", {
      "@/lib/rate-limit": { getClientIp: () => "test", rateLimit: async () => ({ success: true }) },
      "@/lib/sites": { getCurrentSite: async () => ({ id: "site-a", slug: "martin-mukoya" }) },
      "@/lib/cache": { invalidateTag: async () => {}, tags: {} },
      "@/lib/live-chat": { requestHuman: async (id: string) => { assert.equal(id, own.id); handedOff = true; return { content: "Human requested" }; } },
      "@/lib/ai/chatbot-service": { createChatbotResponse: async (_prompt: string, messages: Array<{ content: string }>) => { assert.deepEqual(Array.from(messages, m => m.content), ["Own conversation"]); return "Synthetic reply"; } },
      "@/lib/db": { db: {
        chatSession: { findFirst: async ({ where }: { where: { id: string; visitorToken: string } }) => where.id === own.id && where.visitorToken === own.visitorToken ? own : null, update: async () => own, create: () => assert.fail("must not replace existing session") },
        chatMessage: { create: async ({ data }: { data: { sessionId: string; content: string } }) => { writes.push(data); }, findMany: async ({ where }: { where: { sessionId: string } }) => { assert.equal(where.sessionId, own.id); historyRead = true; return [{ role: "VISITOR", content: "Own conversation" }]; } }
      } }
    });
    const response = await route.POST(new Request("https://example.test/api", { method: "POST", body: JSON.stringify({ sessionId: own.id, visitorToken: own.visitorToken, content }) }));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("X-Chat-Visitor-Token"), own.visitorToken);
    assert.equal(handedOff, content !== "Hello");
    assert.equal(historyRead, content === "Hello");
    assert.ok(writes.every(write => write.sessionId === own.id));
    assert.equal(await response.text(), content === "Hello" ? "Synthetic reply" : "Human requested");
    const denied = await route.POST(new Request("https://example.test/api", { method: "POST", body: JSON.stringify({ sessionId: "unknown-session", visitorToken: own.visitorToken, content }) }));
    assert.equal(denied.status, 403);
    assert.equal(denied.headers.get("X-Chat-Visitor-Token"), null);
  });
}

test("owned lead links the matching session and preserves human handoff", async () => {
  let linked = false;
  const route = loadRoute("src/app/api/chatbot/leads/route.ts", {
    "next/server": { NextResponse: Response },
    "@/lib/rate-limit": { getClientIp: () => "test", rateLimit: async () => ({ success: true }) },
    "@/lib/sites": { getCurrentSite: async () => ({ id: "site-a" }) },
    "@/lib/cache": { invalidateTag: async () => {}, tags: {} },
    "@/lib/contact-validation": { validateEmail: () => true, validatePhone: () => true },
    "@/lib/notifications": { createNotification: async () => {} },
    "@/lib/email": { sendLeadNotification: async () => {} },
    "@/lib/db": { db: {
      chatSession: { findFirst: async () => ({ id: "visitor-a" }), update: async ({ where, data }: { where: { id: string; visitorToken: string }; data: { mode: string; leadId: string } }) => { assert.equal(where.id, "visitor-a"); assert.equal(where.visitorToken, "secret-a"); assert.equal(data.mode, "WAITING_FOR_HUMAN"); assert.equal(data.leadId, "lead-a"); linked = true; } },
      lead: { create: async () => ({ id: "lead-a", name: "Synthetic", createdAt: new Date() }) }
    } }
  });
  const response = await route.POST(new Request("https://example.test/api", { method: "POST", body: JSON.stringify({ sessionId: "visitor-a", visitorToken: "secret-a", name: "Synthetic", email: "synthetic@example.test", service: "Website", description: "Synthetic handoff" }) }));
  assert.equal(response.status, 201);
  assert.equal(linked, true);
});
