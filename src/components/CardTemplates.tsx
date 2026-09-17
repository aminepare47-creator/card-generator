"use client";

import { useEffect, useRef, useState } from "react";
import { initials } from "@/lib/utils";
import { QrCanvas } from "@/components/QrCanvas";

export interface TemplateCardData {
  name: string;
  title: string;
  company?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  photoUrl?: string | null;
  logoUrl?: string | null;
  bio?: string | null;
  theme: string;
  // Customization overrides (all optional):
  customColor?: string | null; // #rrggbb — replaces the theme's main color
  fontFamily?: string | null; // "sans" | "serif" | "mono"
  photoShape?: string | null; // "circle" | "rounded" | "square"
  nameSize?: string | null; // "sm" | "md" | "lg"
}

// Every template renders a LANDSCAPE business card (7:4 ratio, like a real
// 85x55mm card) with both faces: "recto" (identity) and "verso" (contacts).
type Side = "recto" | "verso";

interface TemplateProps {
  card: TemplateCardData;
  side: Side;
}

// Hex palettes per theme — Tailwind classes alone can't feed gradients/SVG.
const THEME_HEX: Record<
  string,
  { main: string; dark: string; deep: string; light: string; soft: string }
> = {
  indigo: { main: "#4f46e5", dark: "#3730a3", deep: "#1e1b4b", light: "#c7d2fe", soft: "#eef2ff" },
  emerald: { main: "#059669", dark: "#047857", deep: "#064e3b", light: "#a7f3d0", soft: "#ecfdf5" },
  rose: { main: "#e11d48", dark: "#be123c", deep: "#881337", light: "#fecdd3", soft: "#fff1f2" },
  amber: { main: "#f59e0b", dark: "#d97706", deep: "#78350f", light: "#fde68a", soft: "#fffbeb" },
  sky: { main: "#0284c7", dark: "#0369a1", deep: "#0c4a6e", light: "#bae6fd", soft: "#f0f9ff" },
  violet: { main: "#7c3aed", dark: "#6d28d9", deep: "#4c1d95", light: "#ddd6fe", soft: "#f5f3ff" },
};

function hexMix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16) || 0);
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16) || 0);
  const mix = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return "#" + mix.map((v) => v.toString(16).padStart(2, "0")).join("");
}

function pal(card: Pick<TemplateCardData, "theme" | "customColor">) {
  const base = THEME_HEX[card.theme] ?? THEME_HEX.indigo;
  const custom = card.customColor;
  if (!custom || !/^#[0-9a-fA-F]{6}$/.test(custom)) return base;
  return {
    main: custom,
    dark: hexMix(custom, "#000000", 0.28),
    deep: hexMix(custom, "#000000", 0.62),
    light: hexMix(custom, "#ffffff", 0.58),
    soft: hexMix(custom, "#ffffff", 0.9),
  };
}

// Font family override applied to the whole card face.
function faceFont(card: TemplateCardData): React.CSSProperties {
  if (card.fontFamily === "serif") return { fontFamily: "Georgia, 'Times New Roman', serif" };
  if (card.fontFamily === "mono") return { fontFamily: "'Courier New', ui-monospace, monospace" };
  return {};
}

// Display-name size variant: returns the matching Tailwind size class.
function ns(card: TemplateCardData, sm: string, md: string, lg: string): string {
  return card.nameSize === "sm" ? sm : card.nameSize === "lg" ? lg : md;
}

// Photo frame shape (default: circle, like the reference cards).
const SHAPE_CLASS: Record<string, string> = {
  circle: "rounded-full",
  rounded: "rounded-2xl",
  square: "rounded-none",
};

function photoShapeClass(card: TemplateCardData): string {
  return SHAPE_CLASS[card.photoShape ?? "circle"] ?? SHAPE_CLASS.circle;
}

// ---------- Icons ------------------------------------------------------------

function IconPhone() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
function IconWhatsApp() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M20.52 3.48A11.94 11.94 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.15 1.6 5.96L0 24l6.32-1.66a11.86 11.86 0 0 0 5.71 1.46h.01c6.55 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.42-8.42ZM12.04 21.8h-.01a9.86 9.86 0 0 1-5.02-1.38l-.36-.21-3.75.98 1-3.65-.24-.37a9.85 9.85 0 1 1 18.26-5.27c0 5.45-4.43 9.9-9.88 9.9Zm5.42-7.39c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.66.15-.2.3-.76.97-.94 1.17-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.91-2.18-.24-.58-.49-.5-.66-.51l-.56-.01c-.2 0-.51.07-.78.37-.27.3-1.03 1-1.03 2.45 0 1.45 1.05 2.85 1.2 3.05.15.2 2.07 3.17 5.02 4.45.7.3 1.25.48 1.68.61.7.22 1.34.19 1.85.12.56-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}
function IconMap() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// ---------- Shared building blocks ------------------------------------------

