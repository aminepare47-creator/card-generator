import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/db";
import { cards, THEME_OPTIONS, TEMPLATE_OPTIONS } from "@/db/schema";
import { generateEditToken, generateSlug, isValidEmail, isValidUrl } from "@/lib/utils";
import { readMyCardsFromCookies, type MyCardEntry } from "@/lib/my-cards";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const CardInputSchema = z.object({
  name: z.string().trim().min(1, "Le nom est obligatoire").max(120),
  title: z.string().trim().min(1, "Le poste est obligatoire").max(160),
  company: z.string().trim().max(160).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  email: z
    .string()
    .trim()
    .max(160)
    .optional()
    .nullable()
    .refine((v) => !v || isValidEmail(v), "Adresse email invalide"),
  website: z
    .string()
    .trim()
    .max(300)
    .optional()
    .nullable()
    .refine((v) => !v || isValidUrl(v), "URL invalide (doit commencer par http(s)://)"),
  whatsapp: z.string().trim().max(40).optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  linkedin: z.string().trim().max(300).optional().nullable(),
  facebook: z.string().trim().max(300).optional().nullable(),
  instagram: z.string().trim().max(300).optional().nullable(),
  theme: z.enum(THEME_OPTIONS).optional(),
  template: z.enum(TEMPLATE_OPTIONS).optional(),
  photoUrl: z
    .string()
    .trim()
    .max(600)
    .optional()
    .nullable()
    .refine((v) => !v || isValidUrl(v), "URL de photo invalide"),
  logoUrl: z
    .string()
    .trim()
    .max(600)
    .optional()
    .nullable()
    .refine((v) => !v || isValidUrl(v), "URL de logo invalide"),
  products: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        description: z.string().trim().max(400).optional().nullable(),
        price: z.string().trim().max(40).optional().nullable(),
        imageUrl: z
          .string()
          .trim()
          .max(600)
          .optional()
          .nullable()
          .refine((v) => !v || isValidUrl(v), "URL d'image produit invalide"),
      })
    )
    .max(12)
    .optional()
    .nullable(),
  bio: z.string().trim().max(600).optional().nullable(),
  customColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide (format #rrggbb)")
    .optional()
    .nullable()
    .or(z.literal("")),
  fontFamily: z.enum(["", "sans", "serif", "mono"]).optional().nullable(),
  photoShape: z.enum(["", "circle", "rounded", "square"]).optional().nullable(),
  nameSize: z.enum(["", "sm", "md", "lg"]).optional().nullable(),
});

async function findAvailableSlug(baseSeed: string): Promise<string> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const candidate = attempt === 0 ? generateSlug(baseSeed) : `${slugifyAttempt(baseSeed)}-${randomShort(attempt)}`;
    const existing = await db
      .select({ slug: cards.slug })
      .from(cards)
      .where(eq(cards.slug, candidate))
      .limit(1);
    if (existing.length === 0) return candidate;
  }
  // Last resort: long random slug.
  return `carte-${Date.now().toString(36)}-${randomShort(4)}`;
}

function slugifyAttempt(name: string): string {
  // Same as generateSlug but without the random suffix.
  const base = generateSlug(name).replace(/-[a-z0-9]{4}$/, "");
  return base || "carte";
}

function randomShort(len: number): string {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += Math.floor(Math.random() * 36).toString(36);
  }
  return out;
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const parsed = CardInputSchema.safeParse(json);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Données invalides.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  const data = parsed.data;

  const slug = await findAvailableSlug(data.name);
  const editToken = generateEditToken();

  const inserted = await db
    .insert(cards)
    .values({
      slug,
      editToken,
      name: data.name,
      title: data.title,
      company: data.company ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      website: data.website ?? null,
      whatsapp: data.whatsapp ?? null,
      address: data.address ?? null,
      linkedin: data.linkedin ?? null,
      facebook: data.facebook ?? null,
      instagram: data.instagram ?? null,
      theme: data.theme ?? "indigo",
      template: data.template ?? "halo",
      photoUrl: data.photoUrl ?? null,
      logoUrl: data.logoUrl ?? null,
      products: data.products ? JSON.stringify(data.products) : null,
      bio: data.bio ?? null,
      customColor: data.customColor || null,
      fontFamily: data.fontFamily || null,
      photoShape: data.photoShape || null,
      nameSize: data.nameSize || null,
    })
    .returning();

  const card = inserted[0];
  if (!card) {
    return NextResponse.json(
      { error: "Impossible d'enregistrer la carte." },
      { status: 500 },
    );
  }

  // Drop a cookie so the user can find this card again later from "Mes cartes".
  try {
    const existing = await readMyCardsFromCookies();
    const entry: MyCardEntry = {
      slug: card.slug,
      token: card.editToken,
      name: card.name,
      title: card.title,
      savedAt: Date.now(),
    };
    const dedup = existing.filter((e) => e.slug !== entry.slug);
    dedup.unshift(entry);
    const trimmed = dedup.slice(0, 30);
    const cookieStore = await cookies();
    cookieStore.set({
      name: "cp_my_cards",
      value: Buffer.from(JSON.stringify(trimmed)).toString("base64"),
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  } catch {
    // Cookie failures are non-fatal.
  }

  return NextResponse.json({ card }, { status: 201 });
}
