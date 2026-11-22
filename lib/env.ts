// Production refuses to boot on placeholder or missing secrets. Values are never logged.
// Skipped while Next is compiling, so a build can finish before the host injects env vars.
const PLACEHOLDER = /replace-with|YOUR-PASSWORD|\[YOUR-PASSWORD\]|change-me/i;

export function assertProductionSecrets() {
  if (process.env.NODE_ENV !== "production") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const missing: string[] = [];
  const auth = process.env.AUTH_SECRET ?? "";
  if (auth.length < 32 || PLACEHOLDER.test(auth)) missing.push("AUTH_SECRET");
  const database = process.env.DATABASE_URL ?? "";
  if (!database.startsWith("postgres") || PLACEHOLDER.test(database)) missing.push("DATABASE_URL");
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  if (adminPassword && (adminPassword.length < 12 || PLACEHOLDER.test(adminPassword))) missing.push("ADMIN_PASSWORD");
  if (missing.length > 0) {
    throw new Error(`Refusing to start. Set a real value for: ${missing.join(", ")}.`);
  }
}
