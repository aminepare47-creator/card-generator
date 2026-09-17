"use client";

import Link from "next/link";
import { useState } from "react";
import type { MyCardEntry } from "@/lib/my-cards";

interface EnrichedEntry extends MyCardEntry {
  updatedAt: Date | null;
  deleted: boolean;
}

interface MyCardsListProps {
  entries: EnrichedEntry[];
}

export function MyCardsList({ entries: initial }: MyCardsListProps) {
  const [entries, setEntries] = useState(initial);

  function forget(slug: string) {
    // Clear locally + drop from cookie via API so it doesn't reappear on refresh.
    setEntries((cur) => cur.filter((e) => e.slug !== slug));
    // Fire and forget.
    fetch("/api/my-cards", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <div className="space-y-3">
      {entries.map((e) => (
        <article
          key={e.slug}
          className={`flex flex-wrap items-center gap-3 rounded-2xl border p-4 shadow-sm sm:flex-nowrap ${
            e.deleted
              ? "border-slate-200 bg-slate-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-indigo-100 text-base font-semibold text-indigo-700">
            {(e.name?.[0] ?? "·").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900">{e.name}</p>
            <p className="truncate text-sm text-slate-500">
              {e.title || <em className="text-slate-400">Pas de poste</em>}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {e.deleted
                ? "Carte supprimée ou inexistante"
                : e.updatedAt
                  ? `Mise à jour le ${new Date(e.updatedAt).toLocaleDateString("fr-FR")}`
                  : `Créée le ${new Date(e.savedAt).toLocaleDateString("fr-FR")}`}
            </p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-nowrap">
            <Link
              href={`/c/${e.slug}`}
              target="_blank"
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 sm:flex-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Voir
            </Link>
            <Link
              href={`/c/${e.slug}/modifier?token=${encodeURIComponent(e.token)}`}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:flex-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Modifier
            </Link>
            <button
              type="button"
              onClick={() => forget(e.slug)}
              className="inline-flex items-center justify-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-700 sm:flex-none"
              title="Retirer de la liste (ne supprime pas la carte)"
            >
              Oublier
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
