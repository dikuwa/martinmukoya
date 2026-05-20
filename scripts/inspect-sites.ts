import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: './.env.local' });
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
(async () => {
  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try {
    const rows = await client.site.findMany({ select: { slug: true, primaryDomain: true, aliases: true }, orderBy: { slug: 'asc' } });
    console.log(JSON.stringify(rows, null, 2));
  } finally {
    await client.$disconnect();
  }
})();
