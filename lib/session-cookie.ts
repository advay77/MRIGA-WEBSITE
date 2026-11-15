// Shared by lib/auth.ts and proxy.ts. Kept free of Prisma imports so the proxy stays light.
// "__Host-" makes the browser refuse the cookie unless it is Secure, host-only, and Path=/.
export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-mriga_session" : "mriga_session";
