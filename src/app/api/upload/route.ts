import { NextResponse } from "next/server";
import {
  ALLOWED_EXT,
  ALLOWED_MIME,
  MAX_UPLOAD_BYTES,
  detectFormat,
  extFromMime,
  extFromName,
  saveUpload,
} from "@/lib/uploads";
import { getClientIp, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// 20 uploads per IP per 10 minutes — generous for legit use, brutal for spam.
const UPLOAD_LIMIT = { windowMs: 10 * 60 * 1000, max: 20 };

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`upload:${ip}`, UPLOAD_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Trop d'envois. Réessaie dans quelques minutes." },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Format de requête invalide (multipart attendu)." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Aucun fichier reçu." },
      { status: 400 },
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Fichier vide." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "L'image fait plus de 6 Mo. Réduis-la et réessaie." },
      { status: 413 },
    );
  }

  // Reject anything that claims to be SVG: SVG can carry inline JavaScript.
  const mime = (file.type || "application/octet-stream").toLowerCase();
  if (mime === "image/svg+xml") {
    return NextResponse.json(
      {
        error:
          "Le format SVG n'est pas autorisé (sécurité). Convertis ton image en PNG ou JPG avant de l'envoyer.",
      },
      { status: 415 },
    );
  }

  if (!ALLOWED_MIME.has(mime)) {
    return NextResponse.json(
      {
        error:
          "Type de fichier non autorisé. Formats acceptés : JPG, PNG, WEBP, GIF.",
      },
      { status: 415 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Verify the file actually matches what it claims to be (magic bytes).
  // This blocks renamed .exe → .png and similar.
  const detected = detectFormat(buffer);
  if (!detected) {
    return NextResponse.json(
      { error: "Le contenu du fichier ne correspond pas à une image valide." },
      { status: 415 },
    );
  }
  // Cross-check the detected format with the declared one.
  if (detected.mime !== mime && !(mime === "image/jpeg" && detected.ext === "jpg")) {
    return NextResponse.json(
      { error: "Le type déclaré ne correspond pas au contenu réel du fichier." },
      { status: 415 },
    );
  }

  // Use the *detected* extension, not the user's, so a `evil.jpg` containing
  // PNG bytes becomes a `.png` on disk (and the served URL stays consistent).
  let ext = detected.ext;
  if (!ext) ext = extFromMime(mime);
  if (!ext || !ALLOWED_EXT.has(ext)) {
    return NextResponse.json(
      { error: "Extension de fichier non supportée." },
      { status: 415 },
    );
  }

  let saved: { filename: string; finalExt: string; mime: string; size: number };
  try {
    saved = await saveUpload(buffer, ext);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Impossible d'enregistrer le fichier." },
      { status: 500 },
    );
  }

  const origin =
    request.headers.get("origin") ||
    `${request.headers.get("x-forwarded-proto") || "http"}://${request.headers.get("host") || "localhost"}`;

  const url = `${origin}/api/uploads/${saved.filename}`;
  return NextResponse.json(
    {
      url,
      path: `/api/uploads/${saved.filename}`,
      filename: saved.filename,
      size: saved.size,
      mime: saved.mime,
    },
    { headers: rateLimitHeaders(limit) },
  );
}
