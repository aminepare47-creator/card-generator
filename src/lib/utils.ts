// Slug + token helpers + vCard generation utilities for MyCard.

import type { CardRow } from "@/db/schema";

const ACCENT_MAP: Record<string, string> = {
  à: "a",
  á: "a",
  â: "a",
  ä: "a",
  ã: "a",
  å: "a",
  ç: "c",
  è: "e",
  é: "e",
  ê: "e",
  ë: "e",
  ì: "i",
  í: "i",
  î: "i",
  ï: "i",
  ñ: "n",
  ò: "o",
  ó: "o",
  ô: "o",
  ö: "o",
  õ: "o",
  ù: "u",
  ú: "u",
  û: "u",
  ü: "u",
  ý: "y",
  ÿ: "y",
  œ: "oe",
  æ: "ae",
  ß: "ss",
};

export function slugify(input: string): string {
  if (!input) return "";
  const lower = input.toLowerCase().trim();
  let normalized = "";
  for (const ch of lower) {
    normalized += ACCENT_MAP[ch] ?? ch;
  }
  // Replace any non a-z0-9 with a dash, then collapse repeats, then trim dashes.
  const replaced = normalized.replace(/[^a-z0-9]+/g, "-");
  return replaced.replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function randomBase36(length: number): string {
  // Prefer crypto when available for nicer distribution.
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const bytes = new Uint8Array(length);
    globalThis.crypto.getRandomValues(bytes);
    let out = "";
    for (let i = 0; i < length; i++) {
      out += (bytes[i] ?? 0).toString(36).slice(-1);
    }
    return out;
  }
  let out = "";
  for (let i = 0; i < length; i++) {
    out += Math.floor(Math.random() * 36).toString(36);
  }
  return out;
}

export function generateSlug(name: string): string {
  const base = slugify(name) || "carte";
  const suffix = randomBase36(4);
  return `${base}-${suffix}`;
}

export function generateEditToken(): string {
  // URL-safe, ~22 chars (16 bytes base64url). Strong enough for an MVP secret.
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID().replace(/-/g, "");
  }
  return randomBase36(32);
}

export function isValidEmail(email: string): boolean {
  if (!email) return true; // optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUrl(url: string): boolean {
  if (!url) return true; // optional
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// ---- vCard 3.0 builder -----------------------------------------------------

function escapeVCard(value: string): string {
  // vCard 3.0 escaping: backslash, comma, semicolon and newline.
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export interface CardLike {
  name: string;
  title?: string | null;
  company?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  instagram?: string | null;
}

export function buildVCard(card: CardLike): string {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];
  lines.push(`FN:${escapeVCard(card.name)}`);
  lines.push(`N:${escapeVCard(card.name)};;;`);

  if (card.title) lines.push(`TITLE:${escapeVCard(card.title)}`);
  if (card.company) lines.push(`ORG:${escapeVCard(card.company)}`);

  if (card.phone) {
    lines.push(`TEL;TYPE=CELL:${escapeVCard(card.phone)}`);
  }
  if (card.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${escapeVCard(card.email)}`);
  }
  if (card.website) {
    lines.push(`URL:${escapeVCard(card.website)}`);
  }
  if (card.address) {
    // ADR has 7 fields separated by semicolons; we put everything in the street slot.
    lines.push(
      `ADR;TYPE=WORK:;;${escapeVCard(card.address)};;;;`,
    );
  }
  if (card.linkedin) {
    lines.push(`URL;TYPE=LinkedIn:${escapeVCard(card.linkedin)}`);
  }
  if (card.facebook) {
    lines.push(`URL;TYPE=Facebook:${escapeVCard(card.facebook)}`);
  }
  if (card.instagram) {
    lines.push(`URL;TYPE=Instagram:${escapeVCard(card.instagram)}`);
  }

  lines.push("END:VCARD");
  // CRLF per the spec.
  return lines.join("\r\n");
}

export function downloadVCard(card: CardLike): void {
  if (typeof window === "undefined") return;
  const vcf = buildVCard(card);
  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const filenameBase = slugify(card.name) || "carte";
  a.href = url;
  a.download = `${filenameBase}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Defer revocation so the browser has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadTextFile(
  filename: string,
  content: string,
  mime = "text/plain;charset=utf-8",
): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---- Misc helpers ----------------------------------------------------------

export function safeAbsoluteUrl(maybeUrl: string, baseOrigin: string): string {
  if (!maybeUrl) return "";
  const trimmed = maybeUrl.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${baseOrigin}${trimmed}`;
  return `https://${trimmed}`;
}

export function buildWhatsappUrl(numberRaw: string, message?: string): string {
  const digits = (numberRaw ?? "").replace(/[^\d+]/g, "");
  if (!digits) return "";
  const url = new URL(`https://wa.me/${digits.replace(/^\+/, "")}`);
  if (message) url.searchParams.set("text", message);
  return url.toString();
}

export function buildMailtoUrl(email: string, subject?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  const query = params.toString();
  return `mailto:${email}${query ? `?${query}` : ""}`;
}

export function buildWifiPayload(
  ssid: string,
  password: string,
  security: "WPA" | "WEP" | "nopass",
  hidden = false,
): string {
  // WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;
  const safeSsid = ssid.replace(/([\\";,:])/g, "\\$1");
  const safePassword = password.replace(/([\\";,:])/g, "\\$1");
  let payload = `WIFI:T:${security};S:${safeSsid};`;
  if (security !== "nopass") {
    payload += `P:${safePassword};`;
  }
  if (hidden) {
    payload += `H:true;`;
  }
  payload += ";";
  return payload;
}

export function initials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export function themeTokens(theme: string): {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  ring: string;
  accentSoft: string;
} {
  switch (theme) {
    case "emerald":
      return {
        bg: "bg-emerald-600",
        surface: "bg-emerald-50",
        text: "text-emerald-950",
        muted: "text-emerald-700",
        accent: "text-emerald-600",
        ring: "ring-emerald-500",
        accentSoft: "bg-emerald-100",
      };
    case "rose":
      return {
        bg: "bg-rose-600",
        surface: "bg-rose-50",
        text: "text-rose-950",
        muted: "text-rose-700",
        accent: "text-rose-600",
        ring: "ring-rose-500",
        accentSoft: "bg-rose-100",
      };
    case "amber":
      return {
        bg: "bg-amber-500",
        surface: "bg-amber-50",
        text: "text-amber-950",
        muted: "text-amber-700",
        accent: "text-amber-600",
        ring: "ring-amber-500",
        accentSoft: "bg-amber-100",
      };
    case "sky":
      return {
        bg: "bg-sky-600",
        surface: "bg-sky-50",
        text: "text-sky-950",
        muted: "text-sky-700",
        accent: "text-sky-600",
        ring: "ring-sky-500",
        accentSoft: "bg-sky-100",
      };
    case "violet":
      return {
        bg: "bg-violet-600",
        surface: "bg-violet-50",
        text: "text-violet-950",
        muted: "text-violet-700",
        accent: "text-violet-600",
        ring: "ring-violet-500",
        accentSoft: "bg-violet-100",
      };
    case "indigo":
    default:
      return {
        bg: "bg-indigo-600",
        surface: "bg-indigo-50",
        text: "text-indigo-950",
        muted: "text-indigo-700",
        accent: "text-indigo-600",
        ring: "ring-indigo-500",
        accentSoft: "bg-indigo-100",
      };
  }
}

export function isCardRow(value: unknown): value is CardRow {
  return !!value && typeof value === "object" && "slug" in (value as object);
}
