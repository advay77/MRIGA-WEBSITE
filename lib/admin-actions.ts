"use server";

import { redirect } from "next/navigation";
import { clearSession, getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sameOrigin } from "@/lib/guards";
import { CONTENT_FIELDS, mediaSlot } from "@/lib/site-copy";

async function requireAdmin() {
  if (!(await sameOrigin())) return false;
  const session = await getSession();
  return Boolean(session && session.user.role === "ADMIN");
}

export async function saveSiteContent(form: FormData) {
  if (!(await requireAdmin())) redirect("/admin/login");
  const rows = CONTENT_FIELDS.flatMap((field) => {
    if (!form.has(field.key)) return [];
    const raw = form.get(field.key);
    let value = typeof raw === "string" ? raw.trim().slice(0, 600) : "";
    if (field.key === "phoneHref") value = value.replace(/[^\d+]/g, "").slice(0, 16);
    if (field.key === "instagram" && value && !value.startsWith("https://")) value = field.fallback;
    return [{ key: field.key, value: value || field.fallback }];
  });
  if (rows.length > 0) {
    await prisma.$transaction(
      rows.map((row) =>
        prisma.siteSetting.upsert({
          where: { key: row.key },
          create: row,
          update: { value: row.value },
        }),
      ),
    );
  }
  redirect("/admin?section=website&saved=text");
}

function sniffImage(bytes: Uint8Array) {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "image/webp";
  return null;
}

export async function saveMedia(form: FormData) {
  if (!(await requireAdmin())) redirect("/admin/login");
  const slot = mediaSlot(String(form.get("slot") || ""));
  const file = form.get("file");
  if (!slot || !(file instanceof File) || file.size < 1 || file.size > 5 * 1024 * 1024) {
    redirect("/admin?section=photos&saved=photo-error");
  }
  const raw = new Uint8Array(await file.arrayBuffer());
  const mime = sniffImage(raw);
  if (!mime) redirect("/admin?section=photos&saved=photo-error");
  const bytes = new Uint8Array(raw.byteLength);
  bytes.set(raw);
  const filename = (file.name.split(/[/\\]/).pop() || "photo").replace(/[^\w.\- ]+/g, "_").slice(0, 80) || "photo";
  await prisma.mediaAsset.upsert({
    where: { slot: slot.id },
    create: { slot: slot.id, filename, mime, bytes },
    update: { filename, mime, bytes },
  });
  redirect(`/admin?section=photos&saved=${slot.id}`);
}

export async function signOutAdmin() {
  if (!(await sameOrigin())) redirect("/admin/login");
  await clearSession();
  redirect("/admin/login");
}
