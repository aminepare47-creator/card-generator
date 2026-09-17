"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { QrCanvas, type QrStyleOptions } from "@/components/QrCanvas";

export default function ResultPage() {
  const params = useParams();
  const search = useSearchParams();
  const slug = (params?.slug as string) ?? "";
  const tokenFromUrl = search?.get("token") ?? "";

  const [token, setToken] = useState<string>(tokenFromUrl);
  const [copiedField, setCopiedField] = useState<null | "public" | "edit">(null);
  const [publicUrl, setPublicUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPublicUrl(`${window.location.origin}/c/${slug}`);
    }
  }, [slug]);

  const editUrl = token && typeof window !== "undefined"
    ? `${window.location.origin}/c/${slug}/modifier?token=${encodeURIComponent(token)}`
    : "";

  // QR points to the public card page.
  const qrOptions: QrStyleOptions = useMemo(
    () => ({
      data: publicUrl || `https://carte-pro.app/c/${slug}`,
      size: 260,
      fgColor: "#0f172a",
      bgColor: "#ffffff",
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      errorCorrectionLevel: "M",
    }),
    [publicUrl, slug],
  );

  async function copy(value: string, field: "public" | "edit") {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField((cur) => (cur === field ? null : cur)), 2000);
    } catch {
      // Fallback: select+copy via execCommand
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopiedField(field);
        setTimeout(() => setCopiedField((cur) => (cur === field ? null : cur)), 2000);
      } finally {
        document.body.removeChild(ta);
      }
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-emerald-600">Carte créée 🎉</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Voici ta carte, partagée au monde entier.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Copie ton lien, montre ton QR code à l'écran ou imprime-le. Tu peux aussi
          prévisualiser ta carte.
        </p>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <LinkBox
            label="Lien public"
            description="À coller dans ta signature mail, ta bio Instagram, ton WhatsApp…"
            value={publicUrl || `…/c/${slug}`}
            onCopy={() => copy(publicUrl || "", "public")}
            copied={copiedField === "public"}
          />
          <LinkBox
            label="Lien d'édition (privé)"
            description="Garde-le précieusement : c'est le SEUL moyen de modifier ta carte plus tard."
            value={editUrl || "(token indisponible)"}
            onCopy={() => copy(editUrl, "edit")}
            copied={copiedField === "edit"}
            warning
          />
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            QR code
          </p>
          <div className="mt-3 grid place-items-center">
            <QrCanvas options={qrOptions} />
          </div>
          <p className="mt-3 text-center text-xs text-slate-500">
            Pointe vers <strong>{publicUrl || `…/c/${slug}`}</strong>
          </p>
        </aside>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-600">
          Tu peux visualiser ta carte tout de suite :
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/c/${slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Voir ma carte
          </Link>
          <Link
            href={`/c/${slug}/modifier?token=${encodeURIComponent(token)}`}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            Modifier ma carte
          </Link>
        </div>
      </div>
    </div>
  );
}

function LinkBox({
  label,
  description,
  value,
  onCopy,
  copied,
  warning,
}: {
  label: string;
  description: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        warning
          ? "border-amber-200 bg-amber-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-[0.12em] ${
              warning ? "text-amber-700" : "text-slate-500"
            }`}
          >
            {label}
          </p>
          <p className={`mt-1 text-xs ${warning ? "text-amber-800" : "text-slate-600"}`}>
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copié
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copier
            </>
          )}
        </button>
      </div>
      <div className="mt-3 break-all rounded-xl bg-white px-3 py-2 font-mono text-sm text-slate-800 ring-1 ring-slate-200">
        {value}
      </div>
    </div>
  );
}
