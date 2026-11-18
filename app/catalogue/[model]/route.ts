import { readFile } from "fs/promises";
import path from "path";
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { getSiteContent } from "@/lib/content";
import { prisma } from "@/lib/db";
import { mediaSlot } from "@/lib/site-copy";
import { MIRA_COLOUR_LINE } from "@/lib/mira";
import { getModels } from "@/lib/models";
import { APP_FEATURES, isModelId, WARRANTY, type ModelId } from "@/lib/specs";
import { sniff } from "@/lib/uploads";

export const dynamic = "force-dynamic";

// Built per request from lib/specs.json, admin text (prices, address) and admin photos, so the
// catalogue never drifts from the site. The CDN keeps each one for 10 minutes.
const CACHE = "public, max-age=600, s-maxage=600, stale-while-revalidate=86400";

const W = 595.28;
const H = 841.89;
const M = 48;
const WINE = rgb(0.306, 0.059, 0.133);
const INK = rgb(0.29, 0.055, 0.122);
const ACCENT = rgb(0.788, 0.302, 0.102);
const MUTED = rgb(0.43, 0.35, 0.33);
const CREAM = rgb(0.984, 0.965, 0.933);
const LINE = rgb(0.9, 0.86, 0.82);
const WHITE = rgb(1, 1, 1);

const HERO_SLOT: Record<ModelId, string> = { mira: "mira-pink", riva: "riva", vira: "vira" };

