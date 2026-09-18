import {
  pgTable,
  text,
  integer,
  timestamp,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";

// Postgres keeps real timestamps; mode "date" gives us Date objects back, so
// the rest of the app keeps working unchanged.
const tsMs = (name: string) =>
  timestamp(name, { mode: "date", withTimezone: true }).notNull().defaultNow();

export const cards = pgTable(
  "cards",
  {
    slug: text("slug").primaryKey(),
    name: text("name").notNull(),
    title: text("title").notNull(),
    company: text("company"),
    phone: text("phone"),
    email: text("email"),
    website: text("website"),
    whatsapp: text("whatsapp"),
    address: text("address"),
    linkedin: text("linkedin"),
    facebook: text("facebook"),
    instagram: text("instagram"),
    theme: text("theme").notNull().default("indigo"),
    template: text("template").notNull().default("halo"),
    photoUrl: text("photo_url"),
    logoUrl: text("logo_url"),
    // Products gallery: JSON array of {name, description, price, imageUrl}.
    products: text("products"),
    // "A propos" shown with the contacts on the verso.
    bio: text("bio"),
    // Customization: hex color override (#rrggbb), font choice, photo shape
    // and display-name size. All optional - empty keeps the theme defaults.
    customColor: text("custom_color"),
    fontFamily: text("font_family"),
    photoShape: text("photo_shape"),
    nameSize: text("name_size"),
    editToken: text("edit_token").notNull(),
    createdAt: tsMs("created_at"),
    updatedAt: tsMs("updated_at"),
  },
  (table) => ({
    slugIdx: index("cards_slug_idx").on(table.slug),
  })
);

// Daily counters per card. One row per (slug, day); composite primary key
// gives us idempotent upserts (onConflictDoUpdate) and fast range queries.
export const cardScans = pgTable(
  "card_scans",
  {
    slug: text("slug").notNull(),
    day: text("day").notNull(), // YYYY-MM-DD
    count: integer("count").notNull().default(0),
    lastSeenAt: tsMs("last_seen_at"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.slug, table.day] }),
    slugIdx: index("card_scans_slug_idx").on(table.slug),
  })
);

export type CardRow = typeof cards.$inferSelect;
export type CardInsert = typeof cards.$inferInsert;
export type CardScanRow = typeof cardScans.$inferSelect;

export const THEME_OPTIONS = [
  "indigo",
  "emerald",
  "rose",
  "amber",
  "sky",
  "violet",
] as const;

export type ThemeKey = (typeof THEME_OPTIONS)[number];

export const TEMPLATE_OPTIONS = [
  "halo",
  "blob",
  "vagues",
  "spherique",
  "arche",
  "vortex",
  "modernix",
  "prestige",
  "fluide",
  "hexagone",
] as const;

export type TemplateKey = (typeof TEMPLATE_OPTIONS)[number];
