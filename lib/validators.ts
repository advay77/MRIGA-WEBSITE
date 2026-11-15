import { z } from "zod";

export const CITIES = ["Rohini, New Delhi", "Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Pune", "Jaipur"] as const;
export const MODELS = ["RIVA", "MIRA", "VIRA"] as const;

const controlChars = /[\u0000-\u001F\u007F]/;

export const rideSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80).refine((value) => !controlChars.test(value), "Please enter your name."),
  phone: z.string().trim().transform((value) => value.replace(/\D/g, "")).refine((value) => value.length >= 10 && value.length <= 15, "Please enter a valid 10-digit mobile number."),
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

const constitutions = ["Private Limited", "LLP", "Partnership", "Proprietorship"] as const;
const yearBands = ["0 – 3 Years", "3 – 7 Years", "7 – 15 Years", "15+ Years"] as const;
const areas = ["Under 1,200 sq ft", "1,200 - 2,500 sq ft", "2,500 sq ft or more"] as const;
const liquidity = ["Under ₹25 lakh", "₹25 lakh – ₹75 lakh", "Above ₹75 lakh"] as const;
const timelines = ["Under 45 Days", "45 – 60 Days", "60 – 90 Days"] as const;

export const dealerSchema = z.object({
  name: z.string().trim().min(2, "Please enter the signatory name.").max(80).refine((value) => !controlChars.test(value), "Please enter the signatory name."),
  mobile: z.string().trim().transform((value) => value.replace(/\D/g, "")).refine((value) => value.length >= 10 && value.length <= 15, "Please enter a valid mobile number."),
  email: z.string().trim().email("Enter a valid business email.").max(120).transform((value) => value.toLowerCase()),
  title: z.string().trim().min(2, "Enter the official title.").max(80),
  entity: z.string().trim().min(2, "Enter the registered entity name.").max(120),
  constitution: z.enum(constitutions),
  years: z.enum(yearBands),
  gst: z.string().trim().toUpperCase().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, "Enter a valid 15-character GSTIN."),
  city: z.string().trim().min(2, "Enter the target city.").max(120),
  area: z.enum(areas),
  frontage: z.enum(["yes", "pending"]),
  brands: z.string().trim().max(160).optional().or(z.literal("")),
  models: z.string().refine((value) => {
    const keys = value.split(",").filter(Boolean);
    return keys.length > 0 && keys.every((key) => key === "mira" || key === "riva" || key === "vira");
  }, "Please select at least one model for your showroom."),
  liquidity: z.enum(liquidity),
  timeline: z.enum(timelines),
  certify: z.string().refine((value) => value === "on", "Please certify that you are an authorized signatory."),
  website: z.string().max(200).optional().or(z.literal("")),
});

export const passwordSchema = z
  .string()
  .min(10, "Your passkey must be at least 10 characters and include a letter and a number.")
  .max(128, "That passkey is too long.")
  .refine((value) => /[A-Za-z]/.test(value) && /\d/.test(value), "Your passkey must be at least 10 characters and include a letter and a number.");

export const accountSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(80).optional().or(z.literal("")),
  id: z.string().trim().max(120).refine((value) => {
    if (value.includes("@")) return z.string().email().safeParse(value).success;
    const digits = value.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }, "Enter a valid email or 10-digit mobile number."),
  pw: passwordSchema,
  terms: z.string().optional().or(z.literal("")),
  remember: z.string().optional().or(z.literal("")),
  website: z.string().max(200).optional().or(z.literal("")),
  next: z.string().max(200).optional().or(z.literal("")),
});

export function safeNext(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.includes("://")) return "/";
  return value;
}

export function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message || "Please check the form and try again.";
}
