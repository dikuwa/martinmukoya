import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { pgPool?: Pool; prisma?: PrismaClient };

function getPgPool() {
  if (!globalForPrisma.pgPool) {
    const configuredUrl = process.env.DATABASE_URL!;
    const connectionString = configuredUrl.includes("pooler.supabase.com")
      ? configuredUrl.replace(":5432/", ":6543/")
      : configuredUrl;
    globalForPrisma.pgPool = new Pool({
      connectionString,
      max: 1,
      idleTimeoutMillis: 5_000,
      connectionTimeoutMillis: 10_000,
      allowExitOnIdle: true
    });
  }

  return globalForPrisma.pgPool;
}

export function getDb() {
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg(getPgPool());
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.prisma;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  }
});
