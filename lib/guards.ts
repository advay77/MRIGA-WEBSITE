import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export async function clientIp() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (forwarded || headerList.get("x-real-ip") || "local").slice(0, 64);
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
  const forwarded = headerList.get("x-forwarded-host");
  return originHost === host || originHost === forwarded;
}

export async function rateLimit(action: string, limit: number, windowMs: number) {
  const key = `${await clientIp()}:${action}`;
  const now = new Date();
  const row = await prisma.rateLimit.findUnique({ where: { key } });
  if (!row || row.resetAt < now) {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, resetAt: new Date(now.getTime() + windowMs) },
      update: { count: 1, resetAt: new Date(now.getTime() + windowMs) },
    });
    return true;
  }
  if (row.count >= limit) return false;
  await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return true;
}
