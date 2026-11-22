"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hit, sameOrigin } from "@/lib/guards";
import { hashPassword, verifyPassword } from "@/lib/password";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { MODELS, normalizePhone, passwordSchema } from "@/lib/validators";

type Result = { ok: true; message: string } | { ok: false; error: string };

const HOUR = 60 * 60 * 1000;
const controlChars = /[\u0000-\u001F\u007F]/;

async function customer() {
  if (!(await sameOrigin())) return null;
  const session = await getSession();
  if (!session || session.user.role === "ADMIN") return null;
  return session;
}

const field = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

// Saves the editable profile. Email and mobile are sign-in identifiers, so changing either needs
// the current password and must not collide with another account.
export async function updateProfile(_previous: Result | null, form: FormData): Promise<Result> {
  const session = await customer();
  if (!session) redirect("/login?next=/account");
  if (!(await hit(`acct-edit:${session.user.id}`, 20, HOUR))) return { ok: false, error: "Too many changes. Please try again later." };

  const name = field(form, "name");
  if (name.length < 2 || name.length > 80 || controlChars.test(name) || /[<>]/.test(name)) return { ok: false, error: "Please enter your full name (2 to 80 characters)." };
  const emailRaw = field(form, "email").toLowerCase();
  const email = emailRaw || null;
  if (email && (email.length > 120 || !z.string().email().safeParse(email).success)) return { ok: false, error: "Enter a valid email address." };
  const phoneRaw = field(form, "phone");
  const phone = phoneRaw ? normalizePhone(phoneRaw) : null;
  if (phone && (phone.length < 10 || phone.length > 15)) return { ok: false, error: "Enter a valid 10-digit mobile number." };
  if (!email && !phone) return { ok: false, error: "Keep at least an email or a mobile number, so you can sign in." };
  const city = field(form, "city").slice(0, 80) || null;
  if (city && (controlChars.test(city) || /[<>]/.test(city))) return { ok: false, error: "Please check the city." };
  const model = field(form, "preferredModel").toUpperCase();
  const preferredModel = (MODELS as readonly string[]).includes(model) ? model : null;
  const updatesOptIn = form.get("updatesOptIn") === "on";

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true, phone: true, passwordHash: true } });
  if (!user) redirect("/login?next=/account");
  const identityChanged = email !== user.email || phone !== user.phone;
  if (identityChanged) {
    if (!user.passwordHash) return { ok: false, error: "This account signs in with Google, so its email and mobile can only be changed by our team." };
    if (!(await verifyPassword(field(form, "current"), user.passwordHash))) return { ok: false, error: "To change your email or mobile, enter your current password correctly." };
  }

  try {
    await prisma.user.update({ where: { id: session.user.id }, data: { name, email, phone, city, preferredModel, updatesOptIn } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "That email or mobile number is already used by another account." };
    }
    throw error;
  }
  return { ok: true, message: identityChanged ? "Profile saved. Use the new email or mobile to sign in next time." : "Profile saved." };
}

// Changes the password and signs out every other device, so a leaked password stops working everywhere.
export async function changePassword(_previous: Result | null, form: FormData): Promise<Result> {
  const session = await customer();
  if (!session) redirect("/login?next=/account");
  if (!(await hit(`acct-pw:${session.user.id}`, 5, HOUR))) return { ok: false, error: "Too many attempts. Please try again in an hour." };
  const current = String(form.get("current") || "");
  const next = String(form.get("next") || "");
  const confirm = String(form.get("confirm") || "");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { passwordHash: true } });
  if (!user?.passwordHash) return { ok: false, error: "This account signs in with Google, so it has no password to change." };
  if (!(await verifyPassword(current, user.passwordHash))) return { ok: false, error: "Your current password is not correct." };
  const parsed = passwordSchema.safeParse(next);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message || "Choose a stronger password." };
  if (next !== confirm) return { ok: false, error: "The new passwords do not match." };
  if (next === current) return { ok: false, error: "The new password must be different from the current one." };
  const passwordHash = await hashPassword(next);
  const [, others] = await prisma.$transaction([
    prisma.user.update({ where: { id: session.user.id }, data: { passwordHash } }),
    prisma.session.deleteMany({ where: { userId: session.user.id, id: { not: session.id } } }),
  ]);
  return { ok: true, message: others.count > 0 ? `Password changed. Signed out ${others.count} other ${others.count === 1 ? "device" : "devices"}.` : "Password changed." };
}
