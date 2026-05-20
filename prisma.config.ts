import dotenv from "dotenv";
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

dotenv.config({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") }
});
