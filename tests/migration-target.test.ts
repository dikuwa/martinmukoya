import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { validateMigrationTarget } from "../scripts/migration-target";

const staging = {
  databaseUrl: "postgresql://role:secret@ep-staging.eu-central-1.aws.neon.tech/neondb",
  environment: "staging",
  expectedHost: "ep-staging.eu-central-1.aws.neon.tech",
  expectedDatabase: "neondb",
};

test("accepts an explicitly matched isolated staging target", () => {
  assert.doesNotThrow(() => validateMigrationTarget(staging));
});

test("rejects missing environment and target identity", () => {
  assert.throws(() => validateMigrationTarget({ databaseUrl: staging.databaseUrl }), /DATABASE_ENV/);
  assert.throws(() => validateMigrationTarget({ ...staging, expectedDatabase: "other" }), /expected migration target/);
});

test("rejects production Supabase during staging or CI migration", () => {
  const productionUrl = "postgresql://role:secret@aws-0-eu-west-1.pooler.supabase.com:5432/postgres";
  assert.throws(() => validateMigrationTarget({ ...staging, databaseUrl: productionUrl, expectedHost: "aws-0-eu-west-1.pooler.supabase.com", expectedDatabase: "postgres" }), /production Supabase/);
  assert.throws(() => validateMigrationTarget({ ...staging, environment: "ci", databaseUrl: productionUrl, expectedHost: "aws-0-eu-west-1.pooler.supabase.com", expectedDatabase: "postgres" }), /production Supabase/);
});

test("Prisma config validates migration commands without overriding explicit credentials", () => {
  const config = readFileSync("prisma.config.ts", "utf8");
  assert.match(config, /prismaArgs\.includes\("migrate"\)/);
  assert.match(config, /\["execute", "push", "reset"\]/);
  assert.match(config, /validateMigrationTarget\(/);
  assert.doesNotMatch(config, /override:\s*true/);
  assert.throws(() => validateMigrationTarget({
    databaseUrl: "postgresql://role:secret@127.0.0.1:6543/wrong",
    expectedHost: "127.0.0.1",
    expectedDatabase: "wrong",
  }), /DATABASE_ENV/);
});

test("rejects conflicting effective target metadata", () => {
  assert.throws(
    () => validateMigrationTarget({ ...staging, environment: "staging", expectedHost: "127.0.0.1" }),
    /expected migration target/,
  );
  assert.throws(
    () => validateMigrationTarget({ ...staging, environment: "staging", databaseUrl: "postgresql://role:secret@aws-0-eu-west-1.pooler.supabase.com:5432/postgres", expectedHost: "aws-0-eu-west-1.pooler.supabase.com", expectedDatabase: "postgres" }),
    /production Supabase/,
  );
});
