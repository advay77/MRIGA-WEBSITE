import { prisma } from "@/lib/db";
import { CONTENT_FIELDS, contentDefaults, type ContentKey, type SiteContent } from "@/lib/site-copy";

export async function getSiteContent(): Promise<SiteContent> {
  const content = contentDefaults();
  try {
    const rows = await prisma.siteSetting.findMany();
    for (const row of rows) {
      if ((CONTENT_FIELDS as readonly { key: string }[]).some((field) => field.key === row.key) && row.value.trim()) {
        content[row.key as ContentKey] = row.value;
      }
    }
  } catch {
    console.error("site content could not be read");
  }
  return content;
}
