"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hit, sameOrigin } from "@/lib/guards";
import { hashPassword, verifyPassword } from "@/lib/password";
import { passwordSchema } from "@/lib/validators";

type Result = { ok: true; message: string } | { ok: false; error: string };

const HOUR = 60 * 60 * 1000;
const controlChars = /[\u0000-\u001F\u007F]/;

async function customer() {
  if (!(await sameOrigin())) return null;
  const session = await getSession();
  if (!session || session.user.role === "ADMIN") return null;
  return session;
}

export async function updateName(_previous: Result | null, form: FormData): Promise<Result> {
  const session = await customer();
  if (!session) redirect("/login?next=/account");
  const name = String(form.get("name") || "").trim();
  if (name.length < 2 || name.length > 80 || controlChars.test(name)) return { ok: false, error: "Please enter your full name (2 to 80 characters)." };
  if (!(await hit(`acct-edit:${session.user.id}`, 20, HOUR))) return { ok: false, error: "Too many changes. Please try again later." };
  await prisma.user.update({ where: { id: session.user.id }, data: { name } });
  return { ok: true, message: "Name saved." };
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
