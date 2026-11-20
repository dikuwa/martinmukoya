import { getDb } from "../src/lib/db";

async function main() {
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
