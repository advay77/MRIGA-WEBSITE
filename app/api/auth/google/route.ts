import { createGoogleState, googleConfigured, googleRedirectUri, googleStateCookie } from "@/lib/google";
import { safeNext } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!googleConfigured()) {
    return Response.redirect(new URL("/login?error=google_config", request.url), 303);
  }
  const nextPath = safeNext(new URL(request.url).searchParams.get("next"));
  const { state, cookie } = createGoogleState(nextPath);
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID || "");
  url.searchParams.set("redirect_uri", googleRedirectUri(request));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");
  const response = Response.redirect(url, 303);
  response.headers.append("Set-Cookie", googleStateCookie(cookie));
  return response;
}
