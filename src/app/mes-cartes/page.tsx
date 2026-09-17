import Link from "next/link";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { readMyCardsFromCookies } from "@/lib/my-cards";
import { MyCardsList } from "@/components/MyCardsList";

export const dynamic = "force-dynamic";

export default async function MesCartesPage() {
  const entries = await readMyCardsFromCookies();

  // Fetch the actual card rows (if still in DB).
  let liveCards: Array<{ slug: string; name: string; title: string; updatedAt: Date }> = [];
  if (entries.length > 0) {
    const slugs = entries.map((e) => e.slug);
    const rows = await db
      .select({
        slug: cards.slug,
        name: cards.name,
        title: cards.title,
        updatedAt: cards.updatedAt,
      })
      .from(cards)
      .where(inArray(cards.slug, slugs));
    liveCards = rows;
  }

  // Merge: keep the cookie's order (most recent first), enrich with live data.
  const enriched = entries
    .map((e) => {
      const live = liveCards.find((c) => c.slug === e.slug);
      return {
        ...e,
        updatedAt: live?.updatedAt ?? null,
        deleted: !live,
      };
    })
    .slice(0, 30);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-indigo-600">Tes cartes</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Mes cartes
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Cette page liste les cartes que tu as créées ou modifiées depuis ce
          navigateur. Si tu changes d'ordinateur ou de navigateur, les liens
          ci-dessous ne fonctionneront plus — garde ton lien d'édition
          confidentiel.
        </p>
      </header>

      {enriched.length === 0 ? (
        <EmptyState />
      ) : (
        <MyCardsList entries={enriched} />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M3 12h18" />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">
        Aucune carte pour l'instant
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Crée ta première carte : elle apparaîtra automatiquement ici.
      </p>
      <Link
        href="/creer"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
      >
        Créer ma première carte
      </Link>
    </div>
  );
}