function CardFace({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`relative aspect-[7/4] w-full overflow-hidden rounded-2xl shadow-lg ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

function Avatar({
  photoUrl,
  name,
  size,
  className = "",
  textClass = "",
  shape = "rounded-full",
}: {
  photoUrl?: string | null;
  name: string;
  size: number;
  className?: string;
  textClass?: string;
  shape?: string;
}) {
  if (photoUrl) {
    return (
      <span
        className={`inline-flex shrink-0 overflow-hidden ${shape} ${className}`}
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt={name} width={size} height={size} className="h-full w-full object-cover" />
      </span>
    );
  }
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full bg-white/15 ${shape} ${className} ${textClass}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {initials(name) || "·"}
    </span>
  );
}

// Logo badge: shows the uploaded company logo if any, else the initials.
function BrandMark({
  logoUrl,
  label,
  size,
  className = "",
  textClass = "",
  imgClass = "",
  style,
}: {
  logoUrl?: string | null;
  label: string;
  size: number;
  className?: string;
  textClass?: string;
  imgClass?: string;
  style?: React.CSSProperties;
}) {
  const inner = logoUrl ? (
    <span
      className={`inline-grid place-items-center overflow-hidden ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={label}
        width={size}
        height={size}
        className={`h-full w-full object-contain p-[8%] ${imgClass}`}
      />
    </span>
  ) : (
    <span
      className={`inline-grid place-items-center ${className} ${textClass}`}
      style={{ width: size, height: size, ...style }}
      aria-hidden="true"
    >
      {initials(label) || "·"}
    </span>
  );
  return inner;
}

function ContactItem({
  href,
  icon,
  text,
  chipBg,
  chipText = "#ffffff",
  textClass,
}: {
  href?: string;
  icon: React.ReactNode;
  text: string;
  chipBg: string;
  chipText?: string;
  textClass: string;
}) {
  const Wrapper: any = href ? "a" : "div";
  return (
    <Wrapper
      {...(href
        ? {
            href,
            target: href.startsWith("http") ? "_blank" : undefined,
            rel: "noopener noreferrer",
            // Don't flip the card when tapping a link inside the FlipCard.
            onClick: (e: React.MouseEvent) => e.stopPropagation(),
          }
        : {})}
      className="flex min-w-0 items-center gap-2"
    >
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full"
        style={{ background: chipBg, color: chipText }}
      >
        {icon}
      </span>
      <span className={`truncate text-xs font-medium ${textClass}`}>{text}</span>
    </Wrapper>
  );
}

