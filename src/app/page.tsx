"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function HomePage() {
  return (
    <div className="space-y-10 sm:space-y-14">
      <HomeHero />
    </div>
  );
}

function HomeHero() {
  const { t } = useI18n();
  return (
    <div className="space-y-10 sm:space-y-14">
      <section className="grid items-center gap-8 sm:grid-cols-2 sm:gap-10">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            {t("home.eyebrow")}
          </span>
          <h1 className="mt-4 text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[1.05] tracking-tight text-slate-900">
            {t("home.title1")}
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              {t("home.title2")}
            </span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
            {t("home.subtitle")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/creer"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              {t("home.cta.create")}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/qr"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              {t("home.cta.qr")}
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-indigo-200 via-violet-100 to-transparent blur-2xl" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="aspect-[5/6] overflow-hidden rounded-2xl bg-white p-3 shadow-xl ring-1 ring-black/5">
              <div className="h-full origin-top-left scale-[0.78]">
                <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
                  <div className="bg-indigo-600 px-5 pb-5 pt-6 text-white">
                    <div className="flex items-center gap-3">
                      <span className="grid h-14 w-14 place-items-center rounded-full bg-white/95 text-base font-semibold text-indigo-700 ring-2 ring-white">AK</span>
                      <div>
                        <p className="text-base font-semibold leading-tight">Amine Koffi</p>
                        <p className="text-sm opacity-90">Designer freelance</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 px-5 py-5 text-sm text-slate-700">
                    <p>📞 +33 6 12 34 56 78</p>
                    <p>✉️ amine@koffi.studio</p>
                    <p>🌐 koffi.studio</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 aspect-[5/6] overflow-hidden rounded-2xl bg-slate-950 p-3 text-slate-100 shadow-xl ring-1 ring-white/10">
              <div className="h-full origin-top-left scale-[0.78]">
                <div className="overflow-hidden rounded-2xl bg-slate-950 shadow-xl ring-1 ring-white/10">
                  <div className="relative px-6 pb-6 pt-7">
                    <div className="absolute inset-x-0 top-0 h-1 bg-amber-400" />
                    <div className="flex items-center gap-4">
                      <span className="grid h-14 w-14 place-items-center rounded-full bg-white/10 text-base font-semibold text-amber-300 ring-2 ring-amber-300/40">MD</span>
                      <div>
                        <p className="text-lg font-semibold text-white">Marc Dubois</p>
                        <p className="text-sm text-amber-300">Directeur commercial</p>
                        <p className="text-xs uppercase tracking-[0.12em] text-slate-300">Atelier Nord</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-3xl bg-white p-6 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.2)] ring-1 ring-slate-100 sm:grid-cols-3 sm:gap-6 sm:p-8">
        <Feature
          title="Lien public à vie"
          description="Un lien du type carte-pro.app/c/ton-nom, partageable partout — WhatsApp, signature mail, Instagram."
          icon="link"
        />
        <Feature
          title="QR code auto"
          description="Affiché sur ta carte, imprimable, parfait pour les rencontres en face à face."
          icon="qr"
        />
        <Feature
          title="Fichier .vcf"
          description="Bouton « Enregistrer le contact » : un tap et la personne t'a dans son téléphone."
          icon="download"
        />
      </section>

      <section className="grid items-start gap-6 rounded-3xl bg-white p-6 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.2)] ring-1 ring-slate-100 sm:grid-cols-2 sm:gap-10 sm:p-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Tu peux aussi générer des QR codes en solo
          </h2>
          <p className="mt-3 text-slate-600">
            Un texte, un lien, un numéro, un Wi-Fi, un contact vCard… Colle, personnalise,
            télécharge en PNG ou SVG. Tout se fait dans ton navigateur, rien n'est enregistré.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li className="flex items-center gap-2"><Dot /> Couleurs et style des points</li>
            <li className="flex items-center gap-2"><Dot /> Correction d'erreur haute pour logo central</li>
            <li className="flex items-center gap-2"><Dot /> Téléchargement PNG + SVG</li>
          </ul>
          <Link
            href="/qr"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Ouvrir le générateur QR
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Tile label="Texte" hint="Une note, un message…" />
          <Tile label="URL" hint="Un site à partager" />
          <Tile label="Téléphone" hint="tel:" />
          <Tile label="E-mail" hint="mailto: avec sujet" />
          <Tile label="WhatsApp" hint="wa.me + message" />
          <Tile label="Wi-Fi" hint="Connexion auto" />
        </div>
      </section>
    </div>
  );
}

function Dot() {
  return <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />;
}

function Feature({ title, description, icon }: { title: string; description: string; icon: "link" | "qr" | "download" }) {
  return (
    <div>
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
        {icon === "link" && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        )}
        {icon === "qr" && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h3v3h-3z" />
            <path d="M20 14v3" />
            <path d="M14 20h3" />
            <path d="M20 20h1" />
          </svg>
        )}
        {icon === "download" && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        )}
      </div>
      <p className="mt-3 text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
  );
}

function Tile({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="font-semibold text-slate-900">{label}</p>
      <p className="text-xs text-slate-500">{hint}</p>
    </div>
  );
}
