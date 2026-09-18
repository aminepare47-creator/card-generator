import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Postgres connection (Neon / Supabase / any Postgres provider).
// The connection string comes from DATABASE_URL.
const connectionString =
  process.env.DATABASE_URL?.trim() ??
  "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

const globalForDb = globalThis as typeof globalThis & {
  __mycardPool?: Pool;
};

export const pool =
  globalForDb.__mycardPool ??
  new Pool({
    connectionString,
    ssl: /supabase|neon|render|amazonaws/i.test(connectionString)
      ? { rejectUnauthorized: false }
      : undefined,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__mycardPool = pool;
}

export const db = drizzle(pool);
