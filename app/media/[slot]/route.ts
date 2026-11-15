import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { mediaSlot } from "@/lib/site-copy";

export const dynamic = "force-dynamic";

function mimeFor(file: string) {
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

export async function GET(_request: Request, context: { params: Promise<{ slot: string }> }) {
  const { slot: id } = await context.params;
  const slot = mediaSlot(id);
  if (!slot) return new Response("Not found", { status: 404 });
  const asset = await prisma.mediaAsset.findUnique({ where: { slot: slot.id } });
  if (asset) {
    return new Response(Buffer.from(asset.bytes), {
      headers: {
        "Content-Type": asset.mime,
        "Cache-Control": "public, max-age=60",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
  try {
    const file = await readFile(path.join(process.cwd(), "public", slot.fallback));
    return new Response(file, {
      headers: {
        "Content-Type": mimeFor(slot.fallback),
        "Cache-Control": "public, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
