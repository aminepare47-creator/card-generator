import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { readMyCardsFromCookies } from "@/lib/my-cards";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DeleteSchema = z.object({
  slug: z.string().min(1).max(80),
});

// Lets the client "forget" a card from its local cookie without touching the
// card itself (which lives in the database and is publicly accessible anyway).
export async function DELETE(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const parsed = DeleteSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Slug manquant." }, { status: 400 });
  }
  const { slug } = parsed.data;
  const existing = await readMyCardsFromCookies();
  const filtered = existing.filter((e) => e.slug !== slug);
  const store = await cookies();
  store.set({
    name: "cp_my_cards",
    value: Buffer.from(JSON.stringify(filtered)).toString("base64"),
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return NextResponse.json({ ok: true, remaining: filtered.length });
}
