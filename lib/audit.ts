import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { clientIp } from "@/lib/guards";

type LoginRecord = {
  userId: string | null;
  role: string;
  method: "password" | "google" | "signup";
  success: boolean;
  identifier: string;
};

// Never throws: a logging failure must not block someone from signing in.
export async function recordLogin(entry: LoginRecord) {
  try {
    const [ip, headerList] = await Promise.all([clientIp(), headers()]);
    const userAgent = headerList.get("user-agent")?.slice(0, 300) || null;
    await prisma.$transaction([
      prisma.loginEvent.create({
        data: { ...entry, identifier: entry.identifier.slice(0, 120), ip: ip === "local" ? null : ip, userAgent },
      }),
      ...(entry.success && entry.userId
        ? [prisma.user.update({ where: { id: entry.userId }, data: { lastLoginAt: new Date() } })]
        : []),
    ]);
  } catch {
    console.error("login event could not be recorded");
  }
}

// Short, readable device label for the admin table, e.g. "Chrome · Android".
export function deviceLabel(userAgent: string | null) {
  if (!userAgent) return "—";
  const browser = /Edg\//.test(userAgent) ? "Edge"
    : /OPR\//.test(userAgent) ? "Opera"
    : /SamsungBrowser/.test(userAgent) ? "Samsung Internet"
    : /Chrome\//.test(userAgent) ? "Chrome"
    : /Firefox\//.test(userAgent) ? "Firefox"
    : /Safari\//.test(userAgent) ? "Safari"
    : "Browser";
  const os = /Android/.test(userAgent) ? "Android"
    : /iPhone|iPad/.test(userAgent) ? "iOS"
    : /Windows/.test(userAgent) ? "Windows"
    : /Mac OS X/.test(userAgent) ? "macOS"
    : /Linux/.test(userAgent) ? "Linux"
    : "Other";
  return `${browser} · ${os}`;
}