// Standard PDF fonts only cover Latin-1, so map the few characters the copy uses outside it.
function plain(text: string) {
  return text
    .replace(/₹\s?/g, "Rs. ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[—]/g, "-")
    .replace(/[^\x20-\x7E\xA0-\xFF–·]/g, "");
}

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of plain(text).split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function photo(doc: PDFDocument, slotId: string): Promise<PDFImage | null> {
  const slot = mediaSlot(slotId);
  if (!slot) return null;
  let bytes: Uint8Array | null = null;
  let mime = "";
  try {
    const asset = await prisma.mediaAsset.findUnique({ where: { slot: slot.id }, select: { bytes: true, mime: true } });
    if (asset) {
      bytes = asset.bytes;
      mime = asset.mime;
    }
  } catch {
    // Database unreachable: fall back to the photo shipped with the site.
  }
  if (!bytes) {
    // A model without its own photo yet falls back to the logo; leave the cover photo out instead.
    if (slot.fallback === "logo.png" && slotId !== "logo") return null;
    try {
      bytes = new Uint8Array(await readFile(path.join(process.cwd(), "public", slot.fallback)));
      // Judge by the bytes, not the name: some shipped ".png" photos are really JPEGs.
      mime = sniff(bytes) ?? "";
    } catch {
      return null;
    }
  }
  try {
    if (mime === "image/png") return await doc.embedPng(bytes);
    if (mime === "image/jpeg") return await doc.embedJpg(bytes);
  } catch {
    // Unsupported or corrupt image: the catalogue still works without it.
  }
  return null;
}

function footer(page: PDFPage, font: PDFFont, lines: string[]) {
  page.drawLine({ start: { x: M, y: 64 }, end: { x: W - M, y: 64 }, thickness: 0.6, color: LINE });
  lines.forEach((text, index) => {
    page.drawText(plain(text), { x: M, y: 48 - index * 12, size: 8.5, font, color: MUTED });
  });
}

export async function GET(request: Request, context: { params: Promise<{ model: string }> }) {
  const { model } = await context.params;
  const id = model.replace(/\.pdf$/i, "").toLowerCase();
  if (!isModelId(id)) return new Response("Not found", { status: 404 });
  const { specs, photos } = await getModels();
  const spec = specs[id];
  const content = await getSiteContent();
  const site = (process.env.SITE_URL || new URL(request.url).origin).replace(/\/+$/, "");

  const doc = await PDFDocument.create();
  doc.setTitle(`MRIGA ${spec.name} catalogue`);
  doc.setAuthor("MRIGA");
  doc.setSubject(`${spec.name} specifications`);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const serif = await doc.embedFont(StandardFonts.TimesRomanBold);
  const [logo, hero] = await Promise.all([photo(doc, "logo"), photo(doc, id === "mira" ? HERO_SLOT.mira : photos[id][0] ?? HERO_SLOT[id])]);
  const contact = [
    `MRIGA showroom: ${content.address}`,
    `Call ${content.phone}  ·  WhatsApp +${content.whatsapp}  ·  ${site}/${id}`,
  ];

  // Cover
  const cover = doc.addPage([W, H]);
  cover.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WINE });
  if (logo) cover.drawImage(logo, { x: M, y: H - M - 44, width: 44, height: 44 });
  cover.drawText("MRIGA", { x: M + 56, y: H - M - 30, size: 18, font: serif, color: CREAM });
  const badge = plain(spec.status.toUpperCase());
  const badgeWidth = bold.widthOfTextAtSize(badge, 9) + 22;
  cover.drawRectangle({ x: W - M - badgeWidth, y: H - M - 34, width: badgeWidth, height: 22, color: id === "mira" ? ACCENT : rgb(0.45, 0.16, 0.24) });
  cover.drawText(badge, { x: W - M - badgeWidth + 11, y: H - M - 26.5, size: 9, font: bold, color: WHITE });

  const photoTop = H - 130;
  const photoHeight = 360;
  cover.drawRectangle({ x: M, y: photoTop - photoHeight, width: W - 2 * M, height: photoHeight, color: rgb(0.98, 0.94, 0.9) });
  if (hero) {
    const scale = Math.min((W - 2 * M - 24) / hero.width, (photoHeight - 24) / hero.height);
    const width = hero.width * scale;
    const height = hero.height * scale;
    cover.drawImage(hero, { x: (W - width) / 2, y: photoTop - photoHeight + (photoHeight - height) / 2, width, height });
  } else {
    const soon = "Photographs coming soon";
    cover.drawText(soon, { x: (W - serif.widthOfTextAtSize(soon, 22)) / 2, y: photoTop - photoHeight / 2, size: 22, font: serif, color: INK });
  }

  let y = photoTop - photoHeight - 64;
  cover.drawText(spec.name, { x: M, y, size: 56, font: serif, color: CREAM });
  y -= 30;
  cover.drawText(plain(spec.tagline), { x: M, y, size: 15, font: bold, color: rgb(0.94, 0.48, 0.26) });
  y -= 22;
  for (const line of wrap(spec.summary, regular, 11, W - 2 * M)) {
    cover.drawText(line, { x: M, y, size: 11, font: regular, color: rgb(0.89, 0.78, 0.75) });
    y -= 15;
  }
  // Highlights strip
  const cellWidth = (W - 2 * M) / spec.highlights.length;
  spec.highlights.forEach((item, index) => {
    const x = M + index * cellWidth;
    cover.drawText(plain(item.value), { x, y: 96, size: 22, font: serif, color: CREAM });
    if (item.unit) cover.drawText(plain(item.unit), { x: x + serif.widthOfTextAtSize(plain(item.value), 22) + 4, y: 97, size: 9, font: bold, color: rgb(0.94, 0.48, 0.26) });
    cover.drawText(plain(item.label.toUpperCase()), { x, y: 80, size: 7.5, font: bold, color: rgb(0.89, 0.78, 0.75) });
  });
  cover.drawText(plain(contact[0]), { x: M, y: 40, size: 8.5, font: regular, color: rgb(0.89, 0.78, 0.75) });
  cover.drawText(plain(contact[1]), { x: M, y: 28, size: 8.5, font: regular, color: rgb(0.89, 0.78, 0.75) });

  // Specifications
  let page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: CREAM });
  y = H - M - 10;
  page.drawText(`${spec.name} specifications`, { x: M, y, size: 26, font: serif, color: INK });
  y -= 28;
  const groups = [...spec.groups];
  if (id === "mira") {
    groups.push({ title: "Price", rows: [["LiFePO4 (lithium)", `${content.lithiumPrice}. ${content.lithiumDetail}`], ["SLA (lead-acid)", `${content.leadPrice}. ${content.leadDetail}`], ["Colours", MIRA_COLOUR_LINE[0].toUpperCase() + MIRA_COLOUR_LINE.slice(1)]] });
  }
  groups.push({ title: "Warranty", rows: [["Covers", WARRANTY]] });
  const labelWidth = 150;
  for (const group of groups) {
    const rowHeights = group.rows.map(([, value]) => Math.max(1, wrap(value, regular, 10, W - 2 * M - labelWidth - 10).length) * 13 + 10);
    const needed = 30 + rowHeights.reduce((a, b) => a + b, 0);
    if (y - needed < 90) {
      footer(page, regular, contact);
      page = doc.addPage([W, H]);
      page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: CREAM });
      y = H - M - 10;
    }
    page.drawText(plain(group.title.toUpperCase()), { x: M, y, size: 9, font: bold, color: ACCENT });
    y -= 10;
    group.rows.forEach(([label, value], index) => {
      page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: LINE });
      const lines = wrap(value, regular, 10, W - 2 * M - labelWidth - 10);
      page.drawText(plain(label), { x: M, y: y - 15, size: 10, font: bold, color: INK });
      lines.forEach((line, n) => page.drawText(line, { x: M + labelWidth, y: y - 15 - n * 13, size: 10, font: regular, color: rgb(0.23, 0.16, 0.16) }));
      y -= rowHeights[index];
    });
    y -= 14;
  }
  footer(page, regular, contact);

  // App features (connected models)
  if (spec.app) {
    page = doc.addPage([W, H]);
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: CREAM });
    y = H - M - 10;
    page.drawText("The MRIGA app", { x: M, y, size: 26, font: serif, color: INK });
    y -= 20;
    page.drawText(plain(`${spec.name} connects to your phone. ${APP_FEATURES.length} things you can do:`), { x: M, y, size: 11, font: regular, color: MUTED });
    y -= 26;
    const colWidth = (W - 2 * M - 20) / 2;
    const top = y;
    APP_FEATURES.forEach((feature, index) => {
      const col = index < Math.ceil(APP_FEATURES.length / 2) ? 0 : 1;
      if (index === Math.ceil(APP_FEATURES.length / 2)) y = top;
      const x = M + col * (colWidth + 20);
      page.drawCircle({ x: x + 9, y: y - 4, size: 9, color: ACCENT });
      const num = String(index + 1);
      page.drawText(num, { x: x + 9 - bold.widthOfTextAtSize(num, 8) / 2, y: y - 7, size: 8, font: bold, color: WHITE });
      page.drawText(plain(feature.title), { x: x + 26, y: y - 7, size: 10.5, font: bold, color: INK });
      const lines = wrap(feature.text, regular, 9, colWidth - 28);
      lines.forEach((line, n) => page.drawText(line, { x: x + 26, y: y - 21 - n * 11, size: 9, font: regular, color: MUTED }));
      y -= 30 + lines.length * 11;
    });
    footer(page, regular, contact);
  }

  const bytes = await doc.save();
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="MRIGA-${spec.name}-catalogue.pdf"`,
      "Cache-Control": CACHE,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
