"use client";

import { useMemo, useState } from "react";
import { TemplateGallery, FlipCard, TEMPLATE_LABELS } from "@/components/CardTemplates";
import { ImageUploader } from "@/components/ImageUploader";
import { THEME_OPTIONS, TEMPLATE_OPTIONS } from "@/db/schema";
import type { CardRow } from "@/db/schema";
import { themeTokens } from "@/lib/utils";

export interface ProductItem {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
}

export interface CardFormValues {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  whatsapp: string;
  address: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  theme: string;
  template: string;
  photoUrl: string;
  logoUrl: string;
  products: ProductItem[];
  bio: string;
  customColor: string;
  fontFamily: string;
  photoShape: string;
  nameSize: string;
}

export function parseProducts(raw: unknown): ProductItem[] {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p: any) => ({
      name: typeof p?.name === "string" ? p.name : "",
      description: typeof p?.description === "string" ? p.description : "",
      price: typeof p?.price === "string" ? p.price : "",
      imageUrl: typeof p?.imageUrl === "string" ? p.imageUrl : "",
    }));
  } catch {
    return [];
  }
}

export function cardFromRow(row: CardRow): CardFormValues {
  return {
    name: row.name ?? "",
    title: row.title ?? "",
    company: row.company ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    website: row.website ?? "",
    whatsapp: row.whatsapp ?? "",
    address: row.address ?? "",
    linkedin: row.linkedin ?? "",
    facebook: row.facebook ?? "",
    instagram: row.instagram ?? "",
    theme: row.theme ?? "indigo",
    // Old cards may store a removed template id — fall back to "halo".
    template: (TEMPLATE_OPTIONS as readonly string[]).includes(row.template ?? "")
      ? row.template!
      : "halo",
    photoUrl: row.photoUrl ?? "",
    logoUrl: row.logoUrl ?? "",
    products: parseProducts(row.products),
    bio: row.bio ?? "",
    customColor: row.customColor ?? "",
    fontFamily: row.fontFamily ?? "",
    photoShape: row.photoShape ?? "",
    nameSize: row.nameSize ?? "",
  };
}

export function valuesToPayload(v: CardFormValues) {
  const trim = (s: string) => s.trim();
  const products = v.products
    .map((p) => ({
      name: trim(p.name),
      description: trim(p.description) || null,
      price: trim(p.price) || null,
      imageUrl: trim(p.imageUrl) || null,
    }))
    .filter((p) => p.name.length > 0);
  return {
    name: trim(v.name),
    title: trim(v.title),
    company: trim(v.company) || null,
    phone: trim(v.phone) || null,
    email: trim(v.email) || null,
    website: trim(v.website) || null,
    whatsapp: trim(v.whatsapp) || null,
    address: trim(v.address) || null,
    linkedin: trim(v.linkedin) || null,
    facebook: trim(v.facebook) || null,
    instagram: trim(v.instagram) || null,
    theme: v.theme,
    template: v.template,
    photoUrl: trim(v.photoUrl) || null,
    logoUrl: trim(v.logoUrl) || null,
    products: products.length > 0 ? products : null,
    bio: trim(v.bio) || null,
    customColor: /^#[0-9a-fA-F]{6}$/.test(trim(v.customColor)) ? trim(v.customColor) : "",
    fontFamily: v.fontFamily || "",
    photoShape: v.photoShape || "",
    nameSize: v.nameSize || "",
  };
}

interface CardFormProps {
  initialValues: CardFormValues;
  mode: "create" | "edit";
  editToken?: string;
  // When editing, the slug of the card being edited. Lets us add a "Preview"
  // shortcut that opens the public URL in a new tab.
  liveSlug?: string;
  onSubmit: (payload: ReturnType<typeof valuesToPayload>) => Promise<void>;
  submitLabel?: string;
}

const THEME_LABEL: Record<string, string> = {
  indigo: "Indigo",
  emerald: "Émeraude",
  rose: "Rose",
  amber: "Ambre",
  sky: "Ciel",
  violet: "Violet",
};

