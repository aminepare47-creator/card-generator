const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.join(__dirname, "..", "data", "carte.db"));

const cols = db.prepare("PRAGMA table_info(cards)").all().map((c) => c.name);
console.log("Existing columns:", cols.join(", "));

function addCol(name, ddl) {
  if (!cols.includes(name)) {
    db.prepare(`ALTER TABLE cards ADD COLUMN ${ddl}`).run();
    console.log("Added:", ddl);
  } else {
    console.log("Already present:", name);
  }
}

addCol("logo_url", `"logo_url" text`);
addCol("products", `"products" text`);
addCol("bio", `"bio" text`);
addCol("custom_color", `"custom_color" text`);
addCol("font_family", `"font_family" text`);
addCol("photo_shape", `"photo_shape" text`);
addCol("name_size", `"name_size" text`);

try {
  db.prepare(`ALTER TABLE cards ALTER COLUMN "template" SET DEFAULT 'halo'`).run();
  console.log("Default template -> halo");
} catch (e) {
  console.log("Default not changed (SQLite < 3.35?):", e.message);
}

console.log("Done.");
