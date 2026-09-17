import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { cards, THEME_OPTIONS, TEMPLATE_OPTIONS } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isValidEmail, isValidUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  if (!slug || !/^[a-z0-9-]{1,80}$/.test(slug)) {
    return NextResponse.json({ error: "Slug invalide." }, { status: 400 });
  }
  const rows = await db.select().from(cards).where(eq(cards.slug, slug)).limit(1);
  const card = rows[0];
  if (!card) return NextResponse.json({ error: "Carte introuvable." }, { status: 404 });
  return NextResponse.json({ card });
}

const UpdateSchema = z.object({
  token: z.string().min(8, "Token manquant"),
  name: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(160),
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

export async function PATCH(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  if (!slug || !/^[a-z0-9-]{1,80}$/.test(slug)) {
    return NextResponse.json({ error: "Slug invalide." }, { status: 400 });
  }
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const parsed = UpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const existing = await db
    .select()
    .from(cards)
    .where(eq(cards.slug, slug))
    .limit(1);
  const card = existing[0];
  if (!card) {
    return NextResponse.json({ error: "Carte introuvable." }, { status: 404 });
  }
  if (card.editToken !== data.token) {
    return NextResponse.json({ error: "Lien d'édition invalide." }, { status: 403 });
  }

  const updated = await db
    .update(cards)
    .set({
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
      theme: data.theme ?? card.theme,
      template: data.template ?? card.template,
      photoUrl: data.photoUrl ?? null,
      logoUrl: data.logoUrl ?? null,
      products: data.products ? JSON.stringify(data.products) : null,
      bio: data.bio ?? null,
      customColor: data.customColor || null,
      fontFamily: data.fontFamily || null,
      photoShape: data.photoShape || null,
      nameSize: data.nameSize || null,
      updatedAt: new Date(),
    })
    .where(eq(cards.slug, slug))
    .returning();

  return NextResponse.json({ card: updated[0] });
}
