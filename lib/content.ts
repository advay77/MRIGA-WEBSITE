import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { CONTENT_FIELDS, contentDefaults, type ContentKey, type SiteContent } from "@/lib/site-copy";

export const SITE_CONTENT_TAG = "site-content";

const KNOWN = new Set<string>(CONTENT_FIELDS.map((field) => field.key));

async function readSiteContent(): Promise<SiteContent> {
  const content = contentDefaults();
  try {
    const rows = await prisma.siteSetting.findMany({ select: { key: true, value: true } });
    for (const row of rows) {
      if (KNOWN.has(row.key) && row.value.trim()) content[row.key as ContentKey] = row.value;
    }
  } catch {
    console.error("site content could not be read");
  }
  return content;
}

// Shared across requests. The admin save calls updateTag(SITE_CONTENT_TAG) so edits show at once;
// the 5-minute revalidate is only a safety net if a read ever fell back to defaults.
export const getSiteContent = unstable_cache(readSiteContent, ["site-content"], {
  tags: [SITE_CONTENT_TAG],
  revalidate: 300,
});
