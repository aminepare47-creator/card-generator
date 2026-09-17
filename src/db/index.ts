import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

// SQLite file location (configurable via env, defaults to ./data/carte.db).
const dbFile = process.env.DB_FILE_NAME?.trim()
  ? path.resolve(process.env.DB_FILE_NAME.trim())
  : path.join(process.cwd(), "data", "carte.db");

// better-sqlite3 requires the parent directory to exist.
fs.mkdirSync(path.dirname(dbFile), { recursive: true });

const globalForDb = globalThis as typeof globalThis & {
  __carteProSqlite?: InstanceType<typeof Database>;
};

export const sqlite =
  globalForDb.__carteProSqlite ??
  new Database(dbFile, {
    // WAL mode = better concurrency for a local Next.js app.
    fileMustExist: false,
  });

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

if (process.env.NODE_ENV !== "production") {
  globalForDb.__carteProSqlite = sqlite;
}

export const db = drizzle(sqlite);
