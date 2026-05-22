/**
 * One-time script to update the FlexTech Media site record.
 *
 * The production database still has primaryDomain = "flextechmedia.com"
 * (no hyphen) but the actual domain is flextech-media.com (with hyphen).
 *
 * Usage:
 *   DATABASE_URL="<production-db-url>" npx tsx scripts/update-flextech-domain.ts
 *
 * Or if your .env already has the production DATABASE_URL:
 *   npx tsx scripts/update-flextech-domain.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const site = await prisma.site.findUnique({
    where: { slug: "flextech-media" },
  });

  if (!site) {
    console.error("❌ FlexTech Media site not found in database.");
    process.exit(1);
  }

  console.log("📋 Current record:");
  console.log(`   ID:            ${site.id}`);
  console.log(`   Name:          ${site.name}`);
  console.log(`   Slug:          ${site.slug}`);
  console.log(`   PrimaryDomain: ${site.primaryDomain}`);
  console.log(`   Aliases:       ${(site.aliases as string[]).join(", ")}`);

  const updated = await prisma.site.update({
    where: { slug: "flextech-media" },
    data: {
      primaryDomain: "flextech-media.com",
      aliases: ["www.flextech-media.com"],
    },
  });

  console.log("\n✅ Updated record:");
  console.log(`   PrimaryDomain: ${updated.primaryDomain}`);
  console.log(`   Aliases:       ${(updated.aliases as string[]).join(", ")}`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
