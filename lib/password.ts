import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const stretch = promisify(scrypt);
let dummyHash: Promise<string> | null = null;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await stretch(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const actual = (await stretch(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function dummyPasswordHash() {
  dummyHash ??= hashPassword("mriga-dummy-passkey-not-used");
  return dummyHash;
}
