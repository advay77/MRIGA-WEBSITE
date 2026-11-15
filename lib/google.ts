import { randomBytes } from "crypto";
import { safeNext } from "@/lib/validators";

const STATE_COOKIE = "mriga_google";

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function requestOrigin(request: Request) {
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

export function createGoogleState(nextPath: string) {
  const state = randomBytes(24).toString("base64url");
  const next = safeNext(nextPath);
  return { state, cookie: `${state}.${next}` };
}

export function readGoogleState(cookie: string | undefined, returned: string | null) {
  if (!cookie || !returned) return null;
  const split = cookie.indexOf(".");
  if (split < 1) return null;
  const state = cookie.slice(0, split);
  const next = cookie.slice(split + 1);
  if (state !== returned) return null;
  return safeNext(next);
}

export function googleStateCookie(value: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${STATE_COOKIE}=${encodeURIComponent(value)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600${secure}`;
}

export function clearGoogleStateCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${STATE_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`;
}

export const GOOGLE_STATE_COOKIE = STATE_COOKIE;
