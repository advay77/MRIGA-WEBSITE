// Cloudflare Turnstile: server-side check of the token the widget puts in the form.
// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
//
// Off until both keys are set (NEXT_PUBLIC_TURNSTILE_SITE_KEY + TURNSTILE_SECRET_KEY).
// Once on, every login, signup and lead form must carry a valid, unused token.

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
export const TURNSTILE_FIELD = "cf-turnstile-response";

let warned = false;

export function turnstileEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstile(token: string, ip: string) {
  if (!turnstileEnabled()) {
    if (process.env.NODE_ENV === "production" && !warned) {
      warned = true;
      console.error("Turnstile keys are not set: logins and forms are not bot-protected.");
    }
    return true;
  }
  if (!token || token.length > 2048) return false;
  const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY || "", response: token });
  if (ip && ip !== "local") body.set("remoteip", ip);
  try {
    const response = await fetch(VERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(8_000) });
    if (!response.ok) return false;
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    // Cloudflare unreachable: refuse rather than let unverified traffic through.
    console.error("turnstile verification failed to reach Cloudflare");
    return false;
  }
}
