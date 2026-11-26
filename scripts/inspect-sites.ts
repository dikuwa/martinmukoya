import { config as dotenvConfig } from 'dotenv';
import { validateMigrationTarget } from './migration-target';
const explicitTarget = { databaseUrl: process.env.DATABASE_URL, environment: process.env.DATABASE_ENV, expectedHost: process.env.DATABASE_EXPECTED_HOST, expectedDatabase: process.env.DATABASE_EXPECTED_NAME, productionApproved: process.env.DATABASE_PRODUCTION_MIGRATION_APPROVED };
dotenvConfig({ path: './.env.local' });
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
validateMigrationTarget(explicitTarget);
(async () => {
  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try {
    const rows = await client.site.findMany({ select: { slug: true, primaryDomain: true, aliases: true }, orderBy: { slug: 'asc' } });
    console.log(JSON.stringify(rows, null, 2));
  } finally {
    await client.$disconnect();
  }
})();
