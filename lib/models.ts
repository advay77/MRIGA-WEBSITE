import { unstable_cache } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { SITE_CONTENT_TAG } from "@/lib/content";
import { MEDIA_SLOTS } from "@/lib/site-copy";
import { MODEL_IDS, SPECS, type ModelId, type ModelSpec } from "@/lib/specs";

// What the admin can change about a model. Stored as JSON in SiteSetting under "model:<id>";
// anything missing falls back to lib/specs.json, so a bad or partial row never breaks a page.
const short = (max: number) => z.string().trim().max(max);
export const modelOverrideSchema = z.object({
  status: short(40).min(1),
  tagline: short(120).min(1),
  summary: short(400).min(1),
  app: z.boolean(),
  highlights: z.array(z.object({ value: short(16).min(1), unit: short(10), label: short(40).min(1) })).min(1).max(6),
  groups: z.array(z.object({ title: short(60).min(1), rows: z.array(z.tuple([short(60).min(1), short(240).min(1)])).min(1).max(20) })).min(1).max(10),
});
export type ModelOverride = z.infer<typeof modelOverrideSchema>;

export const modelKey = (id: ModelId) => `model:${id}`;

export type ModelsData = { specs: Record<ModelId, ModelSpec>; photos: Record<ModelId, string[]> };

// Gallery slots for a model, in display order (lib/site-copy.ts MEDIA_SLOTS, group = model id).
export function modelSlots(id: ModelId) {
  return MEDIA_SLOTS.filter((slot) => slot.group === id);
}

async function readModels(): Promise<ModelsData> {
  const specs = { ...SPECS };
  const uploaded = new Set<string>();
  try {
    const [rows, assets] = await Promise.all([
      prisma.siteSetting.findMany({ where: { key: { startsWith: "model:" } }, select: { key: true, value: true } }),
      prisma.mediaAsset.findMany({ select: { slot: true } }),
    ]);
    for (const row of rows) {
      const id = row.key.slice("model:".length) as ModelId;
      if (!MODEL_IDS.includes(id)) continue;
      try {
        const parsed = modelOverrideSchema.safeParse(JSON.parse(row.value));
        if (parsed.success) specs[id] = { ...SPECS[id], ...parsed.data };
      } catch {
        console.error(`model text for ${id} is not valid JSON; using the defaults`);
      }
    }
    for (const asset of assets) uploaded.add(asset.slot);
  } catch {
    console.error("model content could not be read; using the defaults");
  }
  // MIRA always has built-in colour photos; RIVA and VIRA show only photos an admin uploaded
  // (or that ship in /public as a non-logo fallback).
  const photos = Object.fromEntries(
    MODEL_IDS.map((id) => [id, modelSlots(id).filter((slot) => id === "mira" || uploaded.has(slot.id) || slot.fallback !== "logo.png").map((slot) => slot.id)]),
  ) as Record<ModelId, string[]>;
  return { specs, photos };
}

// Same tag as the site text: every admin save (text or photo) refreshes the public pages at once.
export const getModels = unstable_cache(readModels, ["site-models"], { tags: [SITE_CONTENT_TAG], revalidate: 300 });
