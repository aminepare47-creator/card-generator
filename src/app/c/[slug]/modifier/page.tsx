"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CardForm, cardFromRow, valuesToPayload, type CardFormValues } from "@/components/CardForm";
import { StatsDashboard } from "@/components/StatsDashboard";
import type { CardRow } from "@/db/schema";

export default function ModifierPage() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const slug = (params?.slug as string) ?? "";
  const token = search?.get("token") ?? "";

  const [initial, setInitial] = useState<CardFormValues | null>(null);
  const [status, setStatus] = useState<
    | { kind: "loading" }
    | { kind: "ok"; card: CardRow }
    | { kind: "invalid-token" }
    | { kind: "not-found" }
    | { kind: "error"; message: string }
  >({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/cards/${encodeURIComponent(slug)}`, { cache: "no-store" });
        if (cancelled) return;
        if (res.status === 404) {
          setStatus({ kind: "not-found" });
          return;
        }
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setStatus({ kind: "error", message: json?.error ?? "Carte introuvable." });
          return;
        }
        const card: CardRow | undefined = json?.card;
        if (!card) {
          setStatus({ kind: "not-found" });
          return;
        }
        setInitial(cardFromRow(card));
        setStatus({ kind: "ok", card });
      } catch {
        if (!cancelled) setStatus({ kind: "error", message: "Erreur réseau." });
      }
    }
    if (slug) load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!token) {
    return <InvalidTokenView />;
  }

  if (status.kind === "loading") {
    return (
      <div className="mx-auto max-w-md py-20 text-center text-slate-500">
        <p className="text-sm">Chargement de ta carte…</p>
      </div>
    );
  }

  if (status.kind === "not-found") {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Carte introuvable</h1>
        <p className="mt-2 text-sm text-slate-600">
          Cette carte n'existe pas (ou plus). Vérifie le lien.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  if (status.kind === "ok" && status.card.editToken !== token) {
    return <InvalidTokenView />;
  }

  if (status.kind === "error") {
    return (
      <div className="mx-auto max-w-md py-20 text-center text-slate-700">
        <h1 className="text-2xl font-semibold tracking-tight">Oups</h1>
        <p className="mt-2 text-sm">{status.message}</p>
      </div>
    );
  }

  if (!initial) return null;

  async function handleSubmit(payload: ReturnType<typeof valuesToPayload> & { token: string }) {
    const res = await fetch(`/api/cards/${encodeURIComponent(slug)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.error ?? "Impossible d'enregistrer les modifications.");
    }
    router.push(`/c/${slug}?updated=1`);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-indigo-600">Édition</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Modifie ta carte
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Les changements sont enregistrés immédiatement. Le lien public reste le même.
        </p>
      </header>
      <StatsDashboard slug={slug} token={token} />
      <CardForm
        initialValues={initial}
        mode="edit"
        editToken={token}
        liveSlug={slug}
        onSubmit={handleSubmit as any}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}

function InvalidTokenView() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose-50 text-rose-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
        Lien d'édition invalide
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Le jeton d'édition est manquant ou incorrect. Utilise le lien privé que
        tu as reçu à la création de ta carte.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
