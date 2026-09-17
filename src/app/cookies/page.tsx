import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookies · MyCard",
  description: "Les cookies utilisés par MyCard : un seul, strictement nécessaire.",
};

export default function CookiesPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-sm font-medium text-indigo-600">Transparence</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Politique cookies
        </h1>
        <p className="mt-2 text-xs text-slate-500">Dernière mise à jour : septembre 2026</p>
      </header>

      <section className="space-y-3 text-sm leading-relaxed text-slate-600">
        <h2 className="text-base font-semibold text-slate-900">Le seul cookie du site</h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5">Nom</th>
                <th className="px-4 py-2.5">Rôle</th>
                <th className="px-4 py-2.5">Durée</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-t border-slate-100">
                <td className="px-4 py-2.5 font-mono text-xs">cp_my_cards</td>
                <td className="px-4 py-2.5">
                  Strictement nécessaire : mémorise la liste de tes cartes (slug + jeton
                  d'édition) pour la page « Mes cartes ». Il ne quitte jamais ton navigateur
                  et ne sert à aucun suivi.
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap">12 mois</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-slate-900">Ce que tu ne trouveras pas</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>❌ Aucun cookie publicitaire (pas de Google Ads, Meta Pixel…)</li>
          <li>❌ Aucun cookie de mesure d'audience tierce (pas de Google Analytics…)</li>
          <li>❌ Aucun cookie de réseaux sociaux</li>
        </ul>

        <h2 className="text-base font-semibold text-slate-900">Comment le gérer</h2>
        <p>
          Ce cookie est <strong>strictement nécessaire</strong> au fonctionnement de la page
          « Mes cartes » : sans lui, cette fonctionnalité ne marche pas. Tu peux quand même
          le supprimer à tout moment via les réglages de ton navigateur (Section « Cookies »
          → supprimer pour ce site). Tes cartes restent en ligne : seul le raccourci local
          disparaît.
        </p>

        <p>
          Voir aussi :{" "}
          <Link href="/confidentialite" className="font-medium text-indigo-600 underline">
            politique de confidentialité
          </Link>
          .
        </p>
      </section>
    </article>
  );
}
