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

// cache() dedupes the lookup within one request, so a layout and a page share one query.
export const getSession = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length < 20 || token.length > 128) return null;
  let session;
  try {
    session = await prisma.session.findUnique({
      where: { tokenHash: tokenHash(token) },
      select: { id: true, expiresAt: true, user: { select: sessionUser } },
    });
  } catch {
    // Database unreachable: treat as signed out so public pages still render.
    console.error("session lookup failed");
    return null;
  }
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  return session;
});

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