export function CardForm({ initialValues, mode, editToken, liveSlug, onSubmit, submitLabel }: CardFormProps) {
  const [values, setValues] = useState<CardFormValues>(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const set = <K extends keyof CardFormValues>(key: K, value: CardFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const previewCard = useMemo(
    () => ({
      ...values,
      // Empty strings render as "placeholder" content in templates.
    }),
    [values],
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!values.name.trim() || !values.title.trim()) {
      setError("Renseigne au minimum ton nom et ton poste.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = valuesToPayload(values);
      if (mode === "edit" && editToken) {
        await onSubmit({ ...payload, ...({ token: editToken } as any) });
      } else {
        await onSubmit(payload);
      }
    } catch (err: any) {
      setError(err?.message ?? "Une erreur est survenue. Réessaie dans un instant.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Identité" description="Les infos qui apparaîtront en haut de la carte.">
          <Field label="Nom complet" required>
            <input
              type="text"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Amine Koffi"
              className={inputClass}
              required
              maxLength={120}
            />
          </Field>
          <Field label="Poste / métier" required>
            <input
              type="text"
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Designer freelance"
              className={inputClass}
              required
              maxLength={160}
            />
          </Field>
          <Field label="Entreprise" optional>
            <input
              type="text"
              value={values.company}
              onChange={(e) => set("company", e.target.value)}
              placeholder="Koffi Studio"
              className={inputClass}
              maxLength={160}
            />
          </Field>
          <Field label="À propos / Bio" optional hint="Affichée au verso de la carte, 2 lignes max." full>
            <textarea
              value={values.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="Designer freelance spécialisé en identité visuelle. 8 ans d'expérience avec des marques en Afrique de l'Ouest."
              className={`${inputClass} min-h-[72px] resize-y`}
              maxLength={600}
            />
          </Field>
        </Section>

        <Section title="Contact" description="Tout est optionnel. Renseigne uniquement ce que tu veux partager.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Téléphone" optional>
              <input
                type="tel"
                value={values.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+33 6 12 34 56 78"
                className={inputClass}
                maxLength={40}
              />
            </Field>
            <Field label="WhatsApp" optional hint="Numéro international, sans le +">
              <input
                type="tel"
                value={values.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
                placeholder="33612345678"
                className={inputClass}
                maxLength={40}
              />
            </Field>
            <Field label="E-mail" optional>
              <input
                type="email"
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="amine@koffi.studio"
                className={inputClass}
                maxLength={160}
              />
            </Field>
            <Field label="Site web" optional hint="Avec https://">
              <input
                type="url"
                value={values.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://koffi.studio"
                className={inputClass}
                maxLength={300}
              />
            </Field>
            <Field label="Adresse" optional full>
              <input
                type="text"
                value={values.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="12 rue de la Paix, 75002 Paris"
                className={inputClass}
                maxLength={300}
              />
            </Field>
          </div>
        </Section>

        <Section title="Réseaux sociaux" description="Optionnel. Une URL complète par réseau.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="LinkedIn">
              <input
                type="url"
                value={values.linkedin}
                onChange={(e) => set("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/amine"
                className={inputClass}
              />
            </Field>
            <Field label="Facebook">
              <input
                type="url"
                value={values.facebook}
                onChange={(e) => set("facebook", e.target.value)}
                placeholder="https://facebook.com/amine"
                className={inputClass}
              />
            </Field>
            <Field label="Instagram">
              <input
                type="url"
                value={values.instagram}
                onChange={(e) => set("instagram", e.target.value)}
                placeholder="https://instagram.com/amine"
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        <Section
          title="Photo"
          description="Depuis ta galerie, par glisser-déposer, ou en collant une URL."
        >
          <ImageUploader
            value={values.photoUrl}
            onChange={(v) => set("photoUrl", v)}
            shape="rounded"
          />
        </Section>

        <Section
          title="Logo d'entreprise"
          description="Affiché sur la carte à la place des initiales. PNG ou JPG avec fond transparent idéalement."
        >
          <ImageUploader
            value={values.logoUrl}
            onChange={(v) => set("logoUrl", v)}
            shape="square"
            label="Logo"
            hint="Un logo carré rend mieux sur la carte. Laisse vide pour garder les initiales."
          />
        </Section>

        <Section
          title="Produits / services"
          description="Montre ce que tu vends directement sur ta carte. Jusqu'à 12 produits avec photo, description et prix."
        >
          {values.products.map((p, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Produit {i + 1}</p>
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "products",
                      values.products.filter((_, j) => j !== i)
                    )
                  }
                  className="rounded-full px-2.5 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  Supprimer
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Nom" required>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => {
                      const next = [...values.products];
                      next[i] = { ...p, name: e.target.value };
                      set("products", next);
                    }}
                    placeholder="T-shirt premium"
                    className={inputClass}
                    maxLength={120}
                  />
                </Field>
                <Field label="Prix" optional>
                  <input
                    type="text"
                    value={p.price}
                    onChange={(e) => {
                      const next = [...values.products];
                      next[i] = { ...p, price: e.target.value };
                      set("products", next);
                    }}
                    placeholder="15 000 FCFA"
                    className={inputClass}
                    maxLength={40}
                  />
                </Field>
                <Field label="Description" optional full>
                  <input
                    type="text"
                    value={p.description}
                    onChange={(e) => {
                      const next = [...values.products];
                      next[i] = { ...p, description: e.target.value };
                      set("products", next);
                    }}
                    placeholder="Coton bio, toutes tailles"
                    className={inputClass}
                    maxLength={400}
                  />
                </Field>
              </div>
              <div className="mt-3">
                <ImageUploader
                  value={p.imageUrl}
                  onChange={(v) => {
                    const next = [...values.products];
                    next[i] = { ...p, imageUrl: v };
                    set("products", next);
                  }}
                  shape="rounded"
                  label="Photo du produit"
                />
              </div>
            </div>
          ))}

          {values.products.length < 12 ? (
            <button
              type="button"
              onClick={() =>
                set("products", [
                  ...values.products,
                  { name: "", description: "", price: "", imageUrl: "" },
                ])
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Ajouter un produit
            </button>
          ) : null}
        </Section>

        <Section title="Style" description="Le thème de couleur et le modèle visuel. Tu peux changer d'avis à tout moment.">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Thème</p>
            <div className="flex flex-wrap gap-2">
              {THEME_OPTIONS.map((theme) => {
                const active = values.theme === theme && !values.customColor;
                const tokens = themeTokens(theme);
                return (
                  <button
                    type="button"
                    key={theme}
                    onClick={() => {
                      set("theme", theme);
                      set("customColor", "");
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`h-3 w-3 rounded-full ${tokens.bg}`} />
                    {THEME_LABEL[theme] ?? theme}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Couleur personnalisée</p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(values.customColor) ? values.customColor : "#4f46e5"}
                onChange={(e) => set("customColor", e.target.value)}
                className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                aria-label="Choisir une couleur personnalisée"
              />
              <input
                type="text"
                value={values.customColor}
                onChange={(e) => set("customColor", e.target.value)}
                placeholder="#ff6b35"
                className={`${inputClass} w-32 font-mono`}
                maxLength={7}
              />
              {values.customColor ? (
                <button
                  type="button"
                  onClick={() => set("customColor", "")}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Réinitialiser
                </button>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Ta couleur remplace celle du thème partout sur la carte.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Taille du nom">
              <select
                value={values.nameSize || "md"}
                onChange={(e) => set("nameSize", e.target.value === "md" ? "" : e.target.value)}
                className={inputClass}
              >
                <option value="sm">Petit</option>
                <option value="md">Normal</option>
                <option value="lg">Grand</option>
              </select>
            </Field>
            <Field label="Police">
              <select
                value={values.fontFamily || "sans"}
                onChange={(e) => set("fontFamily", e.target.value === "sans" ? "" : e.target.value)}
                className={inputClass}
              >
                <option value="sans">Moderne (sans)</option>
                <option value="serif">Élégant (serif)</option>
                <option value="mono">Code (mono)</option>
              </select>
            </Field>
            <Field label="Forme de la photo">
              <select
                value={values.photoShape || "circle"}
                onChange={(e) => set("photoShape", e.target.value === "circle" ? "" : e.target.value)}
                className={inputClass}
              >
                <option value="circle">Ronde</option>
                <option value="rounded">Arrondie</option>
                <option value="square">Carrée</option>
              </select>
            </Field>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-medium text-slate-700">Modèle</p>
            <TemplateGallery
              card={previewCard as any}
              active={values.template}
              onSelect={(k) => set("template", k)}
            />
          </div>
        </Section>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-3">
          {mode === "edit" && liveSlug ? (
            <a
              href={`/c/${liveSlug}?preview=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              title="Ouvre la carte publique dans un nouvel onglet"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Aperçu
            </a>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            {submitting ? (
              <>
                <Spinner /> Enregistrement…
              </>
            ) : (
              <>{submitLabel ?? (mode === "edit" ? "Enregistrer les modifications" : "Créer ma carte")}</>
            )}
          </button>
        </div>
      </form>

      {/* Mobile: floating preview button + bottom-sheet. Desktop: sticky aside. */}
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-xl ring-1 ring-black/10 transition hover:bg-slate-800 active:scale-95 lg:hidden"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M3 12h18" />
        </svg>
        Aperçu
      </button>

      {previewOpen ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setPreviewOpen(false)}
          role="dialog"
          aria-label="Aperçu de la carte"
        >
          <div
            className="mt-auto w-full rounded-t-3xl bg-white p-5 pb-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200" />
            <div className="mx-auto w-full max-w-md">
              <FlipCard templateKey={values.template} card={previewCard as any} />
            </div>
            <p className="mt-2 text-center text-xs text-slate-500">
              Modèle : <strong>{TEMPLATE_LABELS[values.template]?.label}</strong>
            </p>
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="mt-4 w-full rounded-full bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Fermer
            </button>
          </div>
        </div>
      ) : null}

      <aside className="hidden lg:sticky lg:top-20 lg:block">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Aperçu
          </p>
          <div className="mx-auto max-w-[460px]">
            <FlipCard templateKey={values.template} card={previewCard as any} />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Modèle sélectionné : <strong>{TEMPLATE_LABELS[values.template]?.label}</strong>
          </p>
        </div>
      </aside>
    </div>
  );
}

const inputClass =
  "block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <header className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  required,
  optional,
  hint,
  full,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 flex items-baseline gap-2 text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-rose-500">*</span> : null}
        {optional ? <span className="text-xs font-normal text-slate-400">(optionnel)</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" fill="none" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
