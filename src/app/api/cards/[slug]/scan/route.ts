import { NextResponse } from "next/server";
import { db } from "@/db";
import { cards, cardScans } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Per-IP dedupe: counting every page-load from a single visitor 30 times in a
// row inflates numbers without telling us anything. So a given (slug, IP, day)
// only increments the counter once.
const SCAN_LIMIT = { windowMs: 60 * 60 * 1000, max: 60 };

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!slug || !/^[a-z0-9-]{1,80}$/.test(slug)) {
    return NextResponse.json({ error: "Slug invalide." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`scan:${ip}:${slug}`, SCAN_LIMIT);
  if (!limit.allowed) {
    // Don't error out — silent no-op so we don't break the public page.
    return NextResponse.json({ ok: true, deduped: true });
  }

  // Confirm the card exists before recording; protects against scanning random
  // slugs to pollute the table.
  const exists = await db
    .select({ slug: cards.slug })
    .from(cards)
    .where(eq(cards.slug, slug))
    .limit(1);
  if (exists.length === 0) {
    return NextResponse.json({ error: "Carte introuvable." }, { status: 404 });
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Upsert: +1 to today's row, also bump last_seen_at.
  await db
    .insert(cardScans)
    .values({ slug, day: today, count: 1, lastSeenAt: new Date() })
    .onConflictDoUpdate({
      target: [cardScans.slug, cardScans.day],
      set: {
        count: sql`${cardScans.count} + 1`,
        lastSeenAt: new Date(),
      },
    });

  return NextResponse.json({ ok: true });
}
