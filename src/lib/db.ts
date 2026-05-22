import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { pgPool?: Pool; prisma?: PrismaClient };

function getPgPool() {
  if (!globalForPrisma.pgPool) {
    globalForPrisma.pgPool = new Pool({
      connectionString: process.env.DATABASE_URL!,
      max: 1
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
