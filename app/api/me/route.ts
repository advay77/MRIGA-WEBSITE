import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Who is signed in, for the header on otherwise static (CDN-cached) pages.
// Returns only what the header and booking form need; never cached.
export async function GET() {
  const session = await getSession();
  const headers = { "Cache-Control": "private, no-store" };
  if (!session || session.user.role === "ADMIN") return Response.json({ user: null }, { headers });
  const { name, role, email, phone } = session.user;
  return Response.json({ user: { name, role, email, phone } }, { headers });
}
