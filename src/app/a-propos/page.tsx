import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos · MyCard",
  description: "L'histoire de MyCard et sa mission : rendre la carte de visite numérique accessible à tous.",
};

export default function AProposPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-sm font-medium text-indigo-600">Qui sommes-nous</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          À propos de MyCard
        </h1>
      </header>

      <p className="text-sm leading-relaxed text-slate-600">
        MyCard est né d'un constat simple : les cartes de visite papier se
        perdent, se froissent et se jettent, et les solutions numériques
        existantes coûtent cher ou demandent un compte, un abonnement, une
        application à installer.
      </p>
      <p className="text-sm leading-relaxed text-slate-600">
        Notre mission : permettre à <strong>chaque indépendant, freelance, artisan ou
        commerçant</strong> de créer en 2 minutes une carte de visite numérique
        professionnelle — avec QR code, lien partageable, galerie de produits et
        export vCard — <strong>sans compte et sans paiement</strong>.
      </p>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Ce que tu obtiens</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>✅ Une carte élégante parmi 10 modèles, personnalisable (couleurs, police, photo, logo)</li>
          <li>✅ Un lien public à partager partout : signature mail, bio Instagram, WhatsApp…</li>
          <li>✅ Un QR code imprimable et un QR code intégré à la carte</li>
          <li>✅ Un export vCard : tes contacts t'enregistrent en un clic</li>
          <li>✅ Une galerie produits pour montrer ce que tu vends</li>
          <li>✅ Des statistiques de scans pour suivre l'intérêt</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Nos principes</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>🔒 <strong>Confidentialité</strong> : pas de trackers publicitaires, pas de revente de données. Voir notre <Link href="/confidentialite" className="font-medium text-indigo-600 underline">politique de confidentialité</Link>.</li>
          <li>💳 <strong>Gratuité</strong> : les fonctionnalités essentielles restent gratuites.</li>
          <li>⚡ <strong>Simplicité</strong> : pas de compte à créer, pas d'application à installer.</li>
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/creer"
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Créer ma carte
        </Link>
        <Link
          href="/"
          className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          Retour à l'accueil
        </Link>
      </div>
    </article>
  );
}
