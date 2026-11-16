"use server";

import { randomInt } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { recordLogin } from "@/lib/audit";
import { createSession, clearSession, getSession } from "@/lib/auth";
import { dummyPasswordHash, hashPassword, verifyPassword } from "@/lib/password";
import { clearLimit, clientIp, hit, rateLimit, sameOrigin } from "@/lib/guards";
import { TURNSTILE_FIELD, verifyTurnstile } from "@/lib/turnstile";
import { dealerSchema, firstIssue, normalizePhone, rideSchema, safeNext, signInSchema, signUpSchema } from "@/lib/validators";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const UNAVAILABLE = "The atelier desk is briefly unavailable. Please try again.";
const NO_MATCH = "Those details do not match an account.";
const TOO_MANY = "Too many attempts. Please wait a few minutes.";
const NOT_HUMAN = "The security check did not complete. Please wait a moment and try again.";

type Desk = "admin" | "retailer" | "member";
const ROLE_FOR: Record<Desk, "ADMIN" | "RETAILER" | "MEMBER"> = { admin: "ADMIN", retailer: "RETAILER", member: "MEMBER" };

function text(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

function deskOf(value: string): Desk {
  return value === "admin" || value === "retailer" ? value : "member";
}

// Every public form and login: same-origin check, then the rate limit (cheap, local), then
// Cloudflare Turnstile (a network call), so floods are stopped before they reach Cloudflare.
async function guard(form: FormData, action: string, limit: number, windowMs: number) {
  if (!(await sameOrigin())) return "Invalid request.";
  try {
    if (!(await rateLimit(action, limit, windowMs))) return TOO_MANY;
  } catch {
    return UNAVAILABLE;
  }
  if (!(await verifyTurnstile(text(form, TURNSTILE_FIELD), await clientIp()))) return NOT_HUMAN;
  return null;
}

function identity(value: string) {
  if (value.includes("@")) return { email: value.trim().toLowerCase(), phone: null };
  return { email: null, phone: normalizePhone(value) };
}

function findByIdentity(who: ReturnType<typeof identity>) {
  return who.email
    ? prisma.user.findUnique({ where: { email: who.email } })
    : prisma.user.findUnique({ where: { phone: who.phone || "" } });
}

export async function reserveTestRide(form: FormData) {
  const blocked = await guard(form, "ride", 5, HOUR);
  if (blocked) return { ok: false as const, error: blocked };
  const parsed = rideSchema.safeParse({
    name: text(form, "name"),
    phone: text(form, "phone"),
    city: text(form, "city"),
    model: text(form, "model"),
    date: text(form, "date"),
    website: text(form, "website"),
  });
  if (!parsed.success) return { ok: false as const, error: firstIssue(parsed.error) };
  if (parsed.data.website) return { ok: false as const, error: "Unable to submit this form." };
  try {
    await prisma.testRide.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        city: parsed.data.city,
        model: parsed.data.model,
        date: parsed.data.date || null,
        userId: await signedInCustomer(),
      },
    });
  } catch {
    console.error("test ride save failed");
    return { ok: false as const, error: UNAVAILABLE };
  }
  const first = parsed.data.name.split(/\s+/)[0];
  const when = parsed.data.date ? ` on ${parsed.data.date}` : "";
  return {
    ok: true as const,
    message: `${first}, your MRIGA ${parsed.data.model} test ride in ${parsed.data.city}${when} is reserved. Our team will call you to confirm.`,
  };
}

export async function submitDealerApplication(form: FormData) {
  const blocked = await guard(form, "dealer", 3, HOUR);
  if (blocked) return { ok: false as const, error: blocked };
  const parsed = dealerSchema.safeParse({
    name: text(form, "name"),
    phone: text(form, "phone"),
    location: text(form, "location"),
    model: text(form, "model"),
    website: text(form, "website"),
  });
  if (!parsed.success) return { ok: false as const, error: firstIssue(parsed.error) };
  if (parsed.data.website) return { ok: false as const, error: "Unable to submit this form." };
  const { name, phone, location, model } = parsed.data;
  const userId = await signedInCustomer();
  try {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const reference = `MRG-DLR-${randomInt(100000, 1000000)}`;
      try {
        await prisma.dealerApplication.create({ data: { reference, name, phone, location, model, userId } });
        return { ok: true as const, who: name.split(/\s+/)[0] || "Partner", reference };
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error;
      }
    }
    throw new Error("reference space exhausted");
  } catch {
    console.error("dealer enquiry save failed");
    return { ok: false as const, error: UNAVAILABLE };
  }
}

