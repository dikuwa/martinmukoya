import dotenv from "dotenv";
import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import { validateMigrationTarget } from "./scripts/migration-target";

// Local defaults may fill missing values, but explicit process credentials always win.
dotenv.config({ path: ".env.local" });

const databaseUrl = env("DATABASE_URL");
const prismaArgs = process.argv.slice(2);
const isSchemaMutationCommand =
  prismaArgs.includes("migrate") ||
  (prismaArgs.includes("db") && ["execute", "push", "reset"].some((command) => prismaArgs.includes(command)));
if (isSchemaMutationCommand) {
  validateMigrationTarget({
    databaseUrl,
    environment: process.env.DATABASE_ENV,
    expectedHost: process.env.DATABASE_EXPECTED_HOST,
    expectedDatabase: process.env.DATABASE_EXPECTED_NAME,
  });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: databaseUrl }
});
