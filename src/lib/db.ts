import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { assertPreviewDatabaseIsolation } from "@/lib/database-isolation";

const globalForPrisma = globalThis as unknown as { pgPool?: Pool; prisma?: PrismaClient };

function getPgPool() {
  if (!globalForPrisma.pgPool) {
    const configuredUrl = process.env.DATABASE_URL!;
    const connectionString = configuredUrl.includes("pooler.supabase.com")
      ? configuredUrl.replace(":5432/", ":6543/")
      : configuredUrl;
    const pool = new Pool({
      connectionString,
      max: 1,
      idleTimeoutMillis: 5_000,
      connectionTimeoutMillis: 10_000,
      allowExitOnIdle: true
    });

    // Auth constructs its Prisma adapter while Next.js collects route metadata.
    // No database connection is allowed from an unisolated Preview, but creating
    // the adapter must remain safe during the build. pg.Pool.query also uses
    // Pool.connect, so guarding connects covers Prisma reads and writes.
    pool.connect = new Proxy(pool.connect, {
      apply(target, thisArg, args) {
        assertPreviewDatabaseIsolation({
          vercelEnv: process.env.VERCEL_ENV,
          databaseUrl: configuredUrl,
          isolationConfirmed: process.env.PREVIEW_DATABASE_ISOLATED,
        });
        return Reflect.apply(target, thisArg, args);
      }
    });
    globalForPrisma.pgPool = pool;
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
