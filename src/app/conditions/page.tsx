import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'utilisation · Carte Pro",
  description: "Les conditions d'utilisation du service Carte Pro.",
};

export default function ConditionsPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-sm font-medium text-indigo-600">Le cadre</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Conditions d'utilisation
        </h1>
        <p className="mt-2 text-xs text-slate-500">Dernière mise à jour : septembre 2026</p>
      </header>

      <section className="space-y-3 text-sm leading-relaxed text-slate-600">
        <h2 className="text-base font-semibold text-slate-900">1. Le service</h2>
        <p>
          Carte Pro permet de créer, personnaliser et partager une carte de visite
          numérique, gratuitement et sans création de compte. Le service est fourni
          « en l'état » et peut évoluer (nouvelles fonctionnalités, corrections,
          modifications des modèles).
        </p>

        <h2 className="text-base font-semibold text-slate-900">2. Tes responsabilités</h2>
        <p>
          En créant une carte, tu t'engages à :
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>n'utiliser que des contenus (textes, photos, logos) dont tu possèdes les droits ;</li>
          <li>ne pas publier de contenu illégal, diffamatoire, trompeur ou portant atteinte aux droits d'autrui ;</li>
          <li>ne pas utiliser le service pour du spam, de l'usurpation d'identité ou des escroqueries ;</li>
          <li>ne pas tenter de saturer, contourner ou attaquer le service (rate-limiting en place).</li>
        </ul>

        <h2 className="text-base font-semibold text-slate-900">3. Ton lien d'édition</h2>
        <p>
          À la création, tu reçois un <strong>lien d'édition privé</strong> unique. C'est le
          seul moyen de modifier ou supprimer ta carte : <strong>conserve-le précieusement</strong>.
          Nous ne pouvons pas le récupérer pour toi. Toute personne possédant ce lien peut
          modifier la carte : ne le partage pas.
        </p>

        <h2 className="text-base font-semibold text-slate-900">4. Suppression</h2>
        <p>
          Tu peux supprimer ta carte à tout moment depuis le lien d'édition. Les données
          associées (image des aperçus sociaux, statistiques) sont ensuite effacées.
        </p>

        <h2 className="text-base font-semibold text-slate-900">5. Limitation de responsabilité</h2>
        <p>
          Carte Pro ne garantit pas une disponibilité ininterrompue du service et ne peut
          être tenu responsable des pertes de données, des contenus publiés par les
          utilisateurs ni de l'usage qui en est fait par des tiers.
        </p>

        <h2 className="text-base font-semibold text-slate-900">6. Évolution des conditions</h2>
        <p>
          Ces conditions peuvent être mises à jour. La version en ligne fait foi ; en
          continuant d'utiliser le service, tu acceptes la version en vigueur.
        </p>
      </section>

      <p className="text-sm text-slate-600">
        Une question ? Consulte aussi notre{" "}
        <Link href="/confidentialite" className="font-medium text-indigo-600 underline">
          politique de confidentialité
        </Link>{" "}
        et notre{" "}
        <Link href="/cookies" className="font-medium text-indigo-600 underline">
          politique cookies
        </Link>
        .
      </p>
    </article>
  );
}
