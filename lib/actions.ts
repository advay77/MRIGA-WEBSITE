"use server";

import { randomInt } from "crypto";
import { prisma } from "@/lib/db";
import { createSession, clearSession } from "@/lib/auth";
import { DUMMY_PASSWORD_HASH, hashPassword, verifyPassword } from "@/lib/password";
import { rateLimit, sameOrigin } from "@/lib/guards";
import { accountSchema, dealerSchema, firstIssue, rideSchema, safeNext } from "@/lib/validators";

const HOUR = 60 * 60 * 1000;
const UNAVAILABLE = "The atelier desk is briefly unavailable. Please try again.";

function text(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

function sniff(bytes: Uint8Array) {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d) return "application/pdf";
  return null;
}

function safeFileName(name: string) {
  const base = name.split(/[/\\]/).pop() || "document";
  return base.replace(/[^\w.\- ]+/g, "_").slice(0, 80) || "document";
}

async function guard(action: string, limit: number, windowMs: number) {
  if (!(await sameOrigin())) return "Invalid request.";
  if (!(await rateLimit(action, limit, windowMs))) return "Too many attempts. Please wait a few minutes.";
  return null;
}

export async function reserveTestRide(form: FormData) {
  const blocked = await guard("ride", 5, HOUR);
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
      },
    });
  } catch (error) {
    console.error(error);
    return { ok: false as const, error: UNAVAILABLE };
  }
  const first = parsed.data.name.split(/\s+/)[0];
  const when = parsed.data.date ? ` on ${parsed.data.date}` : "";
  return {
    ok: true as const,
    message: `${first}, your MRIGA ${parsed.data.model} test ride in ${parsed.data.city}${when} is reserved. Our concierge will call you within 15 minutes.`,
  };
}

export async function submitDealerApplication(form: FormData) {
  const blocked = await guard("dealer", 3, HOUR);
  if (blocked) return { ok: false as const, error: blocked };
  const parsed = dealerSchema.safeParse({
    name: text(form, "name"),
    mobile: text(form, "mobile"),
    email: text(form, "email"),
    title: text(form, "title"),
    entity: text(form, "entity"),
    constitution: text(form, "constitution"),
    years: text(form, "years"),
    gst: text(form, "gst"),
    city: text(form, "city"),
    area: text(form, "area"),
    frontage: text(form, "frontage"),
    brands: text(form, "brands"),
    models: text(form, "models"),
    liquidity: text(form, "liquidity"),
    timeline: text(form, "timeline"),
    certify: text(form, "certify"),
    website: text(form, "website"),
  });
  if (!parsed.success) return { ok: false as const, error: firstIssue(parsed.error) };
  if (parsed.data.website) return { ok: false as const, error: "Unable to submit this form." };

  const uploads = form.getAll("credentials").filter((item): item is File => item instanceof File && item.size > 0);
  if (uploads.length > 3) return { ok: false as const, error: "Attach up to 3 files." };
  const files: { filename: string; mime: string; size: number; bytes: Uint8Array<ArrayBuffer> }[] = [];
  for (const file of uploads) {
    if (file.size > 4 * 1024 * 1024) return { ok: false as const, error: "Each file must be under 4MB." };
    const raw = new Uint8Array(await file.arrayBuffer());
    const mime = sniff(raw);
    if (!mime) return { ok: false as const, error: "Attach only PDF, JPG, or PNG files." };
    const bytes = new Uint8Array(raw.byteLength);
    bytes.set(raw);
    files.push({ filename: safeFileName(file.name), mime, size: bytes.byteLength, bytes });
  }

  try {
    let reference = "";
    for (let attempt = 0; attempt < 5; attempt += 1) {
      reference = `MRG-DLR-${randomInt(100000, 1000000)}`;
      const taken = await prisma.dealerApplication.findUnique({ where: { reference } });
      if (!taken) break;
    }
    await prisma.dealerApplication.create({
      data: {
        reference,
        name: parsed.data.name,
        mobile: parsed.data.mobile,
        email: parsed.data.email,
        title: parsed.data.title,
        entity: parsed.data.entity,
        constitution: parsed.data.constitution,
        years: parsed.data.years,
        gst: parsed.data.gst,
        city: parsed.data.city,
        area: parsed.data.area,
        frontage: parsed.data.frontage,
        brands: parsed.data.brands || "",
        models: parsed.data.models,
        liquidity: parsed.data.liquidity,
        timeline: parsed.data.timeline,
        files: { create: files },
      },
    });
    return { ok: true as const, who: parsed.data.name.split(/\s+/)[0] || "Partner", reference };
  } catch (error) {
    console.error(error);
    return { ok: false as const, error: UNAVAILABLE };
  }
}

