import { UserRole } from "../src/generated/prisma/client";
import { getDb } from "../src/lib/db";

const db = getDb();

async function main() {
  await db.user.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? "info@martinmukoya.com" },
    update: { role: UserRole.ADMIN },
    create: {
      id: "seed-admin",
      name: process.env.ADMIN_NAME ?? "Martin Mukoya",
      email: process.env.ADMIN_EMAIL ?? "info@martinmukoya.com",
      emailVerified: true,
      role: UserRole.ADMIN
    }
  });

  console.log("Database seeded");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
