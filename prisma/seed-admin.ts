import "dotenv/config";
import { auth } from "../src/lib/auth";
import { getDb } from "../src/lib/db";
import { UserRole } from "../src/generated/prisma/client";

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "info@martinmukoya.com";
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Martin Mukoya";

  if (!password) {
    throw new Error("ADMIN_PASSWORD is required to seed a sign-in ready admin account.");
  }

  await auth.api.signUpEmail({
    body: { email, password, name }
  });

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
  .finally(() => getDb().$disconnect());
