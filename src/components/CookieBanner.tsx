"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "cp_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(CONSENT_KEY)) setVisible(true);
    } catch {
      // Storage unavailable: don't nag.
    }
  }, []);

  function choose(value: "all" | "essential") {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // Ignore.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:inset-x-6">
      <p className="text-sm font-semibold text-slate-900">🍪 Les cookies</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">
        MyCard n'utilise <strong>aucun cookie publicitaire ni de suivi</strong> — juste
        un cookie strictement nécessaire pour mémoriser tes cartes. Détails :{" "}
        <Link href="/cookies" className="font-medium text-indigo-600 underline">
          politique cookies
        </Link>
        .
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => choose("all")}
          className="flex-1 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
        >
          OK, compris
        </button>
        <Link
          href="/cookies"
          className="flex-1 rounded-full bg-white px-4 py-2 text-center text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          En savoir plus
        </Link>
      </div>
    </div>
  );
}
