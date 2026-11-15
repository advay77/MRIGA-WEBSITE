import { recordLogin } from "@/lib/audit";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { clearGoogleStateCookie, googleConfigured, googleRedirectUri, GOOGLE_STATE_COOKIE, readGoogleState } from "@/lib/google";
import { rateLimit } from "@/lib/guards";

export const dynamic = "force-dynamic";

function go(request: Request, path: string) {
  const response = Response.redirect(new URL(path, request.url), 303);
  response.headers.append("Set-Cookie", clearGoogleStateCookie());
  return response;
}

function fail(request: Request, code: string) {
  return go(request, `/login?error=${code}`);
}

function readCookie(request: Request, name: string) {
  const part = request.headers.get("cookie")?.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
  if (!part) return undefined;
  try {
    return decodeURIComponent(part.slice(name.length + 1));
  } catch {
    return undefined;
  }
}

export async function GET(request: Request) {
  if (!(await rateLimit("google", 20, 60 * 60 * 1000))) return fail(request, "google");
  if (!googleConfigured()) return fail(request, "google_config");
  const url = new URL(request.url);
  const saved = readGoogleState(readCookie(request, GOOGLE_STATE_COOKIE), url.searchParams.get("state"));
  const code = url.searchParams.get("code");
  if (!saved || !code || url.searchParams.get("error")) return fail(request, "google");

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: googleRedirectUri(request),
        grant_type: "authorization_code",
        code_verifier: saved.verifier,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!tokenResponse.ok) return fail(request, "google");
    const token = (await tokenResponse.json()) as { access_token?: string };
    if (!token.access_token) return fail(request, "google");

    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!profileResponse.ok) return fail(request, "google");
    const profile = (await profileResponse.json()) as { sub?: string; email?: string; email_verified?: boolean; name?: string };
    const email = profile.email?.trim().toLowerCase();
    if (!profile.sub || !email || profile.email_verified !== true) return fail(request, "google");

    const name = (profile.name?.trim() || email.split("@")[0] || "MRIGA Member").slice(0, 80);
    const existing = await prisma.user.findFirst({ where: { OR: [{ googleId: profile.sub }, { email }] } });
    // Admin and password accounts are never linked to Google. Same message for both, so the
    // response does not reveal which email belongs to the admin.
    if (existing && (existing.role === "ADMIN" || (existing.googleId !== profile.sub && (existing.passwordHash || existing.googleId)))) {
      await recordLogin({ userId: null, role: existing.role === "ADMIN" ? "MEMBER" : existing.role, method: "google", success: false, identifier: email });
      return fail(request, "google_password");
    }
    const user = existing
      ? await prisma.user.update({ where: { id: existing.id }, data: { googleId: profile.sub } })
      : await prisma.user.create({ data: { email, name, googleId: profile.sub, role: "MEMBER" } });
    await createSession(user.id, 7);
    await recordLogin({ userId: user.id, role: user.role, method: existing ? "google" : "signup", success: true, identifier: email });
    const next = saved.next.startsWith("/admin") ? "/" : saved.next;
    return go(request, user.role === "RETAILER" && next === "/" ? "/retailer" : next);
  } catch {
    console.error("google sign-in failed");
    return fail(request, "google");
  }
}
