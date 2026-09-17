import { NextResponse } from "next/server";
import { db } from "@/db";
import { cardScans, cards } from "@/db/schema";
import { eq, sql, and, gte, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!slug || !/^[a-z0-9-]{1,80}$/.test(slug)) {
    return NextResponse.json({ error: "Slug invalide." }, { status: 400 });
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  if (!token) {
    return NextResponse.json({ error: "Token requis." }, { status: 401 });
  }

  const card = (
    await db.select().from(cards).where(eq(cards.slug, slug)).limit(1)
  )[0];
  if (!card) {
    return NextResponse.json({ error: "Carte introuvable." }, { status: 404 });
  }
  if (card.editToken !== token) {
    return NextResponse.json({ error: "Token invalide." }, { status: 403 });
  }

  // Last 30 days, day by day, with zero-filling handled client-side.
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - 29);

  const rows = await db
    .select({
      day: cardScans.day,
      count: cardScans.count,
      lastSeenAt: cardScans.lastSeenAt,
    })
    .from(cardScans)
    .where(and(eq(cardScans.slug, slug), gte(cardScans.day, since.toISOString().slice(0, 10))))
    .orderBy(desc(cardScans.day));

  const total = rows.reduce((acc, r) => acc + r.count, 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = rows.find((r) => r.day === today)?.count ?? 0;
  const lastSeenAt = rows[0]?.lastSeenAt ?? null;

  // Build a 30-day series with explicit zeros so the chart is complete.
  const series: Array<{ day: string; count: number }> = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    const row = rows.find((r) => r.day === key);
    series.push({ day: key, count: row?.count ?? 0 });
  }

  return NextResponse.json({
    total,
    today: todayCount,
    lastSeenAt: lastSeenAt ? lastSeenAt.toISOString() : null,
    series,
  });
}
