import { PrismaClient } from "@prisma/client";

// One client per server instance. In development, reuse it across hot reloads so the
// Supabase pooler is not flooded with connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "production" ? ["error"] : ["warn", "error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
