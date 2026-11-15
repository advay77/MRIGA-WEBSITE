import { headers } from "next/headers";
import { resolveClientIp } from "@/lib/client-ip";
import { prisma } from "@/lib/db";

const DAY_MS = 24 * 60 * 60 * 1000;
const PAGE_VIEW_RETENTION_DAYS = 180;
const LOGIN_HISTORY_RETENTION_DAYS = 365;

export async function clientIp() {
  const headerList = await headers();
  return resolveClientIp((name) => headerList.get(name));
}

export async function sameOrigin() {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const host = headerList.get("host");
  const forwarded = headerList.get("x-forwarded-host")?.split(",")[0]?.trim();
  return originHost === host || originHost === forwarded;
}

// Occasional housekeeping so the limiter, session, and analytics tables stay bounded.
function sweep(now: Date) {
  if (Math.random() >= 0.01) return;
  const viewsBefore = new Date(now.getTime() - PAGE_VIEW_RETENTION_DAYS * DAY_MS);
  Promise.all([
    prisma.rateLimit.deleteMany({ where: { resetAt: { lt: now } } }),
    prisma.session.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.pageView.deleteMany({ where: { createdAt: { lt: viewsBefore } } }),
    prisma.loginEvent.deleteMany({ where: { createdAt: { lt: new Date(now.getTime() - LOGIN_HISTORY_RETENTION_DAYS * DAY_MS) } } }),
  ]).catch(() => undefined);
}

// Fixed-window counter. Returns true while the key is under its limit.
// One atomic upsert per call, so concurrent requests cannot both slip past the limit.
export async function hit(key: string, limit: number, windowMs: number) {
  const now = new Date();
  sweep(now);
  const id = key.slice(0, 190);
  const resetAt = new Date(now.getTime() + windowMs);
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const row = await prisma.rateLimit.upsert({
        where: { key: id },
        create: { key: id, count: 1, resetAt },
        update: { count: { increment: 1 } },
      });
      if (row.resetAt < now) {
        await prisma.rateLimit.update({ where: { key: id }, data: { count: 1, resetAt } });
        return true;
      }
      return row.count <= limit;
    } catch {
      // Two first-hits on the same key can race on insert; the retry takes the update path.
    }
  }
  return false;
}

export async function rateLimit(action: string, limit: number, windowMs: number) {
  return hit(`ip:${await clientIp()}:${action}`, limit, windowMs);
}

export async function clearLimit(key: string) {
  await prisma.rateLimit.deleteMany({ where: { key: key.slice(0, 190) } }).catch(() => undefined);
}