function ContactList({
  card,
  chipBg,
  chipText = "#ffffff",
  textClass,
  horizontal = false,
}: {
  card: TemplateCardData;
  chipBg: string;
  chipText?: string;
  textClass: string;
  horizontal?: boolean;
}) {
  const rows = [
    card.phone && { key: "phone", href: `tel:${card.phone}`, icon: <IconPhone />, text: card.phone },
    card.email && { key: "email", href: `mailto:${card.email}`, icon: <IconMail />, text: card.email },
    card.website && {
      key: "web",
      href: card.website,
      icon: <IconGlobe />,
      text: card.website.replace(/^https?:\/\//, ""),
    },
    card.whatsapp && {
      key: "wa",
      href: `https://wa.me/${card.whatsapp.replace(/[^\d]/g, "")}`,
      icon: <IconWhatsApp />,
      text: card.whatsapp,
    },
    card.address && { key: "addr", href: undefined, icon: <IconMap />, text: card.address },
  ].filter(Boolean) as Array<{ key: string; href?: string; icon: React.ReactNode; text: string }>;

  if (rows.length === 0) {
    if (card.bio) {
      return (
        <p className={`whitespace-pre-line text-[10px] leading-snug opacity-75 ${textClass}`}>
          {card.bio}
        </p>
      );
    }
    return (
      <p className={`text-[11px] italic opacity-60 ${textClass}`}>
        Ajoute tes contacts (téléphone, e-mail…) pour remplir ce verso.
      </p>
    );
  }

  return (
    <div className={horizontal ? "flex flex-wrap items-center gap-x-4 gap-y-2" : "flex flex-col gap-2.5"}>
      {rows.map((r) => (
        <ContactItem
          key={r.key}
          href={r.href}
          icon={r.icon}
          text={r.text}
          chipBg={chipBg}
          chipText={chipText}
          textClass={textClass}
        />
      ))}
      {card.bio ? (
        <p
          className={`whitespace-pre-line text-[10px] leading-snug opacity-75 ${textClass} ${
            horizontal ? "w-full" : "max-w-[230px]"
          }`}
        >
          {card.bio}
        </p>
      ) : null}
    </div>
  );
}

function SocialChips({
  card,
  className = "",
  chipClass = "bg-white/90 text-slate-700 ring-black/10",
}: {
  card: TemplateCardData;
  className?: string;
  chipClass?: string;
}) {
  const items = [
    card.linkedin && { key: "in", label: "LinkedIn", href: card.linkedin },
    card.facebook && { key: "fb", label: "Facebook", href: card.facebook },
    card.instagram && { key: "ig", label: "Instagram", href: card.instagram },
  ].filter(Boolean) as Array<{ key: string; label: string; href: string }>;
  if (items.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {items.map((s) => (
        <a
          key={s.key}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ${chipClass}`}
        >
          {s.label}
        </a>
      ))}
    </div>
  );
}

// Renders children (a fixed 420x240 card design) scaled to fit its container.
function ScaledPreview({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / 420);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="relative aspect-[7/4] w-full overflow-hidden rounded-xl">
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: 420, height: 240, transform: `scale(${scale})`, opacity: scale ? 1 : 0 }}
      >
        {children}
      </div>
    </div>
  );
}

// ======== 1. HALO — photo cerclée sur fond nuit (réf. carte "Dicky P.") ======

const HALO_NAVY = "#101c33";

function HaloTemplate({ card, side }: TemplateProps) {
  const p = pal(card);
  if (side === "verso") {
    return (
      <CardFace style={{ background: HALO_NAVY, ...faceFont(card) }}>
        <div className="absolute inset-0 flex items-center justify-between gap-4 px-6">
          <div className="min-w-0 w-[58%]">
            <p className={`${ns(card, "text-sm", "text-lg", "text-xl")} font-bold text-white`}>{card.name || "Ton nom"}</p>
            <p className="text-[11px] font-semibold" style={{ color: p.light }}>
              {card.title || "Ton poste"}
            </p>
            <div className="mt-3">
              <ContactList card={card} chipBg="#ffffff" chipText={HALO_NAVY} textClass="text-white/85" />
            </div>
            <SocialChips card={card} className="mt-3" chipClass="bg-white/10 text-white ring-white/20" />
          </div>
          <div className="shrink-0">
            <span
              className="grid h-24 w-24 place-items-center rounded-full"
              style={{ border: `2px solid ${p.main}`, boxShadow: `0 0 22px ${p.main}55` }}
            >
              <Avatar photoUrl={card.photoUrl} name={card.name} size={86} className="text-white" shape={photoShapeClass(card)} />
            </span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-1.5 w-full" style={{ background: p.main }} />
      </CardFace>
    );
  }
  return (
    <CardFace style={{ background: HALO_NAVY, ...faceFont(card) }}>
      <div
        className="absolute -right-12 -top-16 h-48 w-48 rounded-full opacity-25 blur-3xl"
        style={{ background: p.main }}
      />
      <div className="absolute inset-0 flex items-center justify-between gap-4 px-6">
        <span
          className="grid h-28 w-28 shrink-0 place-items-center rounded-full"
          style={{ border: `2px solid ${p.main}` }}
        >
          <span
            className="grid h-[100px] w-[100px] place-items-center rounded-full"
            style={{ border: `1px solid ${p.light}66` }}
          >
            <Avatar photoUrl={card.photoUrl} name={card.name} size={90} className="text-white" shape={photoShapeClass(card)} />
          </span>
        </span>
        <div className="min-w-0 w-[55%]">
          {card.company ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: p.light }}>
              ◆ {card.company}
            </p>
          ) : null}
          <p className={`mt-1 truncate ${ns(card, "text-base", "text-xl", "text-2xl")} font-extrabold text-white`}>{card.name || "Ton nom"}</p>
          <p className="truncate text-xs font-medium" style={{ color: p.light }}>
            {card.title || "Ton poste"}
          </p>
          {card.website ? (
            <span
              className="mt-3 inline-block rounded-full px-3 py-1 text-[10px] font-semibold text-white"
              style={{ background: p.main }}
            >
              {card.website.replace(/^https?:\/\//, "")}
            </span>
          ) : null}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-1.5 w-full" style={{ background: p.main }} />
    </CardFace>
  );
}

// ======== 2. BLOB — forme organique colorée (réf. carte "Muda Johns") ========

function BlobTemplate({ card, side }: TemplateProps) {
  const p = pal(card);
  if (side === "verso") {
    return (
      <CardFace style={{ background: p.main, ...faceFont(card) }}>
        <div className="absolute -left-10 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-white/95" />
        <span className="absolute left-9 top-1/2 -translate-y-1/2">
          <BrandMark
            logoUrl={card.logoUrl}
            label={card.company || card.name || "·"}
            size={100}
            textClass="text-3xl font-black"
            style={{ color: p.main }}
          />
        </span>
        <div className="absolute right-6 top-1/2 w-[52%] -translate-y-1/2 text-right">
          <p className="text-xl font-extrabold uppercase tracking-wide text-white">
            {card.company || card.name || "Entreprise"}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-white/80">
            {card.title || "Ton poste"}
          </p>
          {card.website ? (
            <p className="mt-3 text-xs font-medium text-white/90">
              {card.website.replace(/^https?:\/\//, "")}
            </p>
          ) : null}
          <SocialChips card={card} className="mt-3 justify-end" chipClass="bg-white/15 text-white ring-white/25" />
        </div>
      </CardFace>
    );
  }
  return (
    <CardFace className="bg-white" style={faceFont(card)}>
      <div
        className="absolute -right-16 -top-20 h-[150%] w-[54%]"
        style={{ background: p.main, borderRadius: "58% 42% 45% 55% / 55% 48% 52% 45%" }}
      >
        <BrandMark
          logoUrl={card.logoUrl}
          label={card.company || card.name || "·"}
          size={64}
          className="rounded-full bg-white/95"
          textClass="text-sm font-bold"
          style={{ color: p.main }}
        />
      </div>
      <div className="absolute inset-y-0 left-0 flex w-[56%] flex-col justify-center px-6">
        <p className={`${ns(card, "text-base", "text-xl", "text-2xl")} font-extrabold uppercase tracking-wide`} style={{ color: p.main }}>
          {card.name || "Ton nom"}
        </p>
        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          {card.title || "Ton poste"}
        </p>
        <div className="mt-4">
          <ContactList card={card} chipBg={p.main} textClass="text-slate-600" />
        </div>
      </div>
    </CardFace>
  );
}

// ======== 3. VAGUES — courbes fluides + logo diamant =========================

function VaguesTemplate({ card, side }: TemplateProps) {
  const p = pal(card);
  if (side === "verso") {
    return (
      <CardFace className="bg-white" style={faceFont(card)}>
        <svg className="absolute left-0 top-0 h-full w-[42%]" viewBox="0 0 60 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 0 L36 0 C18 30 44 64 14 100 L0 100 Z" fill={p.main} />
          <path d="M0 0 L18 0 C6 34 28 68 4 100 L0 100 Z" fill={p.dark} opacity="0.9" />
        </svg>
        <div className="absolute bottom-6 right-6 top-6 w-[52%] min-w-0">
          <p className="text-lg font-bold" style={{ color: p.deep }}>
            {card.name || "Ton nom"}
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {card.title || "Ton poste"}
          </p>
          <div className="mt-3">
            <ContactList card={card} chipBg={p.main} textClass="text-slate-600" />
          </div>
          <SocialChips card={card} className="mt-3" chipClass="bg-slate-100 text-slate-700 ring-black/5" />
        </div>
      </CardFace>
    );
  }
  return (
    <CardFace className="bg-white" style={faceFont(card)}>
      <svg className="absolute right-0 top-0 h-[52%] w-[70%]" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
        <path d="M100 0 L100 42 C76 58 46 20 0 34 L0 0 Z" fill={p.main} />
        <path d="M100 0 L100 22 C78 34 44 4 0 15 L0 0 Z" fill={p.dark} />
      </svg>
      <svg className="absolute bottom-0 left-0 h-[34%] w-[58%]" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 60 L0 26 C30 8 62 46 100 26 L100 60 Z" fill={p.soft} />
      </svg>
      <div className="absolute inset-x-0 bottom-0 top-12 flex flex-col items-center justify-center gap-1 px-8 text-center">
        <span
          className="grid h-11 w-11 rotate-45 place-items-center rounded-md"
          style={{ border: `2px solid ${p.main}`, color: p.main }}
        >
          <span className="-rotate-45">
            <BrandMark
              logoUrl={card.logoUrl}
              label={card.company || card.name || "·"}
              size={40}
              textClass="text-sm font-black"
              style={{ color: p.main }}
            />
          </span>
        </span>
        <p className={`mt-2 ${ns(card, "text-sm", "text-lg", "text-xl")} font-extrabold uppercase tracking-wide text-slate-900`}>
          {card.name || "Ton nom"}
        </p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: p.main }}>
          {card.title || "Ton poste"}
        </p>
        {card.website ? (
          <span
            className="mt-2 rounded-full px-3 py-1 text-[10px] font-semibold text-white"
            style={{ background: p.main }}
          >
            {card.website.replace(/^https?:\/\//, "")}
          </span>
        ) : null}
      </div>
    </CardFace>
  );
}

// ======== 4. SPHÉRIQUE — arcs lumineux sur fond noir tech (réf. SphericalTech)

function SpheriqueTemplate({ card, side }: TemplateProps) {
  const p = pal(card);
  const bg = "#0b0f14";
  if (side === "verso") {
    return (
      <CardFace
        style={{ ...faceFont(card),
          background: bg,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8">
          <span
            className="grid h-24 w-24 place-items-center rounded-full"
            style={{ border: `2px solid ${p.main}`, boxShadow: `0 0 30px ${p.main}66` }}
          >
            <Avatar photoUrl={card.photoUrl} name={card.name} size={86} className="text-white" shape={photoShapeClass(card)} />
          </span>
          <p className="text-base font-bold text-white">{card.name || "Ton nom"}</p>
          <ContactList card={card} chipBg={p.main} textClass="text-white/85" horizontal />
        </div>
      </CardFace>
    );
  }
  return (
    <CardFace style={{ background: bg }}>
      <svg
        className="absolute left-1/2 top-1/2 h-[220%] -translate-x-1/2 -translate-y-1/2"
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        {[30, 45, 60, 75, 90].map((r, i) => (
          <circle
            key={r}
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke={p.main}
            strokeWidth="1.6"
            opacity={0.55 - i * 0.09}
            strokeDasharray={i % 2 ? "70 26" : undefined}
          />
        ))}
        <circle cx="145" cy="100" r="4" fill={p.main} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {card.company ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em]" style={{ color: p.light }}>
            {card.company}
          </p>
        ) : null}
        <p className={`mt-1 ${ns(card, "text-lg", "text-2xl", "text-3xl")} font-extrabold text-white`}>{card.name || "Ton nom"}</p>
        <p className="text-xs font-medium" style={{ color: p.main }}>
          {card.title || "Ton poste"}
        </p>
      </div>
      <div className="absolute bottom-3 right-4 text-[10px] font-medium text-white/40">
        {card.website ? card.website.replace(/^https?:\/\//, "") : null}
      </div>
    </CardFace>
  );
}

// ======== 5. ARCHE — arche arrondie + demi-cercle (réf. carte "John Luke") ===

function ArcheTemplate({ card, side }: TemplateProps) {
  const p = pal(card);
  if (side === "verso") {
    return (
      <CardFace className="bg-white" style={faceFont(card)}>
        <div className="absolute left-6 top-1/2 w-[50%] min-w-0 -translate-y-1/2">
          <ContactList card={card} chipBg={p.main} textClass="text-slate-600" />
          <SocialChips card={card} className="mt-3" chipClass="bg-slate-100 text-slate-700 ring-black/5" />
        </div>
        <div
          className="absolute right-0 top-1/2 flex h-[82%] w-[42%] -translate-y-1/2 flex-col items-center justify-center rounded-l-[999px] text-center"
          style={{ background: p.main }}
        >
          <Avatar
            photoUrl={card.photoUrl}
            name={card.name}
            size={64}
            className="bg-white/15 text-white ring-2 ring-white/70"
            shape={photoShapeClass(card)}
          />
          <p className={`mt-2 max-w-[85%] ${ns(card, "text-xs", "text-sm", "text-base")} font-extrabold text-white`}>{card.name || "Ton nom"}</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/80">{card.title || "Ton poste"}</p>
        </div>
      </CardFace>
    );
  }
  return (
    <CardFace className="bg-white" style={faceFont(card)}>
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full" style={{ background: p.soft }} />
      <div className="absolute -bottom-8 right-8 h-24 w-24 rounded-full opacity-60" style={{ background: p.light }} />
      <div
        className="absolute left-1/2 top-0 flex h-[80%] w-[58%] -translate-x-1/2 flex-col items-center justify-center rounded-b-[52px] text-center"
        style={{ background: p.main }}
      >
        <BrandMark
          logoUrl={card.logoUrl}
          label={card.company || card.name || "·"}
          size={56}
          className="rounded-full bg-white/95"
          textClass="text-lg font-black"
          style={{ color: p.main }}
        />
        <p className="mt-2 max-w-[85%] text-base font-extrabold uppercase tracking-wide text-white">
          {card.company || card.name || "Entreprise"}
        </p>
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/80">{card.title || "Ton poste"}</p>
      </div>
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-500">
        {card.website ? card.website.replace(/^https?:\/\//, "") : card.name || "Ton nom"}
      </p>
    </CardFace>
  );
}

// ======== 6. VORTEX — spirale graphique pleine carte (réf. carte "Obstacle") =

function VortexTemplate({ card, side }: TemplateProps) {
  const p = pal(card);
  const strokes = [p.main, p.dark, p.light, p.main, p.dark, p.light, p.main, p.dark];
  if (side === "verso") {
    return (
      <CardFace className="bg-white" style={faceFont(card)}>
        <div className="absolute left-6 top-6 flex items-center gap-3">
          <BrandMark
            logoUrl={card.logoUrl}
            label={card.company || card.name || "·"}
            size={48}
            className="rounded-full"
            textClass="text-sm font-black"
            style={{ border: `2px solid ${p.main}`, color: p.main }}
          />
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold text-slate-900">{card.name || "Ton nom"}</p>
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: p.main }}>
              {card.title || "Ton poste"}
            </p>
          </div>
        </div>
        <div className="absolute left-6 right-6 top-24">
          <ContactList card={card} chipBg={p.main} textClass="text-slate-600" horizontal />
        </div>
        <svg className="absolute bottom-0 left-0 h-[42%] w-full" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 40 L0 24 C28 6 58 36 100 14 L100 40 Z" fill={p.main} />
          <path d="M0 40 L0 34 C34 22 66 44 100 28 L100 40 Z" fill={p.dark} opacity="0.85" />
        </svg>
      </CardFace>
    );
  }
  return (
    <CardFace style={{ background: p.soft, ...faceFont(card) }}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 57" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <circle
            key={i}
            cx="50"
            cy="28.5"
            r={7 + i * 4.2}
            fill="none"
            stroke={strokes[i]}
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeDasharray="20 12"
            transform={`rotate(${i * 42} 50 28.5)`}
            opacity={0.9 - i * 0.07}
          />
        ))}
      </svg>
      <div className="absolute left-1/2 top-1/2 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-center shadow-xl">
        <div className="flex flex-col items-center gap-1 px-2">
          {card.logoUrl ? (
            <BrandMark logoUrl={card.logoUrl} label={card.company || card.name || "Entreprise"} size={52} />
          ) : null}
          <p className="text-sm font-black uppercase leading-tight" style={{ color: p.main }}>
            {card.logoUrl ? card.name || "" : card.company || card.name || "Entreprise"}
          </p>
          <p className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-slate-500">
            {card.website ? card.website.replace(/^https?:\/\//, "") : card.title || "Ton poste"}
          </p>
        </div>
      </div>
    </CardFace>
  );
}

// ======== 7. MODERNIX — marine & crème, encoche, pastilles ===================

const MOD_NAVY = "#17324a";
const MOD_CREAM = "#f2ece1";
const MOD_COPPER = "#c98d5e";

function ModernixTemplate({ card, side }: TemplateProps) {
  if (side === "verso") {
    return (
      <CardFace style={{ background: MOD_CREAM }}>
        <div
          className="absolute right-4 top-4 flex h-16 w-20 items-center justify-center"
          style={{ background: MOD_NAVY, borderRadius: "20px 20px 20px 4px" }}
        >
          <BrandMark
            logoUrl={card.logoUrl}
            label={card.name}
            size={64}
            textClass="font-serif text-xl font-bold tracking-widest"
            style={{ color: MOD_COPPER }}
          />
        </div>
        <div className="absolute bottom-0 right-0 h-8 w-8" style={{ background: MOD_COPPER, borderRadius: "32px 0 0 0" }} />
        <div className="absolute inset-y-0 left-0 flex w-[62%] flex-col justify-center px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: MOD_NAVY }}>
            Contact
          </p>
          <div className="mt-3">
            <ContactList card={card} chipBg={MOD_NAVY} textClass="text-slate-700" />
          </div>
          <SocialChips card={card} className="mt-3" chipClass="bg-white text-slate-700 ring-black/10" />
        </div>
      </CardFace>
    );
  }
  return (
    <CardFace style={{ background: MOD_NAVY }}>
      <div
        className="absolute right-4 top-4 flex h-24 w-28 items-center justify-center"
        style={{ background: MOD_CREAM, borderRadius: "32px 32px 32px 6px" }}
      >
        <BrandMark
          logoUrl={card.logoUrl}
          label={card.name}
          size={84}
          textClass="font-serif text-2xl font-bold tracking-widest"
          style={{ color: MOD_COPPER }}
        />
      </div>
      <div className="absolute bottom-0 left-0 h-10 w-10" style={{ background: MOD_COPPER, borderRadius: "0 32px 0 0" }} />
      <div className="absolute inset-y-0 left-0 flex w-[62%] flex-col justify-center px-6">
        <p className={`font-serif ${ns(card, "text-base", "text-xl", "text-2xl")} font-semibold tracking-[0.12em]`} style={{ color: MOD_CREAM }}>
          {(card.name || "Ton nom").toUpperCase()}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="h-px w-6" style={{ background: MOD_COPPER }} />
          <p className="truncate text-[10px] uppercase tracking-[0.22em]" style={{ color: MOD_COPPER }}>
            {card.title || "Ton poste"}
          </p>
        </div>
        {card.company ? <p className="mt-2 truncate text-xs text-white/60">{card.company}</p> : null}
        {card.website ? (
          <span
            className="mt-4 inline-block w-fit rounded-full px-3 py-1 text-[10px] font-semibold"
            style={{ background: MOD_COPPER, color: MOD_NAVY }}
          >
            {card.website.replace(/^https?:\/\//, "")}
          </span>
        ) : null}
      </div>
    </CardFace>
  );
}

// ======== 8. PRESTIGE — noir & or, vague dorée ================================

const PR_GOLD = "#d4af37";
const PR_GOLD_LIGHT = "#f0dfa8";
const PR_BLACK = "#0a0a0a";

function PrestigeTemplate({ card, side }: TemplateProps) {
  if (side === "verso") {
    return (
      <CardFace style={{ background: PR_BLACK, ...faceFont(card) }}>
        <div className="absolute left-1/2 top-5 h-px w-24 -translate-x-1/2" style={{ background: PR_GOLD }} />
        <svg className="absolute bottom-0 right-0 h-[55%] w-[45%]" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M100 60 L100 20 C70 40 40 8 0 26 L0 60 Z" fill={PR_GOLD} opacity="0.12" />
        </svg>
        <div className="absolute inset-0 flex flex-col justify-center px-10">
          <div className="mx-auto w-full max-w-[300px]">
            <ContactList card={card} chipBg="rgba(212,175,55,0.16)" chipText={PR_GOLD} textClass="text-white/85" />
            <SocialChips card={card} className="mt-4" chipClass="bg-white/5 text-[#d4af37] ring-[#d4af37]/40" />
          </div>
        </div>
      </CardFace>
    );
  }
  return (
    <CardFace style={{ background: PR_BLACK, ...faceFont(card) }}>
      <svg className="absolute left-0 top-0 h-full w-[42%]" viewBox="0 0 60 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0 L26 0 C10 34 34 66 8 100 L0 100 Z" fill={PR_GOLD} opacity="0.9" />
        <path d="M0 0 L12 0 C2 36 18 70 2 100 L0 100 Z" fill={PR_GOLD_LIGHT} opacity="0.5" />
      </svg>
      <div className="absolute right-6 top-1/2 flex w-[55%] -translate-y-1/2 items-center gap-4">
        <BrandMark
          logoUrl={card.logoUrl}
          label={card.name}
          size={64}
          className="rounded-full"
          textClass="font-serif text-lg font-bold"
          style={{ border: `2px solid ${PR_GOLD}`, color: PR_GOLD }}
        />
        <div className="min-w-0">
          <p className={`truncate font-serif ${ns(card, "text-sm", "text-lg", "text-xl")} font-semibold text-white`}>{card.name || "Ton nom"}</p>
          <p className="truncate text-[10px] uppercase tracking-[0.25em]" style={{ color: PR_GOLD }}>
            {card.title || "Ton poste"}
          </p>
          {card.company ? <p className="mt-0.5 truncate text-[11px] text-white/60">{card.company}</p> : null}
        </div>
      </div>
      <div className="absolute bottom-4 right-6 text-[10px] tracking-[0.2em] text-white/40">
        {card.website ? card.website.replace(/^https?:\/\//, "").toUpperCase() : "MYCARD"}
      </div>
    </CardFace>
  );
}

// ======== 9. FLUIDE — diagonales géométriques + double vague =================

function FluideTemplate({ card, side }: TemplateProps) {
  const p = pal(card);
  if (side === "verso") {
    return (
      <CardFace className="bg-white" style={faceFont(card)}>
        <div className="absolute left-6 top-6 w-[55%] min-w-0">
          <ContactList card={card} chipBg={p.main} textClass="text-slate-600" />
        </div>
        <div className="absolute right-6 top-6 text-right">
          <p className="text-sm font-extrabold text-slate-900">{card.name || "Ton nom"}</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: p.main }}>
            {card.title || "Ton poste"}
          </p>
        </div>
        <svg className="absolute bottom-0 left-0 h-[38%] w-full" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 40 L0 22 C30 4 62 36 100 12 L100 40 Z" fill={p.main} />
          <path d="M0 40 L0 32 C34 20 68 42 100 26 L100 40 Z" fill="#1e293b" />
        </svg>
      </CardFace>
    );
  }
  return (
    <CardFace className="bg-white" style={faceFont(card)}>
      <div className="absolute -right-6 -top-8 h-24 w-40 rotate-[-18deg]" style={{ background: p.main }} />
      <div className="absolute -right-10 top-6 h-20 w-44 rotate-[-18deg] bg-slate-800" />
      <div className="absolute -bottom-6 -left-8 h-20 w-32 rotate-[20deg]" style={{ background: p.light }} />
      <div className="absolute inset-y-0 left-0 flex w-[70%] flex-col justify-center px-6">
        <p className={`${ns(card, "text-lg", "text-2xl", "text-3xl")} font-black leading-tight text-slate-900`}>{card.name || "Ton nom"}</p>
        <p className="mt-0.5 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: p.main }}>
          {card.title || "Ton poste"}
        </p>
        {card.company ? <p className="mt-1 text-xs text-slate-500">{card.company}</p> : null}
      </div>
      <p className="absolute bottom-4 right-5 font-mono text-[10px] text-slate-400">
        {card.website ? card.website.replace(/^https?:\/\//, "") : "www.exemple.com"}
      </p>
    </CardFace>
  );
}

// ======== 10. HEXAGONE — badge hexagonal sur fond nuit =======================

const HEX_CLIP = "polygon(25% 3%, 75% 3%, 98% 50%, 75% 97%, 25% 97%, 2% 50%)";

function HexagoneTemplate({ card, side }: TemplateProps) {
  const p = pal(card);
  if (side === "verso") {
    return (
      <CardFace style={{ background: "#101216", ...faceFont(card) }}>
        <div className="absolute -bottom-12 -left-10 h-36 w-36 rounded-full opacity-20 blur-2xl" style={{ background: p.main }} />
        <div className="absolute right-8 top-6 h-px w-24 rotate-45 bg-white/15" />
        <div className="absolute inset-0 flex flex-col justify-center px-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">Contact</p>
          <div className="mt-3">
            <ContactList card={card} chipBg="rgba(255,255,255,0.06)" chipText="#ffffff" textClass="text-white/85" />
          </div>
          <SocialChips card={card} className="mt-3" chipClass="bg-white/10 text-white ring-white/20" />
        </div>
        <BrandMark
          logoUrl={card.logoUrl}
          label={card.name}
          size={48}
          className="absolute bottom-5 right-6"
          textClass="text-sm font-black text-white"
          style={{ clipPath: HEX_CLIP, background: p.main }}
        />
      </CardFace>
    );
  }
  return (
    <CardFace style={{ background: "#101216", ...faceFont(card) }}>
      <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full opacity-25 blur-2xl" style={{ background: p.main }} />
      <div className="absolute left-1/2 top-8 h-px w-24 -rotate-45 bg-white/15" />
      <div className="absolute inset-0 flex items-center gap-4 px-7">
        <BrandMark
          logoUrl={card.logoUrl}
          label={card.name}
          size={80}
          textClass="text-lg font-black text-white"
          style={{ clipPath: HEX_CLIP, background: p.main }}
        />
        <div className="min-w-0">
          <p className={`truncate ${ns(card, "text-base", "text-xl", "text-2xl")} font-bold text-white`}>{card.name || "Ton nom"}</p>
          <p className="truncate text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: p.light }}>
            {card.title || "Ton poste"}
          </p>
          {card.company ? <p className="mt-0.5 truncate text-xs text-white/50">{card.company}</p> : null}
          {card.website ? (
            <p className="mt-1 truncate text-[10px] text-white/40">{card.website.replace(/^https?:\/\//, "")}</p>
          ) : null}
        </div>
      </div>
    </CardFace>
  );
}

// ======== Selector / gallery / flip card =====================================

export const TEMPLATE_LABELS: Record<string, { label: string; description: string }> = {
  halo: {
    label: "Halo",
    description: "Photo cerclée sur fond nuit, pastilles de contact.",
  },
  blob: {
    label: "Blob",
    description: "Forme organique colorée, esprit moderne et doux.",
  },
  vagues: {
    label: "Vagues",
    description: "Courbes fluides et logo diamant, très aérien.",
  },
  spherique: {
    label: "Sphérique",
    description: "Arcs lumineux sur fond noir, style tech.",
  },
  arche: {
    label: "Arche",
    description: "Arche arrondie et demi-cercle de couleur.",
  },
  vortex: {
    label: "Vortex",
    description: "Spirale graphique pleine carte, très affirmé.",
  },
  modernix: {
    label: "Modernix",
    description: "Marine & crème, encoche arrondie, pastilles.",
  },
  prestige: {
    label: "Prestige",
    description: "Noir & or avec vague dorée. Très haut de gamme.",
  },
  fluide: {
    label: "Fluide",
    description: "Diagonales géométriques et vague de couleur.",
  },
  hexagone: {
    label: "Hexagone",
    description: "Badge hexagonal sur fond nuit, accent dynamique.",
  },
};

const TEMPLATE_COMPONENTS: Record<string, (p: TemplateProps) => React.ReactElement> = {
  halo: HaloTemplate,
  blob: BlobTemplate,
  vagues: VaguesTemplate,
  spherique: SpheriqueTemplate,
  arche: ArcheTemplate,
  vortex: VortexTemplate,
  modernix: ModernixTemplate,
  prestige: PrestigeTemplate,
  fluide: FluideTemplate,
  hexagone: HexagoneTemplate,
};

const TEMPLATE_KEYS = Object.keys(TEMPLATE_COMPONENTS);

export function renderTemplate(
  key: string,
  card: TemplateCardData,
  side: Side = "recto"
): React.ReactElement {
  const Comp = TEMPLATE_COMPONENTS[key] ?? TEMPLATE_COMPONENTS.halo;
  return <Comp card={card} side={side} />;
}

interface TemplateGalleryProps {
  card: TemplateCardData;
  active: string;
  onSelect: (key: string) => void;
}

export function TemplateGallery({ card, active, onSelect }: TemplateGalleryProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      {TEMPLATE_KEYS.map((key) => {
        const Comp = TEMPLATE_COMPONENTS[key];
        const isActive = key === active;
        const meta = TEMPLATE_LABELS[key];
        return (
          <button
            type="button"
            key={key}
            onClick={() => onSelect(key)}
            className={`group relative flex flex-col gap-2.5 rounded-2xl border bg-white p-2 text-left transition hover:border-slate-300 hover:shadow-md ${
              isActive ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200"
            }`}
          >
            <div className="pointer-events-none">
              <ScaledPreview>
                <Comp card={card} side="recto" />
              </ScaledPreview>
            </div>
            <div className="flex items-center justify-between px-1 pb-1">
              <div>
                <p className="text-sm font-semibold text-slate-900">{meta?.label ?? key}</p>
                <p className="text-[11px] text-slate-500">{meta?.description}</p>
              </div>
              {isActive ? (
                <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// QR chip position per template (verso) — a few templates have decorations
// in the bottom-right corner that need the chip shifted.
const QR_POS: Record<string, string> = {
  modernix: "bottom-12 right-3",
  halo: "bottom-4 right-3",
};

// FlipCard: shows the recto, click to flip (CSS 3D) and reveal the verso.
// The verso carries a scannable QR chip pointing at the public card URL.
export function FlipCard({
  templateKey,
  card,
  qrUrl,
  className = "",
}: {
  templateKey: string;
  card: TemplateCardData;
  qrUrl?: string;
  className?: string;
}) {
  const [flipped, setFlipped] = useState(false);
  const [origin, setOrigin] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [qrSize, setQrSize] = useState(64);
  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);
  // Scale the QR chip with the card width (mobile cards are much narrower).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setQrSize(Math.max(48, Math.min(72, Math.round(el.clientWidth * 0.16))));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const Comp = TEMPLATE_COMPONENTS[templateKey] ?? TEMPLATE_COMPONENTS.halo;
  const slug = (card as any).slug as string | undefined;
  const fallbackUrl = slug ? `${origin}/c/${slug}` : `${origin}/c/apercu`;
  const qrData = qrUrl || fallbackUrl;
  const qrPos = QR_POS[templateKey] ?? "bottom-3 right-3";
  return (
    <div className={className}>
      <div style={{ perspective: 1400 }} ref={wrapRef}>
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? "Voir le recto" : "Voir le verso"}
          className="relative block w-full cursor-pointer select-none text-left"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <div style={{ backfaceVisibility: "hidden" }}>
            <ScaledPreview>
              <Comp card={card} side="recto" />
            </ScaledPreview>
          </div>
          <div
            className="absolute inset-0"
            aria-hidden={!flipped}
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <ScaledPreview>
              <Comp card={card} side="verso" />
            </ScaledPreview>
            {/* Scannable QR chip */}
            <div className={`absolute ${qrPos} z-10 rounded-lg bg-white p-1 shadow-md ring-1 ring-black/10`}>
              <QrCanvas
                options={{
                  data: qrData,
                  size: qrSize,
                  margin: 0,
                  fgColor: "#0f172a",
                  bgColor: "#ffffff",
                  dotsType: "rounded",
                  cornersSquareType: "extra-rounded",
                  cornersDotType: "dot",
                  errorCorrectionLevel: "M",
                }}
              />
            </div>
          </div>
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-400">
        {flipped ? "Verso" : "Recto"} — clique sur la carte pour la retourner
      </p>
    </div>
  );
}