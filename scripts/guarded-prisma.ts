import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { assertNoDatasourceOverride, validateMigrationTarget } from "./migration-target";

const args = process.argv.slice(2);
const isMutation = args.includes("migrate") || (args.includes("db") && ["execute", "push", "reset"].some((command) => args.includes(command)));

if (isMutation) {
  assertNoDatasourceOverride(args);
  validateMigrationTarget({
    databaseUrl: process.env.DATABASE_URL,
    environment: process.env.DATABASE_ENV,
    expectedHost: process.env.DATABASE_EXPECTED_HOST,
    expectedDatabase: process.env.DATABASE_EXPECTED_NAME,
    productionApproved: process.env.DATABASE_PRODUCTION_MIGRATION_APPROVED,
  });
}

const require = createRequire(import.meta.url);
const prismaEntry = require.resolve("prisma/build/index.js");
const result = spawnSync(process.execPath, [prismaEntry, ...args], { stdio: "inherit", env: process.env });
process.exit(result.status ?? 1);
