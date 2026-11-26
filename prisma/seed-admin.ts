import dotenv from "dotenv";
import { hashPassword } from "better-auth/crypto";
import { UserRole } from "../src/generated/prisma/client";
import { validateMigrationTarget } from "../scripts/migration-target";

const explicitTarget = { databaseUrl: process.env.DATABASE_URL, environment: process.env.DATABASE_ENV, expectedHost: process.env.DATABASE_EXPECTED_HOST, expectedDatabase: process.env.DATABASE_EXPECTED_NAME, productionApproved: process.env.DATABASE_PRODUCTION_MIGRATION_APPROVED };
dotenv.config({ path: ".env.local" });
validateMigrationTarget(explicitTarget);

async function main() {
  const { auth } = await import("../src/lib/auth");
  const { getDb } = await import("../src/lib/db");
  const email = process.env.ADMIN_EMAIL ?? "info@martinmukoya.com";
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Martin Mukoya";

  if (!password) {
    throw new Error("ADMIN_PASSWORD is required to seed a sign-in ready admin account.");
  }

  const existingUser = await getDb().user.findUnique({ where: { email } });

  if (existingUser) {
    const passwordHash = await hashPassword(password);

    await getDb().account.deleteMany({
      where: {
        userId: existingUser.id,
        providerId: "credential"
      }
    });

    await getDb().account.create({
      data: {
        id: crypto.randomUUID(),
        userId: existingUser.id,
        providerId: "credential",
        accountId: existingUser.id,
        password: passwordHash
      }
    });
  } else {
    await auth.api.signUpEmail({
      body: { email, password, name }
    });
  }

  await getDb().user.update({
    where: { email },
    data: { role: UserRole.ADMIN, emailVerified: true }
  });

  console.log(`Admin account ready: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    const { getDb } = await import("../src/lib/db");
    await getDb().$disconnect();
  });
