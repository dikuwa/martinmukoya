import { readFile } from "fs/promises";
import path from "path";
import { Pool } from "pg";
import { requireAdmin } from "@/lib/auth-guard";

export const runtime = "nodejs";
export async function POST() {
  const { error } = await requireAdmin(); if (error) return error;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const client = await pool.connect();
  try {
    const existing = await client.query(`SELECT to_regclass('public."Booking"') AS table_name`);
    if (existing.rows[0]?.table_name) return Response.json({ migrated: false, alreadyApplied: true });
    const sql = await readFile(path.join(process.cwd(), "prisma/migrations/20260711033000_financial_documents/migration.sql"), "utf8");
    await client.query("BEGIN"); await client.query(sql); await client.query("COMMIT");
    return Response.json({ migrated: true });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    return Response.json({ error: error instanceof Error ? error.message : "Migration failed" }, { status: 500 });
  } finally { client.release(); await pool.end(); }
}

export const GET = POST;
