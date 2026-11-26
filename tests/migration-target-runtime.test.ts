import assert from "node:assert/strict";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
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

test("explicit process credentials mutate the intended disposable PostgreSQL database despite conflicting .env.local", () => {
  const root = mkdtempSync(join(tmpdir(), "migration-postgres-"));
  const data = join(root, "data");
  const hasLocalPostgres = spawnSync("initdb", ["--version"], { stdio: "ignore" }).status === 0;
  const databaseUrl = hasLocalPostgres
    ? "postgresql://postgres@127.0.0.1:55483/postgres?application_name=target-test"
    : process.env.DATABASE_URL;
  assert.ok(databaseUrl, "CI must provide a disposable PostgreSQL service when initdb is unavailable");
  const target = new URL(databaseUrl);
  const expectedHost = target.hostname;
  const expectedDatabase = target.pathname.slice(1);
  const fixture = join(root, "fixture");
  try {
    if (hasLocalPostgres) {
      execFileSync("initdb", ["-D", data, "-U", "postgres", "-A", "trust", "--locale=C", "--encoding=UTF8", "--no-instructions"], { stdio: "ignore" });
      execFileSync("pg_ctl", ["-D", data, "-l", join(root, "postgres.log"), "-o", "-h 127.0.0.1 -p 55483", "-w", "start"], { stdio: "ignore" });
    }
    mkdirSync(join(fixture, "prisma"), { recursive: true });
    mkdirSync(join(fixture, "scripts"), { recursive: true });
    symlinkSync(join(repo, "node_modules"), join(fixture, "node_modules"), "dir");
    copyFileSync(join(repo, "prisma.config.ts"), join(fixture, "prisma.config.ts"));
    copyFileSync(join(repo, "scripts/migration-target.ts"), join(fixture, "scripts/migration-target.ts"));
    writeFileSync(join(fixture, ".env.local"), "DATABASE_URL=postgresql://stale@127.0.0.1:55484/postgres\nDATABASE_ENV=ci\nDATABASE_EXPECTED_HOST=127.0.0.1\nDATABASE_EXPECTED_NAME=postgres\n");
    writeFileSync(join(fixture, "prisma/schema.prisma"), `datasource db {
  provider = "postgresql"
}
generator client {
  provider = "prisma-client-js"
}
model RuntimeProbe {
  id String @id
}
`);
    const result = spawnSync(tsx, [wrapper, "db", "push"], {
      cwd: fixture,
      encoding: "utf8",
      env: { ...process.env, DATABASE_URL: databaseUrl, DATABASE_ENV: "ci", DATABASE_EXPECTED_HOST: expectedHost, DATABASE_EXPECTED_NAME: expectedDatabase },
      timeout: 30_000,
    });
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    const relation = execFileSync("psql", [databaseUrl, "-Atc", `SELECT to_regclass('public."RuntimeProbe"')`], { encoding: "utf8" }).trim();
    assert.equal(relation, '"RuntimeProbe"');
  } finally {
    if (hasLocalPostgres) {
      try { execFileSync("pg_ctl", ["-D", data, "-m", "immediate", "-w", "stop"], { stdio: "ignore" }); } catch { /* already stopped or never started */ }
    }
    rmSync(root, { recursive: true, force: true });
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
