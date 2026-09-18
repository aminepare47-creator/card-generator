import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Supabase Storage client for user uploads. When the SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY env vars are set, uploads go to a (public) bucket
// and survive redeploys. When they're absent, the app falls back to local
// disk storage so local development keeps working without a Supabase project.

export const STORAGE_BUCKET =
  process.env.SUPABASE_BUCKET?.trim() || "uploads";

const globalForStorage = globalThis as typeof globalThis & {
  __mycardSupabase?: SupabaseClient;
};

export function getSupabaseStorage(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  if (!globalForStorage.__mycardSupabase) {
    globalForStorage.__mycardSupabase = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return globalForStorage.__mycardSupabase;
}