import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";
import { I18nProvider, LocaleSwitcher } from "@/lib/i18n";
import { CookieBanner } from "@/components/CookieBanner";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = {
  title: "MyCard — ta carte de visite numérique en 2 minutes",
  description:
    "Crée une carte de visite professionnelle gratuite avec QR code, lien partageable et export vCard. Sans compte, sans paiement.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased">
        <I18nProvider>
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur">
          <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-4 py-3 sm:px-6">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-base font-semibold tracking-tight text-slate-900"
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm transition group-hover:-rotate-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <rect x="3" y="6" width="18" height="13" rx="2" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M3 12h18" />
                </svg>
              </span>
              <Brand />
            </Link>
            <nav className="flex items-center gap-1 text-sm font-medium text-slate-600">
            <Link
              href="/creer"
              className="hidden rounded-full px-3 py-2 transition hover:bg-slate-100 sm:inline-flex"
            >
              Créer ma carte
            </Link>
            <Link
              href="/mes-cartes"
              className="hidden rounded-full px-3 py-2 transition hover:bg-slate-100 sm:inline-flex"
            >
              Mes cartes
            </Link>
            <Link
              href="/qr"
              className="hidden rounded-full px-3 py-2 transition hover:bg-slate-100 sm:inline-flex"
            >
              Générateur QR
            </Link>
              <Link
                href="/creer"
                className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-2 text-white shadow-sm transition hover:bg-slate-800"
              >
                Démarrer
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 sm:py-10">
          {children}
        </main>
        <footer className="border-t border-slate-200/80 bg-white">
          <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center gap-3 px-4 py-6 sm:flex-row sm:justify-between sm:px-6">
            <p className="text-xs font-medium text-slate-500">
              <Brand />
            </p>
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <Link href="/a-propos" className="transition hover:text-slate-900">
                À propos
              </Link>
              <Link href="/conditions" className="transition hover:text-slate-900">
                Conditions d'utilisation
              </Link>
              <Link href="/confidentialite" className="transition hover:text-slate-900">
                Confidentialité
              </Link>
              <Link href="/cookies" className="transition hover:text-slate-900">
                Cookies
              </Link>
            </nav>
          </div>
        </footer>
        <CookieBanner />
        </I18nProvider>
      </body>
    </html>
  );
}
