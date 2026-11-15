import { PrismaClient } from "@prisma/client";

if (process.env.NODE_ENV === "production" && (process.env.DATABASE_URL || "").startsWith("file:")) {
  throw new Error("Production needs a Postgres DATABASE_URL. A local SQLite file does not stay online or serve many visitors.");
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
