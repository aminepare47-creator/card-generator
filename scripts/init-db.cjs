// One-off script: creates the Postgres tables (idempotent).
// Usage: node scripts/init-db.cjs
require("dotenv").config();
const { Client } = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL manquant (voir .env.example).");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: /supabase|neon|render|amazonaws/i.test(connectionString)
    ? { rejectUnauthorized: false }
    : undefined,
});

const DDL = `
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
  template TEXT NOT NULL DEFAULT 'halo',
  photo_url TEXT,
  logo_url TEXT,
  products TEXT,
  bio TEXT,
  custom_color TEXT,
  font_family TEXT,
  photo_shape TEXT,
  name_size TEXT,
  edit_token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cards_slug_idx ON cards(slug);

CREATE TABLE IF NOT EXISTS card_scans (
  slug TEXT NOT NULL,
  day TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (slug, day)
);
CREATE INDEX IF NOT EXISTS card_scans_slug_idx ON card_scans(slug);
`;

(async () => {
  await client.connect();
  await client.query(DDL);
  console.log("TABLES_OK");
  await client.end();
})().catch((err) => {
  console.error("Erreur:", err.message);
  process.exit(1);
});