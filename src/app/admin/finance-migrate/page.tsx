import { readFile } from "fs/promises";
import path from "path";
import { Pool } from "pg";

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const client = await pool.connect();
  try {
    const existing = await client.query(`SELECT to_regclass('public."Booking"') AS table_name`);
    if (existing.rows[0]?.table_name) return "The financial migration was already applied.";
    const sql = await readFile(path.join(process.cwd(), "prisma/migrations/20260711033000_financial_documents/migration.sql"), "utf8");
    await client.query("BEGIN"); await client.query(sql); await client.query("COMMIT");
    return "The bookings, documents, and payments migration was applied successfully.";
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    return `Migration failed: ${error instanceof Error ? error.message : "Unknown error"}`;
  } finally { client.release(); await pool.end(); }
}

export default async function FinanceMigrationPage(){const result=await migrate();return <div className="mx-auto grid max-w-xl gap-5 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-8"><h1 className="font-display text-3xl font-black">Financial migration complete</h1><p className="text-sm text-[color:var(--text-muted)]">{result}</p></div>}
