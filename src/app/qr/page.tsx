"use client";

import { useMemo, useState } from "react";
import { QrCanvas, downloadQr, type QrStyleOptions, DEFAULT_QR_OPTIONS } from "@/components/QrCanvas";
import { ImageUploader } from "@/components/ImageUploader";
import {
  buildMailtoUrl,
  buildVCard,
  buildWhatsappUrl,
  buildWifiPayload,
  downloadVCard,
  isValidEmail,
  isValidUrl,
} from "@/lib/utils";

type QrKind = "text" | "url" | "tel" | "email" | "whatsapp" | "wifi" | "vcard";

const KIND_TABS: Array<{ key: QrKind; label: string; helper: string }> = [
  { key: "text", label: "Texte", helper: "Une note, un message, une référence…" },
  { key: "url", label: "Lien / URL", helper: "Un site à partager en un scan." },
  { key: "tel", label: "Téléphone", helper: "QR au format tel: — un scan appelle." },
  { key: "email", label: "E-mail", helper: "Ouvre le client mail avec sujet pré-rempli." },
  { key: "whatsapp", label: "WhatsApp", helper: "Génère un lien wa.me avec message." },
  { key: "wifi", label: "Wi-Fi", helper: "Connexion automatique au réseau." },
  { key: "vcard", label: "Contact (vCard)", helper: "QR contenant directement le vCard." },
];

const DOT_TYPES = [
  { value: "square" as const, label: "Carrés" },
  { value: "rounded" as const, label: "Arrondis" },
  { value: "dots" as const, label: "Points" },
  { value: "classy" as const, label: "Classy" },
  { value: "classy-rounded" as const, label: "Classy arrondi" },
  { value: "extra-rounded" as const, label: "Très arrondis" },
];

const EC_LEVELS = [
  { value: "L" as const, label: "L — 7%" },
  { value: "M" as const, label: "M — 15%" },
  { value: "Q" as const, label: "Q — 25%" },
  { value: "H" as const, label: "H — 30%" },
];

