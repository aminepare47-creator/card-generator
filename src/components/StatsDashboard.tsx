"use client";

import { useEffect, useMemo, useState } from "react";

interface StatsResponse {
  total: number;
  today: number;
  lastSeenAt: string | null;
  series: Array<{ day: string; count: number }>;
}

interface StatsDashboardProps {
  slug: string;
  token: string;
}

export function StatsDashboard({ slug, token }: StatsDashboardProps) {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          `/api/cards/${encodeURIComponent(slug)}/stats?token=${encodeURIComponent(token)}`,
          { cache: "no-store" },
        );
        if (cancelled) return;
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          setError(json?.error ?? "Impossible de charger les statistiques.");
          return;
        }
        const json = (await res.json()) as StatsResponse;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError("Erreur réseau.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug, token]);

  const last7Total = useMemo(() => {
    if (!data) return 0;
    return data.series.slice(-7).reduce((acc, d) => acc + d.count, 0);
  }, [data]);

  const max = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, ...data.series.map((d) => d.count));
  }, [data]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Statistiques de visite
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Quand quelqu'un scanne ton QR ou ouvre ton lien, on compte une vue.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setError(null);
            fetch(
              `/api/cards/${encodeURIComponent(slug)}/stats?token=${encodeURIComponent(token)}`,
              { cache: "no-store" },
            )
              .then((r) => r.json())
              .then((json) => setData(json))
              .catch(() => setError("Erreur réseau."))
              .finally(() => setLoading(false));
          }}
          className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Rafraîchir
        </button>
      </header>

      {loading && !data ? (
        <div className="grid grid-cols-3 gap-3">
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
        </div>
      ) : error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : data ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatBox
              label="Vues aujourd'hui"
              value={data.today}
              highlight={data.today > 0}
            />
            <StatBox
              label="7 derniers jours"
              value={last7Total}
            />
            <StatBox
              label="Total"
              value={data.total}
            />
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
              30 derniers jours
            </p>
            <Sparkline series={data.series} max={max} />
          </div>

          <p className="mt-3 text-xs text-slate-500">
            {data.lastSeenAt
              ? `Dernière vue : ${formatRelative(data.lastSeenAt)}.`
              : "Pas encore de vue — partage ton lien !"}
          </p>
        </>
      ) : null}
    </section>
  );
}

function StatBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-3 ${
        highlight
          ? "border-indigo-200 bg-indigo-50/60"
          : "border-slate-200 bg-slate-50/60"
      }`}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-semibold tracking-tight ${
          highlight ? "text-indigo-700" : "text-slate-900"
        }`}
      >
        {value.toLocaleString("fr-FR")}
      </p>
    </div>
  );
}

function SkeletonStat() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-slate-100 p-3">
      <div className="h-3 w-20 rounded bg-slate-200" />
      <div className="mt-2 h-7 w-12 rounded bg-slate-200" />
    </div>
  );
}

function Sparkline({
  series,
  max,
}: {
  series: Array<{ day: string; count: number }>;
  max: number;
}) {
  // 30 bars, fixed height for consistency. Hover shows the day + count.
  return (
    <div className="flex h-28 items-end gap-[3px] rounded-xl border border-slate-200 bg-slate-50/50 p-2">
      {series.map((d) => {
        const h = d.count === 0 ? 2 : Math.max(8, Math.round((d.count / max) * 92));
        const day = d.day.slice(5); // MM-DD
        return (
          <div
            key={d.day}
            title={`${d.day} — ${d.count} vue${d.count > 1 ? "s" : ""}`}
            className="group relative flex-1"
            style={{ height: "100%" }}
          >
            <div
              className={`absolute inset-x-0 bottom-0 rounded-t ${
                d.count > 0
                  ? "bg-gradient-to-t from-indigo-500 to-indigo-400"
                  : "bg-slate-200"
              } transition group-hover:from-indigo-600 group-hover:to-indigo-500`}
              style={{ height: `${h}%` }}
            />
            <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-medium text-white group-hover:block">
              {day} · {d.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d} j`;
  return new Date(iso).toLocaleDateString("fr-FR");
}
