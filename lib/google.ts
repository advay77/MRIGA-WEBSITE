import { createHash, randomBytes } from "crypto";
import { safeNext } from "@/lib/validators";

export const GOOGLE_STATE_COOKIE = "mriga_google";

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

// Prefer a fixed public URL so a forged Host header can never steer the OAuth redirect.
export function requestOrigin(request: Request) {
  const fixed = process.env.SITE_URL?.trim().replace(/\/+$/, "");
  if (fixed) return fixed;
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost?.split(",")[0]?.trim() || url.host;
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto = forwardedProto?.split(",")[0]?.trim() || url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

export function googleRedirectUri(request: Request) {
  return `${requestOrigin(request)}/api/auth/google/callback`;
}

// state guards against CSRF; the PKCE verifier proves the callback belongs to this browser.
export function createGoogleState(nextPath: string) {
  const state = randomBytes(24).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { state, challenge, cookie: `${state}.${verifier}.${safeNext(nextPath)}` };
}

export function readGoogleState(cookie: string | undefined, returned: string | null) {
  if (!cookie || !returned) return null;
  const [state, verifier, ...rest] = cookie.split(".");
  if (!state || !verifier || state !== returned) return null;
  return { verifier, next: safeNext(rest.join(".")) };
}

function stateCookie(value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${GOOGLE_STATE_COOKIE}=${encodeURIComponent(value)}; HttpOnly; SameSite=Lax; Path=/api/auth/google; Max-Age=${maxAge}${secure}`;
}

export function googleStateCookie(value: string) {
  return stateCookie(value, 600);
}

export function clearGoogleStateCookie() {
  return stateCookie("", 0);
}
