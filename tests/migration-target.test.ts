import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { assertNoDatasourceOverride, validateMigrationTarget, validatePrismaMutationArgs } from "../scripts/migration-target";

const staging = {
  databaseUrl: "postgresql://role:secret@ep-staging.eu-central-1.aws.neon.tech/neondb",
  environment: "staging",
  expectedHost: "ep-staging.eu-central-1.aws.neon.tech",
  expectedDatabase: "neondb",
  productionApproved: "false",
};

test("accepts an explicitly matched isolated staging target", () => {
  assert.doesNotThrow(() => validateMigrationTarget(staging));
});

test("rejects missing environment and target identity", () => {
  assert.throws(() => validateMigrationTarget({ databaseUrl: staging.databaseUrl }), /DATABASE_ENV/);
  assert.throws(() => validateMigrationTarget({ ...staging, expectedDatabase: "other" }), /expected database target/);
});

test("rejects production Supabase during staging or CI migration", () => {
  const productionUrl = "postgresql://role:secret@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true";
  assert.throws(() => validateMigrationTarget({ ...staging, databaseUrl: productionUrl, expectedHost: "aws-0-eu-west-1.pooler.supabase.com", expectedDatabase: "postgres" }), /production Supabase/);
  assert.throws(() => validateMigrationTarget({ ...staging, environment: "ci", databaseUrl: productionUrl, expectedHost: "aws-0-eu-west-1.pooler.supabase.com", expectedDatabase: "postgres" }), /production Supabase/);
});

test("rejects direct production Supabase and encoded identities outside production", () => {
  for (const host of ["db.ujuxpamgzerbksmqbxqj.supabase.co", "aws-0-eu-west-1.pooler.supabase.com"]) {
    assert.throws(() => validateMigrationTarget({ ...staging, databaseUrl: `postgresql://role%40name:secret@${host}/postgres`, expectedHost: host, expectedDatabase: "postgres" }), /production Supabase/);
  }
});

test("permits only reviewed connection parameters and rejects destination overrides", () => {
  for (const parameter of ["host", "port", "dbname", "database", "user", "username", "password", "service", "options"]) {
    assert.throws(() => validateMigrationTarget({ ...staging, databaseUrl: `${staging.databaseUrl}?${parameter}=production` }), /not reviewed/);
  }
  assert.doesNotThrow(() => validateMigrationTarget({ ...staging, databaseUrl: `${staging.databaseUrl}?sslmode=require&pgbouncer=true&connect_timeout=5&application_name=ci` }));
});

test("Prisma config validates migration commands without overriding explicit credentials", () => {
  const config = readFileSync("prisma.config.ts", "utf8");
  assert.match(config, /prismaArgs\.includes\("migrate"\)/);
  assert.match(config, /\["execute", "push", "reset"\]/);
  assert.match(config, /validatePrismaMutationArgs\(/);
  assert.match(config, /const explicitDatabaseUrl = process\.env\.DATABASE_URL/);
  assert.match(config, /const databaseUrl = explicitDatabaseUrl \?\? env\("DATABASE_URL"\)/);
  assert.ok(config.indexOf("const explicitDatabaseUrl") < config.indexOf("dotenv.config"));
  assert.doesNotMatch(config, /override:\s*true/);
  assert.throws(() => validateMigrationTarget({
    databaseUrl: "postgresql://role:secret@127.0.0.1:6543/wrong",
    expectedHost: "127.0.0.1",
    expectedDatabase: "wrong",
  }), /DATABASE_ENV/);
  assertNoDatasourceOverride(["migrate", "deploy"]);
  for (const args of [["db", "push", "--url", "postgresql://production"], ["db", "push", "--url=postgresql://production"], ["db", "push", "--db", "postgresql://production"], ["db", "push", "--db=postgresql://production"], ["db", "push", "--config", "other.ts"], ["db", "push", "--config=other.ts"]]) {
    assert.throws(() => validatePrismaMutationArgs(args, staging), /Datasource override/);
  }
  assert.doesNotThrow(() => validatePrismaMutationArgs(["db", "push", "--schema", "isolated.prisma"], staging));
});

test("rejects conflicting effective target metadata", () => {
  assert.throws(
    () => validateMigrationTarget({ ...staging, environment: "staging", expectedHost: "127.0.0.1" }),
    /expected database target/,
  );
  assert.throws(
    () => validateMigrationTarget({ ...staging, environment: "staging", databaseUrl: "postgresql://role:secret@aws-0-eu-west-1.pooler.supabase.com:5432/postgres", expectedHost: "aws-0-eu-west-1.pooler.supabase.com", expectedDatabase: "postgres" }),
    /production Supabase/,
  );
  assert.throws(() => validateMigrationTarget({ ...staging, environment: "production" }), /DATABASE_PRODUCTION_MIGRATION_APPROVED/);
});
