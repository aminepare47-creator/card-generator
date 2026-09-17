import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confidentialité · MyCard",
  description: "Comment MyCard collecte, utilise et protège tes données.",
};

export default function ConfidentialitePage() {
  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-sm font-medium text-indigo-600">Tes données</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Politique de confidentialité
        </h1>
        <p className="mt-2 text-xs text-slate-500">Dernière mise à jour : septembre 2026</p>
      </header>

      <section className="space-y-3 text-sm leading-relaxed text-slate-600">
        <h2 className="text-base font-semibold text-slate-900">1. Ce que nous collectons</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong>Contenu de ta carte</strong> : nom, poste, entreprise, coordonnées (téléphone, e-mail, site, adresse, réseaux sociaux), bio, photo, logo, produits.</li>
          <li><strong>Compteurs de scans</strong> : nombre de visites par jour sur ta carte (anonyme, aucune donnée personnelle sur les visiteurs).</li>
          <li><strong>Préférences locales</strong> : la liste de tes cartes est mémorisée dans un cookie de ton navigateur uniquement, pour la page « Mes cartes ».</li>
        </ul>

        <h2 className="text-base font-semibold text-slate-900">2. Ce que nous ne collectons PAS</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Aucune adresse e-mail de contact, aucun compte, aucun mot de passe.</li>
          <li>Aucun traceur publicitaire ni revente de données à des tiers.</li>
          <li>Aucune donnée de navigation des visiteurs de ta carte (pas de profilage).</li>
        </ul>

        <h2 className="text-base font-semibold text-slate-900">3. Conservation</h2>
        <p>
          Ta carte reste en ligne tant que tu ne la supprimes pas. En supprimant ta carte,
          ses données et ses statistiques sont effacées.
        </p>

        <h2 className="text-base font-semibold text-slate-900">4. Tes droits</h2>
        <p>
          Tu contrôles tout : modifier ta carte via ton lien d'édition privé, la supprimer
          définitivement, ou ne remplir que les champs que tu souhaites partager.
        </p>

        <h2 className="text-base font-semibold text-slate-900">5. Sécurité</h2>
        <p>
          Le lien d'édition est un jeton aléatoire non devinable. Les uploads d'images sont
          vérifiés (type réel du fichier, taille, format) et servis de manière contrôlée.
        </p>

        <h2 className="text-base font-semibold text-slate-900">6. Cookies</h2>
        <p>
          MyCard n'utilise qu'un <strong>cookie strictement nécessaire</strong> (« Mes
          cartes ») et aucun cookie publicitaire ni de mesure d'audience tierce. Détails
          sur notre page{" "}
          <Link href="/cookies" className="font-medium text-indigo-600 underline">
            Cookies
          </Link>
          .
        </p>
      </section>
    </article>
  );
}
