import { ImageResponse } from "next/og";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { eq } from "drizzle-orm";
import { themeTokens, initials } from "@/lib/utils";

export const runtime = "nodejs";
// Cached at the edge for a short window so social previews stay snappy and
// we don't hammer the DB.
export const dynamic = "force-dynamic";

const THEME_HEX: Record<string, { bg: string; accent: string; onAccent: string }> = {
  indigo: { bg: "#4f46e5", accent: "#4f46e5", onAccent: "#ffffff" },
  emerald: { bg: "#059669", accent: "#059669", onAccent: "#ffffff" },
  rose: { bg: "#e11d48", accent: "#e11d48", onAccent: "#ffffff" },
  amber: { bg: "#f59e0b", accent: "#f59e0b", onAccent: "#ffffff" },
  sky: { bg: "#0284c7", accent: "#0284c7", onAccent: "#ffffff" },
  violet: { bg: "#7c3aed", accent: "#7c3aed", onAccent: "#ffffff" },
};

// Hardcoded font stack — @vercel/og bundles Inter for us on the server.
export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!slug || !/^[a-z0-9-]{1,80}$/.test(slug)) {
    return new Response("Bad slug", { status: 400 });
  }

  const card = (
    await db.select().from(cards).where(eq(cards.slug, slug)).limit(1)
  )[0];
  if (!card) return new Response("Not found", { status: 404 });

  const tokens = THEME_HEX[card.theme] ?? THEME_HEX.indigo;
  // Dark templates need light text on the OG image too.
  const isDark = ["halo", "spherique", "modernix", "prestige", "hexagone"].includes(card.template);

  const lines: Array<{ label: string; value: string }> = [];
  if (card.phone) lines.push({ label: "Téléphone", value: card.phone });
  if (card.email) lines.push({ label: "E-mail", value: card.email });
  if (card.website) lines.push({ label: "Site", value: card.website.replace(/^https?:\/\//, "") });
  if (card.address) lines.push({ label: "Adresse", value: card.address });
  if (card.whatsapp)
    lines.push({ label: "WhatsApp", value: `+${card.whatsapp.replace(/[^\d]/g, "")}` });
  if (lines.length === 0 && card.company) {
    lines.push({ label: "Entreprise", value: card.company });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          fontFamily: "Inter, system-ui, sans-serif",
          background: isDark ? "#0f172a" : "#f8fafc",
          padding: 48,
        }}
      >
        {/* Left band */}
        <div
          style={{
            width: 240,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: tokens.bg,
            borderRadius: 24,
            padding: 32,
            color: "#ffffff",
          }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 9999,
              background: "#ffffff",
              color: tokens.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 56,
              fontWeight: 700,
              marginBottom: 24,
            }}
          >
            {initials(card.name)}
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              textAlign: "center",
              lineHeight: 1.1,
              maxWidth: 200,
            }}
          >
            {card.name}
          </div>
          {card.title ? (
            <div
              style={{
                fontSize: 16,
                opacity: 0.9,
                marginTop: 8,
                textAlign: "center",
                maxWidth: 200,
              }}
            >
              {card.title}
            </div>
          ) : null}
          {card.company ? (
            <div
              style={{
                fontSize: 14,
                opacity: 0.75,
                marginTop: 12,
                textAlign: "center",
                maxWidth: 200,
              }}
            >
              {card.company}
            </div>
          ) : null}
        </div>

        {/* Right content */}
        <div
          style={{
            flex: 1,
            marginLeft: 40,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            color: isDark ? "#f1f5f9" : "#0f172a",
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: tokens.bg,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
              display: "flex",
              marginBottom: 12,
            }}
          >
            Carte Pro
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              lineHeight: 1.1,
              display: "flex",
              marginBottom: 8,
            }}
          >
            {card.name}
          </div>
          {card.title ? (
            <div
              style={{
                fontSize: 22,
                opacity: 0.8,
                display: "flex",
                marginBottom: 28,
              }}
            >
              {card.title}
              {card.company ? <span style={{ opacity: 0.6 }}> · {card.company}</span> : null}
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              fontSize: 20,
            }}
          >
            {lines.slice(0, 4).map((l) => (
              <div
                key={l.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  color: isDark ? "#e2e8f0" : "#334155",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9999,
                    background: tokens.bg,
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {l.label[0]}
                </div>
                <div style={{ display: "flex" }}>{l.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "cache-control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
