import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { mediaSlot } from "@/lib/site-copy";
import { sniff } from "@/lib/uploads";

export const dynamic = "force-dynamic";

// The CDN keeps each photo for a minute and serves the old copy while refreshing, so the
// database sees about one read per photo per minute no matter how many visitors there are.
const CACHE = "public, max-age=60, s-maxage=60, stale-while-revalidate=86400";

function mimeFor(file: string) {
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

async function uploadedStamp(slot: string) {
  try {
    const row = await prisma.mediaAsset.findUnique({ where: { slot }, select: { updatedAt: true } });
    return { ok: true as const, updatedAt: row?.updatedAt ?? null };
  } catch {
    // Database unreachable: still show the built-in photo rather than a broken image.
    console.error("media lookup failed; serving the built-in photo");
    return { ok: false as const, updatedAt: null };
  }
}

export async function GET(request: Request, context: { params: Promise<{ slot: string }> }) {
  const { slot: id } = await context.params;
  const slot = mediaSlot(id);
  if (!slot) return new Response("Not found", { status: 404 });

  const stamp = await uploadedStamp(slot.id);
  const etag = `"${slot.id}-${stamp.updatedAt ? stamp.updatedAt.getTime() : "default"}"`;
  // During an outage, do not let the CDN keep the fallback: the uploaded photo may differ.
  const base = { ETag: etag, "Cache-Control": stamp.ok ? CACHE : "no-store", "X-Content-Type-Options": "nosniff" };
  if (stamp.ok && request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers: base });

  if (stamp.updatedAt) {
    try {
      const asset = await prisma.mediaAsset.findUnique({ where: { slot: slot.id }, select: { mime: true, bytes: true } });
      if (asset) return new Response(Buffer.from(asset.bytes), { headers: { ...base, "Content-Type": asset.mime } });
    } catch {
      console.error("media read failed; serving the built-in photo");
    }
  }
  try {
    const root = path.resolve(process.cwd(), "public");
    const filePath = path.resolve(root, slot.fallback);
    if (slot.fallback.includes("..") || (filePath !== root && !filePath.startsWith(root + path.sep))) {
      return new Response("Not found", { status: 404 });
    }
    const file = await readFile(filePath);
    return new Response(file, { headers: { ...base, "Content-Type": sniff(new Uint8Array(file)) ?? mimeFor(slot.fallback) } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
