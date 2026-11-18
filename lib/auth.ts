import { createHmac, randomBytes } from "crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { SESSION_COOKIE } from "@/lib/session-cookie";

const DAY_MS = 24 * 60 * 60 * 1000;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be at least 32 characters.");
    return "dev-only-change-me-not-for-production";
  }
  return value;
}

function tokenHash(token: string) {
  return createHmac("sha256", secret()).update(token).digest("hex");
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

// Never select passwordHash or googleId into a session: callers only need who and what role.
const sessionUser = { id: true, name: true, email: true, phone: true, role: true } as const;

// Customers and retailers stay signed in for 30 days, renewed while they keep visiting
// (see renewSession). The desk's sessions are short and never renewed.
export const CUSTOMER_SESSION_DAYS = 30;
const RENEW_BELOW_MS = 20 * DAY_MS;

function findSession(token: string) {
  return prisma.session.findUnique({
    where: { tokenHash: tokenHash(token) },
    select: { id: true, expiresAt: true, createdAt: true, user: { select: sessionUser } },
  });
}

type Lookup =
  | { status: "ok"; session: NonNullable<Awaited<ReturnType<typeof findSession>>>; token: string }
  | { status: "none" }
  | { status: "error" };

// cache() dedupes the lookup within one request, so a layout and a page share one query.
// A database blip is retried once and reported as "error", never as "signed out": treating it
// as signed out is what made people look logged out at random.
const lookupSession = cache(async (): Promise<Lookup> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length < 20 || token.length > 128) return { status: "none" };
  let session: Awaited<ReturnType<typeof findSession>> = null;
  try {
    session = await findSession(token);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 300));
    try {
      session = await findSession(token);
    } catch {
      console.error("session lookup failed twice");
      return { status: "error" };
    }
  }
  if (!session) return { status: "none" };
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return { status: "none" };
  }
  return { status: "ok", session, token };
});

// The signed-in session, or null. Public pages use this: an outage just renders them signed out.
export async function getSession() {
  const lookup = await lookupSession();
  return lookup.status === "ok" ? lookup.session : null;
}

// Like getSession, but throws when the database could not be reached, so private pages show
// "try again" instead of sending a signed-in person to the login page.
export async function requireSessionLookup() {
  const lookup = await lookupSession();
  if (lookup.status === "error") throw new Error("Session lookup is temporarily unavailable.");
  return lookup.status === "ok" ? lookup.session : null;
}

// Sliding expiry for customers and retailers: once less than 20 of the 30 days are left, push the
// expiry back to 30 days. Only callable where cookies can be written (route handlers, actions).
// Returns "ok", "none" (signed out) or "error" (database unreachable; keep the current state).
export async function renewSession() {
  const lookup = await lookupSession();
  if (lookup.status !== "ok") return lookup.status;
  const { session, token } = lookup;
  // "Remember this device" off gives a one-day session; those are never stretched.
  const remembered = session.expiresAt.getTime() - session.createdAt.getTime() > 2 * DAY_MS;
  if (session.user.role === "ADMIN" || !remembered || session.expiresAt.getTime() - Date.now() > RENEW_BELOW_MS) return "ok";
  const expiresAt = new Date(Date.now() + CUSTOMER_SESSION_DAYS * DAY_MS);
  try {
    await prisma.session.update({ where: { id: session.id }, data: { expiresAt } });
    (await cookies()).set(SESSION_COOKIE, token, cookieOptions(CUSTOMER_SESSION_DAYS * 24 * 60 * 60));
  } catch {
    console.error("session renewal failed");
  }
  return "ok";
}

export async function createSession(userId: string, days: number) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + days * DAY_MS);
  await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId, expiresAt: { lt: new Date() } } }),
    prisma.session.create({ data: { tokenHash: tokenHash(token), userId, expiresAt } }),
  ]);
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(Math.round(days * 24 * 60 * 60)));
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: tokenHash(token) } });
  }
  jar.set(SESSION_COOKIE, "", cookieOptions(0));
}

let adminReady: Promise<void> | null = null;

// Creates the desk account from ADMIN_EMAIL / ADMIN_PASSWORD the first time an admin page loads.
// Runs once per server process instead of on every request.
export function ensureAdmin() {
  adminReady ??= createAdminIfMissing().catch((error) => {
    adminReady = null;
    console.error("admin bootstrap failed", error instanceof Error ? error.message : "");
  });
  return adminReady;
}

async function createAdminIfMissing() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  if (password.length < 12) {
    console.error("ADMIN_PASSWORD must be at least 12 characters. The admin account was not created.");
    return;
  }
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return;
  await prisma.user.create({
    data: { email, name: "MRIGA Admin", passwordHash: await hashPassword(password), role: "ADMIN" },
  });
}
