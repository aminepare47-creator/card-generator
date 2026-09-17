// One-off script: creates the SQLite tables (idempotent).
const Database = require("better-sqlite3");
const fs = require("node:fs");
const path = require("node:path");

const dbPath = path.join(__dirname, "..", "data", "carte.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS cards (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  whatsapp TEXT,
  address TEXT,
  linkedin TEXT,
  facebook TEXT,
  instagram TEXT,
  theme TEXT NOT NULL DEFAULT 'indigo',
  template TEXT NOT NULL DEFAULT 'classique',
  photo_url TEXT,
  edit_token TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS cards_slug_idx ON cards(slug);
CREATE TABLE IF NOT EXISTS card_scans (
  slug TEXT NOT NULL,
  day TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  last_seen_at INTEGER NOT NULL,
  PRIMARY KEY (slug, day)
);
CREATE INDEX IF NOT EXISTS card_scans_slug_idx ON card_scans(slug);
`);

console.log("TABLES_OK");
db.close();