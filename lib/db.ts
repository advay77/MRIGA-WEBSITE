import { PrismaClient } from "@prisma/client";
import { assertProductionSecrets } from "@/lib/env";

assertProductionSecrets();

// One client per server instance. In development, reuse it across hot reloads so the
// Supabase pooler is not flooded with connections. Production logs errors only, with no
// query text, so a failure cannot print a row or a connection string.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const production = process.env.NODE_ENV === "production";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    errorFormat: production ? "minimal" : "colorless",
    log: production ? ["error"] : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
