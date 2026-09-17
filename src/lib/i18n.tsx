"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "fr" | "en";

const STORAGE_KEY = "cp_locale";

function detect(): Locale {
  if (typeof window === "undefined") return "fr";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "fr" || stored === "en") return stored;
  } catch {
    /* noop */
  }
  const nav = window.navigator?.language?.toLowerCase() ?? "";
  if (nav.startsWith("en")) return "en";
  return "fr";
}

type Dict = Record<string, { fr: string; en: string }>;

const STRINGS: Dict = {
  // Header
  "header.create": { fr: "Créer ma carte", en: "Create my card" },
  "header.cards": { fr: "Mes cartes", en: "My cards" },
  "header.qr": { fr: "Générateur QR", en: "QR generator" },
  "header.start": { fr: "Démarrer", en: "Get started" },

  // Home
  "home.eyebrow": {
    fr: "Sans compte · Sans pub · 100% gratuit",
    en: "No account · No ads · 100% free",
  },
  "home.title1": { fr: "Ta carte de visite", en: "Your business card," },
  "home.title2": {
    fr: "numérique, prête en 2 minutes.",
    en: "ready in 2 minutes.",
  },
  "home.subtitle": {
    fr: "Renseigne tes coordonnées, choisis un style, obtiens un lien partageable, un QR code et un fichier contact à enregistrer dans n'importe quel téléphone.",
    en: "Fill in your details, pick a style, get a shareable link, a QR code and a contact file you can save on any phone.",
  },
  "home.cta.create": { fr: "Créer ma carte", en: "Create my card" },
  "home.cta.qr": { fr: "Générer un QR code", en: "Generate a QR code" },
  "home.features.title": {
    fr: "Conçue pour le terrain",
    en: "Built for the real world",
  },
  "home.features.subtitle": {
    fr: "Trois fonctionnalités qui font la différence quand tu rencontres quelqu'un.",
    en: "Three features that matter when you meet someone in person.",
  },
  "home.feature1.title": { fr: "Lien public à vie", en: "Permanent public link" },
  "home.feature1.desc": {
    fr: "Un lien du type carte-pro.app/c/ton-nom, partageable partout — WhatsApp, signature mail, Instagram.",
    en: "A link like carte-pro.app/c/your-name, shareable anywhere — WhatsApp, email signature, Instagram.",
  },
  "home.feature2.title": { fr: "QR code auto", en: "Auto QR code" },
  "home.feature2.desc": {
    fr: "Affiché sur ta carte, imprimable, parfait pour les rencontres en face à face.",
    en: "Shown on your card, printable, perfect for in-person meetings.",
  },
  "home.feature3.title": { fr: "Fichier .vcf", en: ".vcf file" },
  "home.feature3.desc": {
    fr: "Bouton « Enregistrer le contact » : un tap et la personne t'a dans son téléphone.",
    en: "“Save contact” button: one tap and you're in their phone.",
  },
  "home.qr.title": {
    fr: "Tu peux aussi générer des QR codes en solo",
    en: "You can also generate QR codes on their own",
  },
  "home.qr.subtitle": {
    fr: "Un texte, un lien, un numéro, un Wi-Fi, un contact vCard… Colle, personnalise, télécharge en PNG ou SVG. Tout se fait dans ton navigateur, rien n'est enregistré.",
    en: "Text, link, phone number, Wi-Fi, vCard… Paste, customise, download as PNG or SVG. Everything stays in your browser — nothing is saved.",
  },
  "home.qr.cta": { fr: "Ouvrir le générateur QR", en: "Open the QR generator" },

  // QR page
  "qr.title": { fr: "Générateur de QR code", en: "QR code generator" },
  "qr.subtitle": {
    fr: "Choisis un type de contenu, colle ton info, personnalise, télécharge. Tout se fait dans ton navigateur — rien n'est enregistré côté serveur.",
    en: "Pick a content type, paste your info, customise, download. Everything stays in your browser — nothing is saved on the server.",
  },
  "qr.download.png": { fr: "Télécharger PNG", en: "Download PNG" },
  "qr.download.svg": { fr: "Télécharger SVG", en: "Download SVG" },
  "qr.empty": {
    fr: "Renseigne un champ pour générer le QR code.",
    en: "Fill in a field to generate the QR code.",
  },

  // Create / edit
  "create.step": { fr: "Étape 1 / 2", en: "Step 1 / 2" },
  "create.title": { fr: "Crée ta carte", en: "Create your card" },
  "create.subtitle": {
    fr: "Renseigne tes infos, choisis un style, et obtiens en un clic un lien public, un QR code et un fichier contact. Aucun compte requis.",
    en: "Fill in your details, pick a style, and get a public link, a QR code and a contact file in one click. No account required.",
  },
  "create.submit": { fr: "Créer ma carte", en: "Create my card" },
  "edit.title": { fr: "Modifie ta carte", en: "Edit your card" },
  "edit.subtitle": {
    fr: "Les changements sont enregistrés immédiatement. Le lien public reste le même.",
    en: "Changes are saved instantly. Your public link stays the same.",
  },
  "edit.submit": { fr: "Enregistrer les modifications", en: "Save changes" },

  // Public card
  "card.save": { fr: "Enregistrer le contact", en: "Save contact" },
  "card.share": { fr: "Partager", en: "Share" },
  "card.scan": { fr: "Scan pour ouvrir", en: "Scan to open" },

  // My cards
  "mycards.title": { fr: "Mes cartes", en: "My cards" },
  "mycards.subtitle": {
    fr: "Cette page liste les cartes que tu as créées ou modifiées depuis ce navigateur. Si tu changes d'ordinateur ou de navigateur, les liens ci-dessous ne fonctionneront plus — garde ton lien d'édition confidentiel.",
    en: "This page lists the cards you've created or edited from this browser. If you switch computers or browsers, the links below will stop working — keep your private edit link somewhere safe.",
  },
  "mycards.empty.title": {
    fr: "Aucune carte pour l'instant",
    en: "No cards yet",
  },
  "mycards.empty.desc": {
    fr: "Crée ta première carte : elle apparaîtra automatiquement ici.",
    en: "Create your first card: it will automatically appear here.",
  },
  "mycards.empty.cta": {
    fr: "Créer ma première carte",
    en: "Create my first card",
  },

  // Common
  "common.required": { fr: "obligatoire", en: "required" },
  "common.optional": { fr: "optionnel", en: "optional" },
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: keyof typeof STRINGS | string) => string;
}

const Ctx = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Start with "fr" so SSR matches initial HTML; then upgrade on the client.
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    setLocaleState(detect());
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: (l) => {
        setLocaleState(l);
        try {
          window.localStorage.setItem(STORAGE_KEY, l);
        } catch {
          /* noop */
        }
      },
      t: (key) => {
        const entry = STRINGS[key];
        if (!entry) return key;
        return entry[locale] ?? entry.fr;
      },
    }),
    [locale],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Safe fallback for server components that may render outside provider.
    return {
      locale: "fr",
      setLocale: () => {},
      t: (key) => {
        const entry = STRINGS[key as string];
        return entry?.fr ?? (key as string);
      },
    };
  }
  return ctx;
}

export function LocaleSwitcher() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 p-0.5 text-xs font-semibold">
      <button
        type="button"
        onClick={() => setLocale("fr")}
        className={`rounded-full px-2 py-1 transition ${
          locale === "fr" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
        }`}
        aria-pressed={locale === "fr"}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`rounded-full px-2 py-1 transition ${
          locale === "en" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
        }`}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