function identity(value: string) {
  if (value.includes("@")) return { email: value.toLowerCase(), phone: null as string | null };
  return { email: null as string | null, phone: value.replace(/\D/g, "") };
}

export async function signIn(form: FormData) {
  const blocked = await guard("login", 8, 15 * 60 * 1000);
  if (blocked) return { ok: false as const, error: blocked };
  const parsed = accountSchema.safeParse({
    id: text(form, "id"),
    pw: text(form, "pw"),
    remember: text(form, "remember"),
    website: text(form, "website"),
    next: text(form, "next"),
  });
  if (!parsed.success) return { ok: false as const, error: "Those details do not match an account." };
  if (parsed.data.website) return { ok: false as const, error: "Those details do not match an account." };
  const who = identity(parsed.data.id);
  try {
    const user = who.email
      ? await prisma.user.findUnique({ where: { email: who.email } })
      : await prisma.user.findUnique({ where: { phone: who.phone || "" } });
    const valid = verifyPassword(parsed.data.pw, user?.passwordHash || DUMMY_PASSWORD_HASH);
    if (!user || !valid) return { ok: false as const, error: "Those details do not match an account." };
    await createSession(user.id, parsed.data.remember === "on" ? 30 : 1);
    const requested = safeNext(parsed.data.next);
    const href = user.role === "ADMIN" ? (requested === "/" ? "/admin" : requested) : requested.startsWith("/admin") ? "/" : requested;
    return { ok: true as const, name: user.name, href };
  } catch (error) {
    console.error(error);
    return { ok: false as const, error: UNAVAILABLE };
  }
}

export async function signUp(form: FormData) {
  const blocked = await guard("signup", 5, HOUR);
  if (blocked) return { ok: false as const, error: blocked };
  const parsed = accountSchema.safeParse({
    name: text(form, "name"),
    id: text(form, "id"),
    pw: text(form, "pw"),
    terms: text(form, "terms"),
    website: text(form, "website"),
  });
  if (!parsed.success) return { ok: false as const, error: firstIssue(parsed.error) };
  if (!parsed.data.name || parsed.data.name.trim().length < 2) return { ok: false as const, error: "Please enter your full name." };
  if (parsed.data.terms !== "on") return { ok: false as const, error: "Please accept the Lounge terms to continue." };
  if (parsed.data.website) return { ok: false as const, error: "Unable to create this account." };
  const who = identity(parsed.data.id);
  try {
    const existing = who.email
      ? await prisma.user.findUnique({ where: { email: who.email } })
      : await prisma.user.findUnique({ where: { phone: who.phone || "" } });
    if (existing) return { ok: false as const, error: "An account with that email or mobile already exists. Sign in instead." };
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name.trim(),
        email: who.email,
        phone: who.phone,
        passwordHash: hashPassword(parsed.data.pw),
        role: "MEMBER",
      },
    });
    await createSession(user.id, 7);
    return { ok: true as const, name: user.name, href: "/" };
  } catch (error) {
    console.error(error);
    return { ok: false as const, error: UNAVAILABLE };
  }
}

export async function signOut() {
  if (!(await sameOrigin())) return;
  await clearSession();
}
