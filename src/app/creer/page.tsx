"use client";

import { useRouter } from "next/navigation";
import { CardForm, valuesToPayload } from "@/components/CardForm";

const INITIAL_VALUES = {
  name: "",
  title: "",
  company: "",
  phone: "",
  email: "",
  website: "",
  whatsapp: "",
  address: "",
  linkedin: "",
  facebook: "",
  instagram: "",
  theme: "indigo",
  template: "halo",
  photoUrl: "",
  logoUrl: "",
  products: [],
  bio: "",
  customColor: "",
  fontFamily: "",
  photoShape: "",
  nameSize: "",
};

export default function CreerPage() {
  const router = useRouter();

  async function handleSubmit(payload: ReturnType<typeof valuesToPayload>) {
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.error ?? "Impossible de créer la carte.");
    }
    const slug = json?.card?.slug;
    if (!slug) {
      throw new Error("Réponse inattendue du serveur.");
    }
    router.push(`/creer/${slug}?token=${encodeURIComponent(json.card.editToken)}&just=1`);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-indigo-600">Étape 1 / 2</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Crée ta carte
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Renseigne tes infos, choisis un style, et obtiens en un clic un lien public,
          un QR code et un fichier contact. Aucun compte requis.
        </p>
      </header>
      <CardForm
        initialValues={INITIAL_VALUES}
        mode="create"
        onSubmit={handleSubmit as any}
        submitLabel="Créer ma carte"
      />
    </div>
  );
}