export async function signIn(form: FormData) {
  const desk = deskOf(text(form, "desk"));
  const blocked = await guard(form, `login-${desk}`, desk === "admin" ? 5 : 10, 15 * MINUTE);
  if (blocked) return { ok: false as const, error: blocked };
  const parsed = signInSchema.safeParse({
    id: text(form, "id"),
    pw: text(form, "pw"),
    remember: text(form, "remember"),
    website: text(form, "website"),
    next: text(form, "next"),
  });
  if (!parsed.success || parsed.data.website) return { ok: false as const, error: NO_MATCH };
  const who = identity(parsed.data.id);
  // Per-account lock as well as per-IP, so a botnet cannot spread guesses across addresses.
  const accountKey = `acct:${desk}:${who.email || who.phone}`;
  try {
    if (!(await hit(accountKey, desk === "admin" ? 5 : 10, desk === "admin" ? HOUR : 15 * MINUTE))) {
      return { ok: false as const, error: TOO_MANY };
    }
    const user = await findByIdentity(who);
    const valid = await verifyPassword(parsed.data.pw, user?.passwordHash || (await dummyPasswordHash()));
    const expected = ROLE_FOR[desk];
    const attempt = { role: expected, method: "password" as const, identifier: who.email || who.phone || "" };
    if (!user || !valid || user.role !== expected) {
      // Only link the failure to an account when it is that desk's account, so the
      // log never ties a customer's mistyped password to the admin, or the reverse.
      await recordLogin({ ...attempt, userId: user?.role === expected ? user.id : null, success: false });
      return { ok: false as const, error: NO_MATCH };
    }
    await clearLimit(accountKey);
    // Admin sessions are short and never "remembered".
    const days = expected === "ADMIN" ? 0.5 : parsed.data.remember === "on" ? 30 : 1;
    await createSession(user.id, days);
    await recordLogin({ ...attempt, userId: user.id, success: true });
    const requested = safeNext(parsed.data.next);
    const href = expected === "ADMIN"
      ? "/admin"
      : requested.startsWith("/admin")
        ? (expected === "RETAILER" ? "/account" : "/")
        : expected === "RETAILER" && requested === "/" ? "/account" : requested;
    return { ok: true as const, name: user.name, href };
  } catch {
    console.error("sign-in failed");
    return { ok: false as const, error: UNAVAILABLE };
  }
}

async function createAccount(form: FormData, role: "MEMBER" | "RETAILER") {
  const blocked = await guard(form, "signup", 5, HOUR);
  if (blocked) return { ok: false as const, error: blocked };
  const parsed = signUpSchema.safeParse({
    name: text(form, "name"),
    id: text(form, "id"),
    pw: text(form, "pw"),
    terms: text(form, "terms"),
    website: text(form, "website"),
  });
  if (!parsed.success) return { ok: false as const, error: firstIssue(parsed.error) };
  if (parsed.data.website) return { ok: false as const, error: "Unable to create this account." };
  const who = identity(parsed.data.id);
  const exists = { ok: false as const, error: "An account with that email or mobile already exists. Sign in instead." };
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (who.email && adminEmail && who.email === adminEmail) return exists;
  try {
    if (await findByIdentity(who)) return exists;
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: who.email,
        phone: who.phone,
        passwordHash: await hashPassword(parsed.data.pw),
        role,
      },
    });
    await createSession(user.id, 7);
    await recordLogin({ userId: user.id, role, method: "signup", success: true, identifier: who.email || who.phone || "" });
    return { ok: true as const, name: user.name, href: role === "RETAILER" ? "/account" : "/" };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return exists;
    console.error("sign-up failed");
    return { ok: false as const, error: UNAVAILABLE };
  }
}

export async function signUp(form: FormData) {
  return createAccount(form, "MEMBER");
}

export async function signUpRetailer(form: FormData) {
  return createAccount(form, "RETAILER");
}

export async function signOut() {
  if (!(await sameOrigin())) return;
  await clearSession();
}

// Links a form to the customer or retailer who sent it, when they were signed in.
async function signedInCustomer() {
  try {
    const session = await getSession();
    return session && session.user.role !== "ADMIN" ? session.user.id : null;
  } catch {
    return null;
  }
}
