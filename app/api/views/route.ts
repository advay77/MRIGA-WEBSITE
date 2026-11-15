import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit, sameOrigin } from "@/lib/guards";

export const dynamic = "force-dynamic";

const PUBLIC_PATHS = new Set(["/", "/about", "/dealers", "/collection", "/contact", "/mira", "/riva", "/vira", "/login", "/retailer"]);

async function readBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > 400) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(raw) as { path?: unknown; kind?: unknown; seconds?: unknown };
}

export async function POST(request: Request) {
  if (!(await sameOrigin())) return new Response(null, { status: 403 });
  let path = "";
  let kind: "view" | "time" | "click" = "view";
  let seconds = 0;
  try {
    const body = await readBody(request);
    if (!body) return new Response(null, { status: 204 });
    path = typeof body.path === "string" ? body.path : "";
    if (body.kind === "time" || body.kind === "click") kind = body.kind;
    if (kind === "time") {
      const value = Number(body.seconds);
      if (!Number.isFinite(value) || value < 1 || value > 120) return new Response(null, { status: 204 });
      seconds = Math.round(value);
    }
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!PUBLIC_PATHS.has(path)) return new Response(null, { status: 204 });
  const lane = kind === "time" ? "view-time" : kind === "click" ? "view-click" : "view";
  const limit = kind === "time" ? 800 : kind === "click" ? 300 : 120;
  if (!(await rateLimit(lane, limit, 60 * 60 * 1000))) return new Response(null, { status: 204 });
  const session = await getSession();
  if (session?.user.role === "ADMIN") return new Response(null, { status: 204 });
  const tracked = session && (session.user.role === "MEMBER" || session.user.role === "RETAILER") ? session.user.id : null;
  if ((kind === "time" || kind === "click") && !tracked) return new Response(null, { status: 204 });
  await prisma.pageView.create({ data: { path, kind, seconds, userId: tracked } });
  return new Response(null, { status: 204 });
}
