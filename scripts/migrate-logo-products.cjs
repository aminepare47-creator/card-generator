// One-off script: ensures every column added after the first release exists
// (idempotent). Usage: node scripts/migrate-logo-products.cjs
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

const COLUMNS = [
  ["logo_url", "TEXT"],
  ["products", "TEXT"],
  ["bio", "TEXT"],
  ["custom_color", "TEXT"],
  ["font_family", "TEXT"],
  ["photo_shape", "TEXT"],
  ["name_size", "TEXT"],
];

(async () => {
  await client.connect();
  await client.query(
    `ALTER TABLE cards ALTER COLUMN template SET DEFAULT 'halo'`
  );
  for (const [name, type] of COLUMNS) {
    await client.query(`ALTER TABLE cards ADD COLUMN IF NOT EXISTS ${name} ${type}`);
    console.log("OK:", name);
  }
  console.log("Done.");
  await client.end();
})().catch((err) => {
  console.error("Erreur:", err.message);
  process.exit(1);
});
