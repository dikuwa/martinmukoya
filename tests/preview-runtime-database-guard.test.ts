import assert from "node:assert/strict";
import test from "node:test";
import { getDb } from "../src/lib/db";

test("unisolated Vercel Preview can construct Prisma but cannot connect to Postgres", async () => {
  const prior = {
    vercelEnv: process.env.VERCEL_ENV,
    databaseUrl: process.env.DATABASE_URL,
    isolated: process.env.PREVIEW_DATABASE_ISOLATED,
  };
  try {
    process.env.VERCEL_ENV = "preview";
    process.env.PREVIEW_DATABASE_ISOLATED = "false";
    // Syntactically valid but deliberately unusable; no network access is allowed.
    process.env.DATABASE_URL = "postgresql://preview-user:invalid@127.0.0.1:1/disallowed";
    assert.doesNotThrow(() => getDb());
    const database = getDb();
    await assert.rejects(
      database.$queryRaw`SELECT 1`,
      /Preview database access is disabled until isolated staging is configured/
    );
  } finally {
    for (const [key, value] of [
      ["VERCEL_ENV", prior.vercelEnv],
      ["DATABASE_URL", prior.databaseUrl],
      ["PREVIEW_DATABASE_ISOLATED", prior.isolated],
    ] as const) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
