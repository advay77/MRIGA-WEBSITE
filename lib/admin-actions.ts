"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { clearSession, getSession } from "@/lib/auth";
import { SITE_CONTENT_TAG } from "@/lib/content";
import { prisma } from "@/lib/db";
import { sameOrigin } from "@/lib/guards";
import { CONTENT_FIELDS, CONTENT_GROUPS, mediaSlot } from "@/lib/site-copy";
import { isStatus, NOTE_MAX, type LeadKind } from "@/lib/leads";
import { MAX_UPLOAD_BYTES, readUpload, safeFileName } from "@/lib/uploads";
import { safeNext } from "@/lib/validators";
import { whatsappDigits } from "@/lib/whatsapp";

async function requireAdmin() {
  if (!(await sameOrigin())) return false;
  const session = await getSession();
  return session?.user.role === "ADMIN";
}

export async function saveSiteContent(form: FormData) {
  if (!(await requireAdmin())) redirect("/admin/login");
  const rows = CONTENT_FIELDS.flatMap((field) => {
    if (!form.has(field.key)) return [];
    const raw = form.get(field.key);
    let value = typeof raw === "string" ? raw.trim().slice(0, 600) : "";
    if (field.key === "phoneHref") value = value.replace(/[^\d+]/g, "").slice(0, 16);
    if (field.key === "whatsapp") value = whatsappDigits(value).slice(0, 15);
    if (field.key === "instagram" && value && !/^https:\/\/(www\.)?instagram\.com\//.test(value)) value = field.fallback;
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
    updateTag(SITE_CONTENT_TAG);
  }
  const block = CONTENT_GROUPS.find((group) => group.id === form.get("block"))?.id;
  redirect(block ? `/admin?section=website&saved=text&block=${block}#block-${block}` : "/admin?section=website&saved=text");
}

export async function saveMedia(form: FormData) {
  if (!(await requireAdmin())) redirect("/admin/login");
  const slot = mediaSlot(String(form.get("slot") || ""));
  const failed = slot ? `/admin?section=photos&saved=photo-error&slot=${slot.id}#photo-${slot.id}` : "/admin?section=photos&saved=photo-error";
  const file = form.get("file");
  if (!slot || !(file instanceof File) || file.size < 1 || file.size > MAX_UPLOAD_BYTES) {
    redirect(failed);
  }
  const { bytes, mime } = await readUpload(file);
  if (!mime) redirect(failed);
  const filename = safeFileName(file.name, "photo");
  await prisma.mediaAsset.upsert({
    where: { slot: slot.id },
    create: { slot: slot.id, filename, mime, bytes },
    update: { filename, mime, bytes },
  });
  redirect(`/admin?section=photos&saved=${slot.id}&t=${Date.now()}#photo-${slot.id}`);
}

// Marks a test ride or dealer application as contacted, done, etc., with an optional note.
export async function updateLead(form: FormData) {
  if (!(await requireAdmin())) redirect("/admin/login");
  const kind: LeadKind = form.get("kind") === "dealer" ? "dealer" : "ride";
  const id = String(form.get("id") || "").slice(0, 40);
  const status = form.get("status");
  const rawNote = form.get("note");
  const note = typeof rawNote === "string" ? rawNote.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim().slice(0, NOTE_MAX) : "";
  const back = safeNext(String(form.get("back") || ""));
  const returnTo = back.startsWith("/admin?") ? back : `/admin?section=${kind === "ride" ? "rides" : "applications"}`;
  if (!id || !isStatus(kind, status)) redirect(returnTo);

  const data = { status, adminNote: note || null };
  const where = { id };
  const current = kind === "ride"
    ? await prisma.testRide.findUnique({ where, select: { status: true } })
    : await prisma.dealerApplication.findUnique({ where, select: { status: true } });
  if (!current) redirect(returnTo);
  const update = { ...data, ...(current.status !== status ? { statusAt: new Date() } : {}) };
  if (kind === "ride") await prisma.testRide.update({ where, data: update });
  else await prisma.dealerApplication.update({ where, data: update });

  const url = new URL(returnTo, "http://desk.local");
  url.searchParams.set("updated", id);
  redirect(`${url.pathname}${url.search}#lead-${id}`);
}

export async function signOutAdmin() {
  if (!(await sameOrigin())) redirect("/admin/login");
  await clearSession();
  redirect("/admin/login");
}
