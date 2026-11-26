import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";
import { validatePrismaMutationArgs } from "./scripts/migration-target";

const explicitDatabaseUrl = process.env.DATABASE_URL;
const explicitTarget = {
  environment: process.env.DATABASE_ENV,
  expectedHost: process.env.DATABASE_EXPECTED_HOST,
  expectedDatabase: process.env.DATABASE_EXPECTED_NAME,
  productionApproved: process.env.DATABASE_PRODUCTION_MIGRATION_APPROVED,
};

// Local defaults may fill missing values, but explicit process credentials always win.
dotenv.config();
dotenv.config({ path: ".env.local" });

const databaseUrl = explicitDatabaseUrl ?? env("DATABASE_URL");
const prismaArgs = process.argv.slice(2);
const isSchemaMutationCommand =
  prismaArgs.includes("migrate") ||
  (prismaArgs.includes("db") && ["execute", "push", "reset"].some((command) => prismaArgs.includes(command)));
if (isSchemaMutationCommand) {
  validatePrismaMutationArgs(prismaArgs, {
    databaseUrl,
    ...explicitTarget,
  });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: databaseUrl }
});
