import test from "node:test";
import assert from "node:assert/strict";
import { getClientIp, rateLimit } from "../src/lib/rate-limit";

test("rate limiter fails closed for missing configuration and Redis errors, enforces counters", async () => {
  const oldUrl = process.env.UPSTASH_REDIS_URL;
  const oldToken = process.env.UPSTASH_REDIS_TOKEN;
  delete process.env.UPSTASH_REDIS_URL;
  delete process.env.UPSTASH_REDIS_TOKEN;
  const options = { limit: 2, windowSeconds: 60 };
  assert.equal((await rateLimit("synthetic", options)).unavailable, true);
  process.env.UPSTASH_REDIS_URL = "https://synthetic.invalid";
  process.env.UPSTASH_REDIS_TOKEN = "synthetic";
  const original = globalThis.fetch;
  let count = 0;
  globalThis.fetch = async (input) => {
    const result = { result: ++count };
    return Response.json(String(input).endsWith("/pipeline") ? [result] : result);
  };
  try {
    assert.equal((await rateLimit("synthetic", options)).remaining, 1);
    assert.equal((await rateLimit("synthetic", options)).success, true);
    assert.equal((await rateLimit("synthetic", options)).success, false);
    globalThis.fetch = async () => { throw new Error("unavailable"); };
    assert.equal((await rateLimit("synthetic", options)).unavailable, true);
  } finally {
    globalThis.fetch = original;
    if (oldUrl === undefined) delete process.env.UPSTASH_REDIS_URL; else process.env.UPSTASH_REDIS_URL = oldUrl;
    if (oldToken === undefined) delete process.env.UPSTASH_REDIS_TOKEN; else process.env.UPSTASH_REDIS_TOKEN = oldToken;
  }
});

test("only platform-controlled Vercel IP is trusted", () => {
  const original = process.env.VERCEL;
  const request = new Request("https://example.test", { headers: { "x-forwarded-for": "1.2.3.4", "x-real-ip": "1.2.3.4", "x-vercel-forwarded-for": "203.0.113.7" } });
  try {
    delete process.env.VERCEL;
    assert.equal(getClientIp(request), "unknown");
    process.env.VERCEL = "1";
    assert.equal(getClientIp(request), "203.0.113.7");
    request.headers.set("x-vercel-forwarded-for", "not-an-ip");
    assert.equal(getClientIp(request), "unknown");
  } finally {
    if (original === undefined) delete process.env.VERCEL; else process.env.VERCEL = original;
  }
});
