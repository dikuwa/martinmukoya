import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const nativeRequire = createRequire(import.meta.url);
function loadRoute(path: string, dependencies: Record<string, unknown>) {
  const exports: Record<string, (...args: never[]) => Promise<Response>> = {};
  const code = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
  }).outputText;
  const require = (name: string) => name in dependencies ? dependencies[name] : name.startsWith("@/") ? {} : nativeRequire(name);
  vm.runInNewContext(code, { exports, require, Response, Request, URL, console, process: { env: {} }, setTimeout, TextEncoder, TextDecoder, ReadableStream });
  return exports;
}

const visitorToken = "synthetic-visitor-token-123456";

function requestAI() {
  return new Request("https://example.test/api/ai-chat", {
    method: "POST",
    body: JSON.stringify({ sessionId: "invalid-session", visitorToken, content: "Hello" })
  });
}

function requestPoll(token = visitorToken) {
  return new Request(`https://example.test/api/live-chat?sessionId=synthetic-session&token=${encodeURIComponent(token)}&siteSlug=martin-mukoya`);
}

for (const unavailableCause of ["missing Redis configuration", "Redis error"]) {
  test(`AI chat fails closed on ${unavailableCause} before session lookup`, async () => {
    let lookups = 0;
    let limitedKey = "";
    const route = loadRoute("src/app/api/ai-chat/route.ts", {
      "@/lib/rate-limit": { getClientIp: () => "synthetic-ip", rateLimit: async (key: string) => { limitedKey = key; return { success: false, unavailable: true }; } },
      "@/lib/db": { db: { chatSession: { findFirst: async () => { lookups++; return null; } } } }
    });
    const response = await route.POST(requestAI() as never);
    assert.equal(limitedKey, "ai-chat:synthetic-ip");
    assert.equal(response.status, 503);
    assert.equal(lookups, 0);
  });
}

test("invalid AI session invokes limiter and stops before database lookup when limited", async () => {
  let lookups = 0;
  let limiterCalls = 0;
  const route = loadRoute("src/app/api/ai-chat/route.ts", {
    "@/lib/rate-limit": { getClientIp: () => "synthetic-ip", rateLimit: async (key: string, options: { limit: number; windowSeconds: number }) => { limiterCalls++; assert.equal(key, "ai-chat:synthetic-ip"); assert.equal(options.limit, 30); assert.equal(options.windowSeconds, 60); return { success: false }; } },
    "@/lib/db": { db: { chatSession: { findFirst: async () => { lookups++; return null; } } } }
  });
  const response = await route.POST(requestAI() as never);
  assert.equal(response.status, 429);
  assert.equal(limiterCalls, 1);
  assert.equal(lookups, 0);
});

for (const unavailableCause of ["missing Redis configuration", "Redis error"]) {
  test(`live chat polling fails closed on ${unavailableCause} before session lookup`, async () => {
    let lookups = 0;
    let limitedKey = "";
    const route = loadRoute("src/app/api/live-chat/route.ts", {
      "@/lib/rate-limit": { getClientIp: () => "synthetic-ip", rateLimit: async (key: string, options: { limit: number; windowSeconds: number }) => { limitedKey = key; assert.equal(options.limit, 300); assert.equal(options.windowSeconds, 60); return { success: false, unavailable: true }; } },
      "@/lib/db": { db: { chatSession: { findFirst: async () => { lookups++; return null; } } } },
      "@/lib/live-chat": { publicChat: () => ({}) }
    });
    const response = await route.GET(requestPoll() as never);
    assert.equal(limitedKey, "live-chat-poll:synthetic-ip");
    assert.equal(response.status, 503);
    assert.equal(lookups, 0);
  });
}

test("live chat polling returns 429 before session lookup when limited", async () => {
  let lookups = 0;
  const route = loadRoute("src/app/api/live-chat/route.ts", {
    "@/lib/rate-limit": { getClientIp: () => "synthetic-ip", rateLimit: async () => ({ success: false }) },
    "@/lib/db": { db: { chatSession: { findFirst: async () => { lookups++; return null; } } } },
    "@/lib/live-chat": { publicChat: () => ({}) }
  });
  const response = await route.GET(requestPoll() as never);
  assert.equal(response.status, 429);
  assert.equal(lookups, 0);
});

test("valid live chat polling works; missing and incorrect visitor tokens are rejected", async () => {
  let lookups = 0;
  const session = { id: "synthetic-session", visitorToken, mode: "WAITING_FOR_HUMAN", site: { slug: "martin-mukoya" }, messages: [] };
  const route = loadRoute("src/app/api/live-chat/route.ts", {
    "@/lib/rate-limit": { getClientIp: () => "synthetic-ip", rateLimit: async () => ({ success: true }) },
    "@/lib/db": { db: { chatSession: { findFirst: async ({ where }: { where: { visitorToken: string } }) => { lookups++; return where.visitorToken === visitorToken ? session : null; } } } },
    "@/lib/live-chat": { publicChat: (value: typeof session) => ({ sessionId: value.id, mode: value.mode, messages: value.messages }) }
  });

  const success = await route.GET(requestPoll() as never);
  assert.equal(success.status, 200);
  assert.deepEqual(await success.json(), { sessionId: session.id, mode: session.mode, messages: [] });
  assert.equal((await route.GET(requestPoll("wrong-visitor-token-123456") as never)).status, 404);
  assert.equal((await route.GET(new Request("https://example.test/api/live-chat?sessionId=synthetic-session&siteSlug=martin-mukoya") as never)).status, 400);
  assert.equal(lookups, 2);
});

test("normal shared-IP polling stays below the 300 requests per minute limit", async () => {
  let count = 0;
  const route = loadRoute("src/app/api/live-chat/route.ts", {
    "@/lib/rate-limit": { getClientIp: () => "shared-synthetic-ip", rateLimit: async (_key: string, options: { limit: number }) => ({ success: ++count <= options.limit }) },
    "@/lib/db": { db: { chatSession: { findFirst: async () => ({ id: "synthetic-session", visitorToken, mode: "WAITING_FOR_HUMAN", site: { slug: "martin-mukoya" }, messages: [] }) } } },
    "@/lib/live-chat": { publicChat: () => ({ sessionId: "synthetic-session" }) }
  });

  // Twelve visitors polling every 2.5 seconds use 288 of the 300 requests per minute.
  for (let request = 0; request < 12 * 24; request++) {
    assert.equal((await route.GET(requestPoll() as never)).status, 200);
  }
  assert.equal(count, 288);
});
