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
import { modelKey, modelOverrideSchema } from "@/lib/models";
import { isModelId, type ModelId } from "@/lib/specs";

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
    let value = typeof raw === "string" ? raw.replace(/[<>]/g, "").trim().slice(0, 600) : "";
    if (field.key === "phoneHref") value = value.replace(/[^\d+]/g, "").slice(0, 16);
    if (field.key === "whatsapp") value = whatsappDigits(value).slice(0, 15);
    if (field.key === "instagram" && value && !/^https:\/\/(www\.)?instagram\.com\//.test(value)) value = field.fallback;
    // A malformed address would produce a broken mailto: link on Contact; drop it instead.
    if (field.key === "email" && value && !/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(value)) value = "";
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
  const model = String(form.get("model") || "");
  if (isModelId(model)) redirect(`/admin?section=models&model=${model}&saved=prices#prices`);
  redirect(block ? `/admin?section=website&saved=text&block=${block}#block-${block}` : "/admin?section=website&saved=text");
}

export async function saveMedia(form: FormData) {
  if (!(await requireAdmin())) redirect("/admin/login");
  const slot = mediaSlot(String(form.get("slot") || ""));
  const home = slot && isModelId(slot.group) ? `/admin?section=models&model=${slot.group}` : "/admin?section=photos";
  const failed = slot ? `${home}&saved=photo-error&slot=${slot.id}#photo-${slot.id}` : "/admin?section=photos&saved=photo-error";
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
  updateTag(SITE_CONTENT_TAG);
  redirect(`${home}&saved=${slot.id}&t=${Date.now()}#photo-${slot.id}`);
}

// Removes an uploaded photo: the slot goes back to its built-in photo, or disappears from the
// RIVA/VIRA gallery when it has none.
export async function removeMedia(form: FormData) {
  if (!(await requireAdmin())) redirect("/admin/login");
  const slot = mediaSlot(String(form.get("slot") || ""));
  if (!slot) redirect("/admin?section=photos");
  await prisma.mediaAsset.deleteMany({ where: { slot: slot.id } });
  updateTag(SITE_CONTENT_TAG);
  const home = isModelId(slot.group) ? `/admin?section=models&model=${slot.group}` : "/admin?section=photos";
  redirect(`${home}&saved=removed-${slot.id}&t=${Date.now()}#photo-${slot.id}`);
}

const CONTROL = /[\u0000-\u0008\u000B-\u001F\u007F]/g;
const clean = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.replace(CONTROL, "").replace(/[<>]/g, "").trim() : "");

// Reads the Models form: status and copy, up to 6 highlights, and spec groups written one
// "Label: value" per line. Empty highlight rows and groups are dropped, so clearing them deletes.
function readModelForm(form: FormData) {
  const highlights = Array.from({ length: 6 }, (_, index) => ({
    value: clean(form.get(`h${index}_value`)),
    unit: clean(form.get(`h${index}_unit`)),
    label: clean(form.get(`h${index}_label`)),
  })).filter((item) => item.value || item.label);
  const groups = Array.from({ length: 10 }, (_, index) => {
    const title = clean(form.get(`g${index}_title`));
    const rows = String(form.get(`g${index}_rows`) ?? "")
      .split(/\r?\n/)
      .map((line) => line.replace(CONTROL, "").trim())
      .filter(Boolean)
      .map((line): [string, string] => {
        const cut = line.indexOf(":");
        return cut > 0 ? [line.slice(0, cut).trim(), line.slice(cut + 1).trim() || "Yes"] : [line, "Yes"];
      });
    return { title, rows };
  }).filter((group) => group.title || group.rows.length > 0);
  return {
    status: clean(form.get("status")),
    tagline: clean(form.get("tagline")),
    summary: clean(form.get("summary")),
    app: form.get("app") === "on",
    highlights,
    groups,
  };
}

const MODEL_ERROR_FIELD: Record<string, string> = { status: "status", tagline: "tagline", summary: "summary", highlights: "highlights", groups: "specs" };

export async function saveModel(form: FormData) {
  if (!(await requireAdmin())) redirect("/admin/login");
  const raw = String(form.get("model") || "");
  if (!isModelId(raw)) redirect("/admin?section=models");
  const id: ModelId = raw;
  const parsed = modelOverrideSchema.safeParse(readModelForm(form));
  if (!parsed.success) {
    const field = MODEL_ERROR_FIELD[String(parsed.error.issues[0]?.path[0] ?? "")] ?? "text";
    redirect(`/admin?section=models&model=${id}&saved=error&field=${field}#details`);
  }
  const value = JSON.stringify(parsed.data);
  await prisma.siteSetting.upsert({ where: { key: modelKey(id) }, create: { key: modelKey(id), value }, update: { value } });
  updateTag(SITE_CONTENT_TAG);
  redirect(`/admin?section=models&model=${id}&saved=text#details`);
}

// Puts a model's text and specifications back to the original lib/specs.json values.
export async function resetModel(form: FormData) {
  if (!(await requireAdmin())) redirect("/admin/login");
  const raw = String(form.get("model") || "");
  if (!isModelId(raw)) redirect("/admin?section=models");
  await prisma.siteSetting.deleteMany({ where: { key: modelKey(raw) } });
  updateTag(SITE_CONTENT_TAG);
  redirect(`/admin?section=models&model=${raw}&saved=reset#details`);
}

// Marks a test ride or dealer application as contacted, done, etc., with an optional note.
export async function updateLead(form: FormData) {
  if (!(await requireAdmin())) redirect("/admin/login");
  const kind: LeadKind = form.get("kind") === "dealer" ? "dealer" : "ride";
  const id = String(form.get("id") || "").slice(0, 40);
  const status = form.get("status");
  const rawNote = form.get("note");
  const note = typeof rawNote === "string" ? rawNote.replace(/[\u0000-\u0008\u000B-\u001F\u007F<>]/g, "").trim().slice(0, NOTE_MAX) : "";
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
