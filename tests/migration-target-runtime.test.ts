import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const repo = resolve(".");
const tsx = join(repo, "node_modules/.bin/tsx");
const wrapper = join(repo, "scripts/guarded-prisma.ts");
const safeUrl = "postgresql://synthetic@127.0.0.1:1/synthetic";

function run(args: string[], overrides: Record<string, string | undefined> = {}) {
  const cwd = mkdtempSync(join(tmpdir(), "migration-target-"));
  writeFileSync(join(cwd, ".env.local"), "DATABASE_URL=postgresql://stale@db.ujuxpamgzerbksmqbxqj.supabase.co/postgres\nDATABASE_ENV=production\nDATABASE_EXPECTED_HOST=db.ujuxpamgzerbksmqbxqj.supabase.co\nDATABASE_EXPECTED_NAME=postgres\n");
  writeFileSync(join(cwd, "schema.prisma"), "datasource db { provider = \"postgresql\" }\ngenerator client { provider = \"prisma-client-js\" }\n");
  const result = spawnSync(tsx, [wrapper, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, ...overrides },
    timeout: 20_000,
  });
  rmSync(cwd, { recursive: true, force: true });
  return `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
}

const safeEnv = {
  DATABASE_URL: safeUrl,
  DATABASE_ENV: "ci",
  DATABASE_EXPECTED_HOST: "127.0.0.1",
  DATABASE_EXPECTED_NAME: "synthetic",
};

test("CLI URL, db, and alternate-config overrides fail before Prisma starts", () => {
  for (const args of [
    ["db", "push", "--url", "postgresql://production"],
    ["db", "push", "--url=postgresql://production"],
    ["db", "push", "--db", "postgresql://production"],
    ["db", "push", "--db=postgresql://production"],
    ["db", "push", "--config", "other.ts"],
    ["db", "push", "--config=other.ts"],
  ]) {
    const output = run(args, safeEnv);
    assert.match(output, /Datasource override/);
    assert.doesNotMatch(output, /P1001|127\.0\.0\.1:1/);
  }
});

test("missing process metadata does not inherit target identity from .env.local", () => {
  const output = run(["db", "push", "--schema", "schema.prisma"], { DATABASE_URL: safeUrl, DATABASE_ENV: undefined, DATABASE_EXPECTED_HOST: undefined, DATABASE_EXPECTED_NAME: undefined });
  assert.match(output, /DATABASE_ENV/);
});

test("non-Prisma seed entry point also fails closed without explicit target metadata", () => {
  const result = spawnSync(tsx, [join(repo, "scripts/seed-customer-finance-e2e.ts")], {
    cwd: mkdtempSync(join(tmpdir(), "seed-target-")),
    encoding: "utf8",
    env: { ...process.env, DATABASE_URL: safeUrl, DATABASE_ENV: undefined, DATABASE_EXPECTED_HOST: undefined, DATABASE_EXPECTED_NAME: undefined },
    timeout: 20_000,
  });
  assert.match(`${result.stdout ?? ""}\n${result.stderr ?? ""}`, /DATABASE_ENV/);
});
