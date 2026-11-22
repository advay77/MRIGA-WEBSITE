import { randomBytes, scrypt, timingSafeEqual } from "crypto";

// OWASP-aligned scrypt cost. Older hashes omit the cost and used Node's default (N=16384).
const COST = 32768;
const MAX_MEM = 64 * 1024 * 1024;
let dummyHash: Promise<string> | null = null;

function digest(password: string, salt: string, cost: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, { N: cost, r: 8, p: 1, maxmem: MAX_MEM }, (error, key) => {
      if (error || !key) reject(error ?? new Error("scrypt failed"));
      else resolve(key as Buffer);
    });
  });
}

function same(actual: Buffer, hex: string) {
  const expected = Buffer.from(hex, "hex");
  if (expected.length === 0 || actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = await digest(password, salt, COST);
  return `scrypt$${COST}$${salt}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  if (stored.startsWith("scrypt$")) {
    const [, costText, salt, hash] = stored.split("$");
    const cost = Number(costText);
    if (!salt || !hash || !Number.isInteger(cost) || cost < 16384 || cost > 262144) return false;
    return same(await digest(password, salt, cost), hash);
  }
  const [salt, hash] = stored.split(":");
  if (!salt || !hash || salt.length > 64 || hash.length > 256) return false;
  return same(await digest(password, salt, 16384), hash);
}

export function dummyPasswordHash() {
  dummyHash ??= hashPassword("mriga-dummy-passkey-not-used");
  return dummyHash;
}
