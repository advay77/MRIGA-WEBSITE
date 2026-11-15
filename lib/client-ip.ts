// Works out the visitor's real IP for rate limits and the login log.
//
// Vercel sets x-real-ip to whoever connected to it. With Cloudflare's proxy (orange cloud) in
// front, that is a Cloudflare server, and the visitor is in cf-connecting-ip. That header is
// only trusted when TRUST_CLOUDFLARE=1 AND the connection really came from Cloudflare's
// published ranges, so nobody can fake an IP by calling the *.vercel.app URL directly.

// https://www.cloudflare.com/ips/ — check occasionally; Cloudflare rarely changes these.
const CLOUDFLARE_RANGES = [
  "173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22", "141.101.64.0/18",
  "108.162.192.0/18", "190.93.240.0/20", "188.114.96.0/20", "197.234.240.0/22", "198.41.128.0/17",
  "162.158.0.0/15", "104.16.0.0/13", "104.24.0.0/14", "172.64.0.0/13", "131.0.72.0/22",
  "2400:cb00::/32", "2606:4700::/32", "2803:f800::/32", "2405:b500::/32", "2405:8100::/32",
  "2a06:98c0::/29", "2c0f:f248::/32",
];

function ipv4ToBigInt(ip: string) {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let value = BigInt(0);
  for (const part of parts) {
    const n = Number(part);
    if (!/^\d{1,3}$/.test(part) || n > 255) return null;
    value = (value << BigInt(8)) + BigInt(n);
  }
  return value;
}

function ipv6ToBigInt(ip: string) {
  if (!/^[0-9a-f:]+$/i.test(ip)) return null;
  const halves = ip.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - head.length - tail.length;
  if (missing < 0 || (halves.length === 1 && missing !== 0)) return null;
  const groups = [...head, ...Array(missing).fill("0"), ...tail];
  let value = BigInt(0);
  for (const group of groups) {
    if (group.length > 4) return null;
    value = (value << BigInt(16)) + BigInt(parseInt(group || "0", 16));
  }
  return value;
}

function inRange(ip: string, cidr: string) {
  const [base, bitsText] = cidr.split("/");
  const v6 = base.includes(":");
  if (v6 !== ip.includes(":")) return false;
  const total = v6 ? 128 : 32;
  const toInt = v6 ? ipv6ToBigInt : ipv4ToBigInt;
  const a = toInt(ip);
  const b = toInt(base);
  if (a === null || b === null) return false;
  const shift = BigInt(total - Number(bitsText));
  return a >> shift === b >> shift;
}

export function isCloudflare(ip: string) {
  return CLOUDFLARE_RANGES.some((range) => inRange(ip, range));
}

export function resolveClientIp(get: (name: string) => string | null) {
  // x-real-ip first (Vercel); otherwise the right-most x-forwarded-for entry, which our own
  // proxy appended. The left-most entry is whatever the client chose to send.
  const peer = get("x-real-ip")?.trim()
    || get("x-forwarded-for")?.split(",").map((part) => part.trim()).filter(Boolean).pop()
    || "";
  if (process.env.TRUST_CLOUDFLARE === "1" && peer && isCloudflare(peer)) {
    const visitor = get("cf-connecting-ip")?.trim();
    if (visitor) return visitor.slice(0, 64);
  }
  return (peer || "local").slice(0, 64);
}
