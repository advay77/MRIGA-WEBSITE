import { getSession, renewSession } from "@/lib/auth";
import { rateLimit, sameOrigin } from "@/lib/guards";

export const dynamic = "force-dynamic";

// Who is signed in, for the header on otherwise static (CDN-cached) pages.
// Returns only what the header and booking form need; never cached.
export async function GET() {
  const headers = { "Cache-Control": "private, no-store" };
  if (!(await sameOrigin())) return Response.json({ user: null }, { status: 403, headers });
  if (!(await rateLimit("me", 300, 60 * 1000))) return Response.json({ error: "unavailable" }, { status: 429, headers });
  // Also keeps an active customer signed in: renews the 30-day session while they visit.
  // A database blip answers 503, and the header keeps showing whoever was signed in.
  if ((await renewSession()) === "error") return Response.json({ error: "unavailable" }, { status: 503, headers });
  const session = await getSession();
  if (!session || session.user.role === "ADMIN") return Response.json({ user: null }, { headers });
  const { name, role, email, phone } = session.user;
  return Response.json({ user: { name, role, email, phone } }, { headers });
}
