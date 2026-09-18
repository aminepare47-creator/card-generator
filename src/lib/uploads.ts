// Storage for user uploads. Images are re-encoded through sharp and then
// written to Supabase Storage when SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are
// set — that's the production path, because it survives redeploys. Without
// those two variables we fall back to a local folder (`.data/uploads` by
// default, or UPLOAD_DIR), which is handy for development.
// Files are served by the `/api/uploads/[file]` route handler: Next.js
// production builds don't pick up files added to `public/` after the build, so
// serving them through a route is the most portable approach.

import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { STORAGE_BUCKET, getSupabaseStorage } from "@/lib/storage";

export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024; // 6 MB

// We resize uploaded photos so they're never larger than this on the longest
// side. 1280px is plenty for an avatar/QR logo, keeps the card page snappy,
// and slashes storage + bandwidth.
export const MAX_DIMENSION = 1280;
// Output quality for the converted image.
export const WEBP_QUALITY = 82;

// NOTE: SVG is intentionally NOT allowed: it can carry inline JavaScript
// (onclick, <script>, etc.) and would be a stored-XSS vector on the public
// card page. We rewrite SVGs to PNG/JPG if we ever need to accept them later.
export const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

// Magic-number signatures for the formats we accept. We verify the first few
// bytes match the claimed MIME / extension so a renamed `.exe` doesn't slip
// through.
const SIGNATURES: Array<{ ext: string; mime: string; bytes: number[] }> = [
  { ext: "jpg", mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { ext: "png", mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { ext: "gif", mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { ext: "webp", mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] },
];

export function getUploadDir(): string {
  const base =
    process.env.UPLOAD_DIR && process.env.UPLOAD_DIR.trim().length > 0
      ? process.env.UPLOAD_DIR
      : path.join(process.cwd(), ".data", "uploads");
  return base;
}

export async function ensureUploadDir(): Promise<string> {
  const dir = getUploadDir();
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export function extFromMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "";
  }
}

export function extFromName(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot < 0) return "";
  return name.slice(dot + 1).toLowerCase();
}

export function detectFormat(buffer: Buffer): { ext: string; mime: string } | null {
  for (const sig of SIGNATURES) {
    if (buffer.length < sig.bytes.length) continue;
    let ok = true;
    for (let i = 0; i < sig.bytes.length; i++) {
      if (buffer[i] !== sig.bytes[i]) {
        ok = false;
        break;
      }
    }
    if (ok) return { ext: sig.ext, mime: sig.mime };
  }
  return null;
}

export async function saveUpload(
  buffer: Buffer,
  ext: string,
): Promise<{ filename: string; finalExt: string; mime: string; size: number }> {
  const id = crypto.randomBytes(12).toString("hex");

  // Re-encode + resize through sharp. This strips EXIF metadata, normalises
  // orientation, and produces a single output format we control. Animated GIFs
  // and SVGs aren't re-encoded (we already reject SVG upstream).
  const isAnimatedGif = ext === "gif" && isGifAnimated(buffer);

  let outBuffer: Buffer;
  let finalExt: string;
  let mime: string;

  if (isAnimatedGif) {
    // Keep animated GIFs as-is — sharp can't preserve animation when re-encoding
    // to a different format.
    outBuffer = buffer;
    finalExt = "gif";
    mime = "image/gif";
  } else {
    const pipeline = sharp(buffer, { failOn: "none" })
      .rotate() // honour EXIF orientation
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      });

    if (ext === "png") {
      // Keep transparency for PNGs.
      outBuffer = await pipeline.png({ compressionLevel: 9 }).toBuffer();
      finalExt = "png";
      mime = "image/png";
    } else {
      // Convert everything else (jpg, webp, non-animated gif) to WebP — best
      // size/quality tradeoff for raster photos.
      outBuffer = await pipeline
        .webp({ quality: WEBP_QUALITY, effort: 4 })
        .toBuffer();
      finalExt = "webp";
      mime = "image/webp";
    }
  }

  const filename = `${Date.now().toString(36)}-${id}.${finalExt}`;

  // Preferred path: Supabase Storage (persistent across redeploys, free tier).
  const supabase = getSupabaseStorage();
  if (supabase) {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filename, outBuffer, {
        contentType: mime,
        upsert: true,
        cacheControl: "3600",
      });
    if (error) {
      throw new Error(`Échec de l'envoi vers le stockage : ${error.message}`);
    }
    return { filename, finalExt, mime, size: outBuffer.length };
  }

  // Fallback (local dev without Supabase): write to the on-disk folder.
  const dir = await ensureUploadDir();
  const targetPath = path.join(dir, filename);
  const resolved = path.resolve(targetPath);
  if (!resolved.startsWith(path.resolve(dir) + path.sep)) {
    throw new Error("Invalid filename");
  }
  await fs.writeFile(resolved, outBuffer);
  return { filename, finalExt, mime, size: outBuffer.length };
}

function isGifAnimated(buffer: Buffer): boolean {
  // GIF animation: multiple image descriptor blocks (0x2C). Quick scan for
  // several 0x2C bytes in the body.
  const scan = buffer.subarray(0, Math.min(buffer.length, 4096));
  let count = 0;
  for (let i = 0; i < scan.length; i++) {
    if (scan[i] === 0x2c) count++;
    if (count > 1) return true;
  }
  return false;
}

export async function readUpload(filename: string): Promise<Buffer | null> {
  // Defense-in-depth: reject any path traversal.
  if (
    !filename ||
    filename.includes("/") ||
    filename.includes("\\") ||
    filename.includes("..")
  ) {
    return null;
  }
  if (!/^[A-Za-z0-9._-]+$/.test(filename)) return null;

  // Preferred path: Supabase Storage.
  const supabase = getSupabaseStorage();
  if (supabase) {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(filename);
    if (error || !data) return null;
    return Buffer.from(await data.arrayBuffer());
  }

  // Fallback (local dev): read from the on-disk folder.
  const dir = getUploadDir();
  const target = path.join(dir, filename);
  const resolved = path.resolve(target);
  if (!resolved.startsWith(path.resolve(dir) + path.sep)) return null;
  try {
    return await fs.readFile(resolved);
  } catch {
    return null;
  }
}

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export function mimeForFilename(filename: string): string {
  const ext = extFromName(filename);
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}
