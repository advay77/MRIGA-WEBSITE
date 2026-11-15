import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { clearGoogleStateCookie, googleConfigured, googleRedirectUri, GOOGLE_STATE_COOKIE, readGoogleState } from "@/lib/google";

export const dynamic = "force-dynamic";

function fail(request: Request, code: string) {
  const response = Response.redirect(new URL(`/login?error=${code}`, request.url), 303);
  response.headers.append("Set-Cookie", clearGoogleStateCookie());
  return response;
}

export async function GET(request: Request) {
  if (!googleConfigured()) return fail(request, "google_config");
  const url = new URL(request.url);
  const cookie = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${GOOGLE_STATE_COOKIE}=`));
  const stored = cookie ? decodeURIComponent(cookie.slice(GOOGLE_STATE_COOKIE.length + 1)) : undefined;
  const nextPath = readGoogleState(stored, url.searchParams.get("state"));
  if (!nextPath || url.searchParams.get("error")) return fail(request, "google");

  const code = url.searchParams.get("code");
  if (!code) return fail(request, "google");

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: googleRedirectUri(request),
      grant_type: "authorization_code",
    }),
  });
  if (!tokenResponse.ok) return fail(request, "google");
  const token = (await tokenResponse.json()) as { access_token?: string };
  if (!token.access_token) return fail(request, "google");

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!profileResponse.ok) return fail(request, "google");
  const profile = (await profileResponse.json()) as { sub?: string; email?: string; email_verified?: boolean; name?: string };
  const email = profile.email?.trim().toLowerCase();
  if (!profile.sub || !email || profile.email_verified !== true) return fail(request, "google");

  const name = profile.name?.trim() || email.split("@")[0] || "MRIGA Member";
  const existing = await prisma.user.findFirst({
    where: { OR: [{ googleId: profile.sub }, { email }] },
  });
  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: { googleId: existing.googleId || profile.sub, name: existing.name || name },
      })
    : await prisma.user.create({
        data: { email, name, googleId: profile.sub, role: "MEMBER" },
      });

  await createSession(user.id, 7);
  const destination = user.role === "ADMIN" && nextPath === "/" ? "/admin" : nextPath.startsWith("/admin") && user.role !== "ADMIN" ? "/" : nextPath;
  const response = Response.redirect(new URL(destination, request.url), 303);
  response.headers.append("Set-Cookie", clearGoogleStateCookie());
  return response;
}
