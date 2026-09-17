import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PublicCardView } from "@/components/PublicCardView";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// We can't read the request origin at metadata time (Next.js convention:
// generateMetadata runs server-side without request context for OG image URLs),
// so we point OG at a relative path served by /api/og/[slug]. The page sets
// the absolute og:url in the head with the proper origin.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const card = (
    await db.select().from(cards).where(eq(cards.slug, slug)).limit(1)
  )[0];
  if (!card) {
    return { title: "Carte introuvable · MyCard" };
  }
  const title = `${card.name}${card.title ? " — " + card.title : ""}`;
  const description = card.company
    ? `${card.name}, ${card.title} chez ${card.company}. Carte de visite numérique.`
    : `${card.name}${card.title ? ", " + card.title : ""}. Carte de visite numérique.`;
  return {
    title: `${title} · MyCard`,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: [
        {
          url: `/api/og/${slug}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og/${slug}`],
    },
  };
}

export default async function CardPublicPage({ params }: PageProps) {
  const { slug } = await params;
  if (!slug || !/^[a-z0-9-]{1,80}$/.test(slug)) {
    return <NotFoundView />;
  }
  const rows = await db
    .select()
    .from(cards)
    .where(eq(cards.slug, slug))
    .limit(1);
  const card = rows[0];
  if (!card) {
    return <NotFoundView />;
  }
  return <PublicCardView card={card} />;
}

function NotFoundView() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
        Carte introuvable
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Le lien que tu as ouvert ne correspond à aucune carte. Vérifie l'URL ou
        crée ta propre carte en quelques clics.
      </p>
      <div className="mt-6">
        <Link
          href="/creer"
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Créer ma carte
        </Link>
      </div>
    </div>
  );
}
