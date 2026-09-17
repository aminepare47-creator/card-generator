import { NextResponse } from "next/server";
import { mimeForFilename, readUpload } from "@/lib/uploads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ file: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { file } = await context.params;
  const buf = await readUpload(file);
  if (!buf) {
    return NextResponse.json({ error: "Fichier introuvable." }, { status: 404 });
  }
  const mime = mimeForFilename(file);
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "content-type": mime,
      "content-length": String(buf.length),
      "cache-control": "public, max-age=3600",
    },
  });
}
