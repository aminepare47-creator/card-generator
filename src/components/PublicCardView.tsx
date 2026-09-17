"use client";

import { useEffect, useMemo, useState } from "react";
import type { CardRow } from "@/db/schema";
import { FlipCard } from "@/components/CardTemplates";
import { downloadVCard } from "@/lib/utils";
import { QrCanvas, type QrStyleOptions } from "@/components/QrCanvas";
import { parseProducts, type ProductItem } from "@/components/CardForm";

interface PublicCardViewProps {
  card: CardRow;
}

export function PublicCardView({ card }: PublicCardViewProps) {
  const [origin, setOrigin] = useState<string>("");
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const products: ProductItem[] = useMemo(() => parseProducts(card.products), [card.products]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  // Best-effort scan ping. Failure is silent — we never want a stats hiccup
  // to break the public card view.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const controller = new AbortController();
    fetch(`/api/cards/${encodeURIComponent(card.slug)}/scan`, {
      method: "POST",
      keepalive: true,
      signal: controller.signal,
    }).catch(() => {});
    return () => controller.abort();
  }, [card.slug]);

  const publicUrl = origin ? `${origin}/c/${card.slug}` : `https://carte-pro.app/c/${card.slug}`;

  const qrOptions: QrStyleOptions = useMemo(
    () => ({
      data: publicUrl,
      size: 180,
      fgColor: "#0f172a",
      bgColor: "#ffffff",
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      errorCorrectionLevel: "M",
    }),
    [publicUrl],
  );

  async function share() {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: card.name,
          text: `${card.name}${card.title ? " — " + card.title : ""}`,
          url: publicUrl,
        });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(publicUrl);
      setSavedToast("Lien copié dans le presse-papiers.");
      setTimeout(() => setSavedToast(null), 2000);
    } catch {
      setSavedToast("Impossible de copier le lien. Copie-le manuellement.");
      setTimeout(() => setSavedToast(null), 3000);
    }
  }

  return (
    <div className="space-y-5">
      <div className="mx-auto w-full max-w-2xl">
        <FlipCard templateKey={card.template} card={card} qrUrl={`${origin || ""}/c/${card.slug}`} />
      </div>

      <div className="mx-auto flex max-w-md flex-wrap gap-2">
        <button
          type="button"
          onClick={() => downloadVCard(card)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Enregistrer le contact
        </button>
        <button
          type="button"
          onClick={share}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Partager
        </button>
      </div>

      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <QrCanvas options={qrOptions} />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Scan pour ouvrir
          </p>
          <p className="mt-1 truncate text-sm font-medium text-slate-900" title={publicUrl}>
            {publicUrl}
          </p>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Nos produits & services
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {products.map((p, i) => (
              <div
                key={i}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="aspect-square w-full overflow-hidden bg-slate-100">
                  {p.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-slate-300">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
                  {p.price ? (
                    <p className="mt-0.5 text-sm font-bold text-slate-900">{p.price}</p>
                  ) : null}
                  {p.description ? (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{p.description}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {savedToast ? (
        <div className="mx-auto max-w-md rounded-xl bg-emerald-50 px-4 py-2 text-center text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
          {savedToast}
        </div>
      ) : null}
    </div>
  );
}