export default function QrPage() {
  const [kind, setKind] = useState<QrKind>("text");
  // Per-kind state
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [wa, setWa] = useState("");
  const [waMessage, setWaMessage] = useState("");
  const [ssid, setSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiType, setWifiType] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);
  const [vcName, setVcName] = useState("");
  const [vcPhone, setVcPhone] = useState("");
  const [vcEmail, setVcEmail] = useState("");

  // Style options
  const [fg, setFg] = useState<string>(DEFAULT_QR_OPTIONS.fgColor);
  const [bg, setBg] = useState<string>(DEFAULT_QR_OPTIONS.bgColor);
  const [dotsType, setDotsType] = useState<QrStyleOptions["dotsType"]>(DEFAULT_QR_OPTIONS.dotsType);
  const [cornersSquareType, setCornersSquareType] = useState<QrStyleOptions["cornersSquareType"]>(
    DEFAULT_QR_OPTIONS.cornersSquareType,
  );
  const [cornersDotType, setCornersDotType] = useState<QrStyleOptions["cornersDotType"]>(
    DEFAULT_QR_OPTIONS.cornersDotType,
  );
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<QrStyleOptions["errorCorrectionLevel"]>(
    DEFAULT_QR_OPTIONS.errorCorrectionLevel,
  );
  const [logoUrl, setLogoUrl] = useState("");

  const [downloadError, setDownloadError] = useState<string | null>(null);

  const payload = useMemo(() => {
    switch (kind) {
      case "text":
        return text.trim();
      case "url":
        return url.trim() ? normalizeUrl(url) : "";
      case "tel":
        return tel.trim() ? `tel:${tel.replace(/[^\d+]/g, "")}` : "";
      case "email":
        return email.trim() ? buildMailtoUrl(email.trim(), emailSubject.trim() || undefined) : "";
      case "whatsapp":
        return wa.trim() ? buildWhatsappUrl(wa, waMessage.trim() || undefined) : "";
      case "wifi":
        return ssid.trim() ? buildWifiPayload(ssid, wifiPassword, wifiType, wifiHidden) : "";
      case "vcard":
        if (!vcName.trim()) return "";
        return buildVCard({
          name: vcName.trim(),
          phone: vcPhone.trim() || null,
          email: vcEmail.trim() || null,
        });
      default:
        return "";
    }
  }, [kind, text, url, tel, email, emailSubject, wa, waMessage, ssid, wifiPassword, wifiType, wifiHidden, vcName, vcPhone, vcEmail]);

  const qrOptions: QrStyleOptions = useMemo(
    () => ({
      data: payload || " ",
      size: 320,
      fgColor: fg,
      bgColor: bg,
      dotsType,
      cornersSquareType,
      cornersDotType,
      logoUrl: logoUrl.trim() || undefined,
      errorCorrectionLevel,
      hideIfDataEmpty: true,
    }),
    [payload, fg, bg, dotsType, cornersSquareType, cornersDotType, logoUrl, errorCorrectionLevel],
  );

  const payloadEmpty = !payload.trim();

  async function download(format: "png" | "svg") {
    setDownloadError(null);
    if (payloadEmpty) {
      setDownloadError("Renseigne d'abord un contenu à encoder.");
      return;
    }
    try {
      await downloadQr(qrOptions, format);
    } catch (err: any) {
      setDownloadError(err?.message ?? "Téléchargement impossible.");
    }
  }

  function downloadVCardForQr() {
    if (!vcName.trim()) {
      setDownloadError("Renseigne au moins un nom pour exporter la vCard.");
      return;
    }
    downloadVCard({
      name: vcName.trim(),
      phone: vcPhone.trim() || null,
      email: vcEmail.trim() || null,
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-indigo-600">Outil indépendant</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Générateur de QR code
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Choisis un type de contenu, colle ton info, personnalise, télécharge.
          Tout se fait dans ton navigateur — rien n'est enregistré côté serveur.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {KIND_TABS.map((tab) => {
          const active = tab.key === kind;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setKind(tab.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">
              {KIND_TABS.find((t) => t.key === kind)?.helper}
            </p>
            <div className="mt-4 space-y-3">
              {kind === "text" && (
                <Field label="Texte">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Salut ! Voici ma carte : …"
                    className={`${inputClass} min-h-[120px]`}
                    maxLength={1000}
                  />
                </Field>
              )}

              {kind === "url" && (
                <Field label="URL" hint="Doit commencer par http:// ou https://">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://exemple.com"
                    className={inputClass}
                  />
                  {url.trim() && !isValidUrl(url.trim()) && (
                    <p className="mt-1 text-xs text-rose-600">
                      Format d'URL invalide. Ajoute le https:// devant.
                    </p>
                  )}
                </Field>
              )}

              {kind === "tel" && (
                <Field label="Numéro de téléphone" hint="Avec l'indicatif pays si besoin (ex. +33…)">
                  <input
                    type="tel"
                    value={tel}
                    onChange={(e) => setTel(e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className={inputClass}
                  />
                </Field>
              )}

              {kind === "email" && (
                <>
                  <Field label="Adresse e-mail">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@exemple.com"
                      className={inputClass}
                    />
                    {email.trim() && !isValidEmail(email.trim()) && (
                      <p className="mt-1 text-xs text-rose-600">E-mail invalide.</p>
                    )}
                  </Field>
                  <Field label="Sujet (optionnel)">
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Demande de devis"
                      className={inputClass}
                    />
                  </Field>
                </>
              )}

              {kind === "whatsapp" && (
                <>
                  <Field label="Numéro WhatsApp" hint="Indicatif international sans le +">
                    <input
                      type="tel"
                      value={wa}
                      onChange={(e) => setWa(e.target.value)}
                      placeholder="33612345678"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Message pré-rempli (optionnel)">
                    <textarea
                      value={waMessage}
                      onChange={(e) => setWaMessage(e.target.value)}
                      placeholder="Bonjour, je te contacte depuis ta carte pro…"
                      className={`${inputClass} min-h-[80px]`}
                      maxLength={500}
                    />
                  </Field>
                </>
              )}

              {kind === "wifi" && (
                <>
                  <Field label="Nom du réseau (SSID)">
                    <input
                      type="text"
                      value={ssid}
                      onChange={(e) => setSsid(e.target.value)}
                      placeholder="MonCafeWifi"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Mot de passe" hint="Ignoré si le réseau est ouvert">
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="Mot de passe Wi-Fi"
                      className={inputClass}
                      disabled={wifiType === "nopass"}
                    />
                  </Field>
                  <Field label="Type de sécurité">
                    <select
                      value={wifiType}
                      onChange={(e) => setWifiType(e.target.value as any)}
                      className={inputClass}
                    >
                      <option value="WPA">WPA / WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">Aucun (réseau ouvert)</option>
                    </select>
                  </Field>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    Réseau caché
                  </label>
                </>
              )}

              {kind === "vcard" && (
                <>
                  <Field label="Nom">
                    <input
                      type="text"
                      value={vcName}
                      onChange={(e) => setVcName(e.target.value)}
                      placeholder="Amine Koffi"
                      className={inputClass}
                    />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Téléphone">
                      <input
                        type="tel"
                        value={vcPhone}
                        onChange={(e) => setVcPhone(e.target.value)}
                        placeholder="+33 6 12 34 56 78"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="E-mail">
                      <input
                        type="email"
                        value={vcEmail}
                        onChange={(e) => setVcEmail(e.target.value)}
                        placeholder="amine@exemple.com"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </>
              )}
            </div>
          </div>

          <StylePanel
            fg={fg}
            setFg={setFg}
            bg={bg}
            setBg={setBg}
            dotsType={dotsType}
            setDotsType={setDotsType}
            cornersSquareType={cornersSquareType}
            setCornersSquareType={setCornersSquareType}
            cornersDotType={cornersDotType}
            setCornersDotType={setCornersDotType}
            errorCorrectionLevel={errorCorrectionLevel}
            setErrorCorrectionLevel={setErrorCorrectionLevel}
            logoUrl={logoUrl}
            setLogoUrl={setLogoUrl}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Aperçu
            </p>
            <div className="mt-3 grid place-items-center">
              <QrCanvas options={qrOptions} />
            </div>
            <p className="mt-3 break-all text-center text-xs text-slate-500">
              {payloadEmpty ? "Renseigne un champ pour générer le QR code." : truncate(payload, 140)}
            </p>
            {downloadError ? (
              <p className="mt-2 text-center text-xs text-rose-600">{downloadError}</p>
            ) : null}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => download("png")}
                disabled={payloadEmpty}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Télécharger PNG
              </button>
              <button
                type="button"
                onClick={() => download("svg")}
                disabled={payloadEmpty}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Télécharger SVG
              </button>
            </div>
            {kind === "vcard" ? (
              <button
                type="button"
                onClick={downloadVCardForQr}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100 transition hover:bg-indigo-100"
              >
                Télécharger aussi en .vcf
              </button>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

function StylePanel(props: {
  fg: string;
  setFg: (v: string) => void;
  bg: string;
  setBg: (v: string) => void;
  dotsType: QrStyleOptions["dotsType"];
  setDotsType: (v: QrStyleOptions["dotsType"]) => void;
  cornersSquareType: QrStyleOptions["cornersSquareType"];
  setCornersSquareType: (v: QrStyleOptions["cornersSquareType"]) => void;
  cornersDotType: QrStyleOptions["cornersDotType"];
  setCornersDotType: (v: QrStyleOptions["cornersDotType"]) => void;
  errorCorrectionLevel: QrStyleOptions["errorCorrectionLevel"];
  setErrorCorrectionLevel: (v: QrStyleOptions["errorCorrectionLevel"]) => void;
  logoUrl: string;
  setLogoUrl: (v: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">Personnalisation</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Couleur du QR">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={props.fg}
              onChange={(e) => props.setFg(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white"
            />
            <input
              type="text"
              value={props.fg}
              onChange={(e) => props.setFg(e.target.value)}
              className={`${inputClass} flex-1 font-mono`}
            />
          </div>
        </Field>
        <Field label="Couleur de fond">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={props.bg}
              onChange={(e) => props.setBg(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white"
            />
            <input
              type="text"
              value={props.bg}
              onChange={(e) => props.setBg(e.target.value)}
              className={`${inputClass} flex-1 font-mono`}
            />
          </div>
        </Field>
        <Field label="Style des points">
          <select
            value={props.dotsType ?? "square"}
            onChange={(e) => props.setDotsType(e.target.value as any)}
            className={inputClass}
          >
            {DOT_TYPES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Coins carrés">
          <select
            value={props.cornersSquareType ?? "square"}
            onChange={(e) => props.setCornersSquareType(e.target.value as any)}
            className={inputClass}
          >
            <option value="square">Carré</option>
            <option value="dot">Point</option>
            <option value="extra-rounded">Très arrondi</option>
          </select>
        </Field>
        <Field label="Coins des modules">
          <select
            value={props.cornersDotType ?? "square"}
            onChange={(e) => props.setCornersDotType(e.target.value as any)}
            className={inputClass}
          >
            <option value="square">Carré</option>
            <option value="dot">Point</option>
          </select>
        </Field>
        <Field label="Correction d'erreur" hint="Plus c'est haut, plus le QR résiste aux logos">
          <select
            value={props.errorCorrectionLevel ?? "Q"}
            onChange={(e) => props.setErrorCorrectionLevel(e.target.value as any)}
            className={inputClass}
          >
            {EC_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Logo central (URL)" hint="Optionnel. Passe en H pour ne pas casser la lisibilité." full>
          <input
            type="url"
            value={props.logoUrl}
            onChange={(e) => props.setLogoUrl(e.target.value)}
            placeholder="https://exemple.com/mon-logo.png"
            className={inputClass}
          />
        </Field>
      </div>
    </div>
  );
}

const inputClass =
  "block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10";

function Field({
  label,
  children,
  hint,
  full,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

