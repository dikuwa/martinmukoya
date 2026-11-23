import assert from "node:assert/strict";
import test from "node:test";
import { assertPreviewDatabaseIsolation } from "../src/lib/database-isolation";

const productionUrl = "postgresql://postgres.ujuxpamgzerbksmqbxqj:fake@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";
const stagingUrl = "postgresql://qa_user:fake@free-postgres.example.invalid:5432/staging";

test("production deployments retain their configured database behavior", () => {
  assert.doesNotThrow(() =>
    assertPreviewDatabaseIsolation({ vercelEnv: "production", databaseUrl: productionUrl })
  );
});

test("local CI is unaffected by the preview guard", () => {
  assert.doesNotThrow(() =>
    assertPreviewDatabaseIsolation({ databaseUrl: stagingUrl })
  );
});

test("Vercel previews fail closed without an isolation confirmation", () => {
  assert.throws(
    () => assertPreviewDatabaseIsolation({ vercelEnv: "preview", databaseUrl: stagingUrl }),
    /isolated staging/
  );
});

test("Vercel previews reject the known production database even with a flag", () => {
  assert.throws(
    () => assertPreviewDatabaseIsolation({
      vercelEnv: "preview",
      databaseUrl: productionUrl,
      isolationConfirmed: "true"
    }),
    /production Supabase/
  );
});

test("Vercel previews reject invalid database URLs", () => {
  assert.throws(
    () => assertPreviewDatabaseIsolation({
      vercelEnv: "preview",
      databaseUrl: "not-a-postgres-url",
      isolationConfirmed: "true"
    }),
    /not configured/
  );
});

test("Vercel previews permit explicitly isolated PostgreSQL", () => {
  assert.doesNotThrow(() =>
    assertPreviewDatabaseIsolation({
      vercelEnv: "preview",
      databaseUrl: stagingUrl,
      isolationConfirmed: "true"
    })
  );
});
