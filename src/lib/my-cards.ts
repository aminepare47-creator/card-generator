// Lightweight client-side registry of cards created/edited from this browser.
// We don't use IndexedDB or localStorage because cookies are simpler, get
// sent to the server if needed, and respect server-side rendering.

import { cookies } from "next/headers";

const COOKIE_NAME = "cp_my_cards";
const MAX_ENTRIES = 30;

export interface MyCardEntry {
  slug: string;
  token: string;
  name: string;
  title: string;
  savedAt: number; // epoch ms
}

function parse(raw: string | undefined): MyCardEntry[] {
  if (!raw) return [];
  try {
    const decoded = JSON.parse(
      Buffer.from(raw, "base64").toString("utf-8"),
    ) as MyCardEntry[];
    if (!Array.isArray(decoded)) return [];
    return decoded
      .filter(
        (e): e is MyCardEntry =>
          !!e &&
          typeof e.slug === "string" &&
          typeof e.token === "string" &&
          /^[a-z0-9-]{1,80}$/.test(e.slug),
      )
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

function serialize(entries: MyCardEntry[]): string {
  return Buffer.from(JSON.stringify(entries)).toString("base64");
}

export async function readMyCardsFromCookies(): Promise<MyCardEntry[]> {
  try {
    const store = await cookies();
    const raw = store.get(COOKIE_NAME)?.value;
    return parse(raw);
  } catch {
    return [];
  }
}

export function writeMyCardsCookie(entries: MyCardEntry[]): string {
  return `${COOKIE_NAME}=${serialize(entries)}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}
