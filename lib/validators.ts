import { z } from "zod";

export const CITIES = ["Rohini, New Delhi", "Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Pune", "Jaipur"] as const;
export const MODELS = ["RIVA", "MIRA", "VIRA"] as const;

const controlChars = /[\u0000-\u001F\u007F]/;

// One canonical form per number, so "+91 98765 43210", "09876543210" and "9876543210" match.
export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

const phoneField = (message: string) =>
  z.string().trim().max(24).transform(normalizePhone).refine((value) => value.length >= 10 && value.length <= 15, message);
const plainText = (min: number, max: number, message: string) =>
  z.string().trim().min(min, message).max(max).refine((value) => !controlChars.test(value), message);

export const rideSchema = z.object({
  name: plainText(2, 80, "Please enter your name."),
  phone: phoneField("Please enter a valid 10-digit mobile number."),
  city: z.enum(CITIES),
  model: z.enum(MODELS),
  date: z.string().trim().max(10).refine((value) => {
    if (!value) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const min = today.getTime() - 24 * 60 * 60 * 1000;
    const max = today.getTime() + 366 * 24 * 60 * 60 * 1000;
    return parsed.getTime() >= min && parsed.getTime() <= max;
  }, "Choose a date within the next year."),
  website: z.string().max(200).optional().or(z.literal("")),
});

// Dealer enquiry: just enough for the team to call back.
export const dealerSchema = z.object({
  name: plainText(2, 80, "Please enter your name."),
  phone: phoneField("Please enter a valid 10-digit mobile number."),
  location: plainText(2, 120, "Please enter your city or area."),
  model: z.enum(MODELS, { errorMap: () => ({ message: "Please choose a model." }) }),
  website: z.string().max(200).optional().or(z.literal("")),
});

export const passwordSchema = z
  .string()
  .min(10, "Your passkey must be at least 10 characters and include a letter and a number.")
  .max(128, "That passkey is too long.")
  .refine((value) => /[A-Za-z]/.test(value) && /\d/.test(value), "Your passkey must be at least 10 characters and include a letter and a number.");

const accountId = z.string().trim().max(120).refine((value) => {
  if (value.includes("@")) return z.string().email().safeParse(value).success;
  const digits = normalizePhone(value);
  return digits.length >= 10 && digits.length <= 15;
}, "Enter a valid email or 10-digit mobile number.");
const optional = (max: number) => z.string().max(max).optional().or(z.literal(""));

export const signUpSchema = z.object({
  name: plainText(2, 80, "Please enter your full name."),
  id: accountId,
  pw: passwordSchema,
  terms: z.literal("on", { errorMap: () => ({ message: "Please accept the terms to continue." }) }),
  website: optional(200),
});

// Sign-in checks shape only. Strength rules belong to sign-up, so an older or
// admin-set password is never locked out by a later policy change.
export const signInSchema = z.object({
  id: accountId,
  pw: z.string().min(1).max(128),
  remember: optional(10),
  website: optional(200),
  next: optional(200),
});

export function safeNext(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.includes("://")) return "/";
  return value;
}

export function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message || "Please check the form and try again.";
}
