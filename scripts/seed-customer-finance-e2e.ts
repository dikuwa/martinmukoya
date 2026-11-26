import { validateMigrationTarget } from "./migration-target";

async function main() {
  validateMigrationTarget({ databaseUrl: process.env.DATABASE_URL, environment: process.env.DATABASE_ENV, expectedHost: process.env.DATABASE_EXPECTED_HOST, expectedDatabase: process.env.DATABASE_EXPECTED_NAME, productionApproved: process.env.DATABASE_PRODUCTION_MIGRATION_APPROVED });
  const { getDb } = await import("../src/lib/db");
  const host = new URL(process.env.DATABASE_URL || "postgresql://invalid@invalid/invalid").hostname;
  if (!["localhost", "127.0.0.1"].includes(host)) throw new Error("Synthetic seed must target local PostgreSQL only");
  const db = getDb();
  await db.site.createMany({
    data: [
      { name: "Martin Mukoya", slug: "martin-mukoya", primaryDomain: "martinmukoya.com", aliases: ["localhost", "127.0.0.1"] },
      { name: "FlexTech Media", slug: "flextech-media", primaryDomain: "flextech-media.com", aliases: ["flextech-media.localhost"] },
    ],
    skipDuplicates: true,
  });
  await db.$disconnect();
}
main().catch(error => { console.error(error); process.exitCode = 1; });
