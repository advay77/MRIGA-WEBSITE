// Vercel rejects request bodies over 4.5 MB before our code runs, so every upload path
// keeps the whole request under that. Larger files need direct-to-storage uploads.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "4MB";

type SniffedType = "image/png" | "image/jpeg" | "image/webp";

// Trust the file's bytes, never its name or the browser-supplied type.
export function sniff(bytes: Uint8Array): SniffedType | null {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "image/webp";
  return null;
}

export function safeFileName(name: string, fallback: string) {
  const base = name.split(/[/\\]/).pop() || fallback;
  return base.replace(/[^\w.\- ]+/g, "_").slice(0, 80) || fallback;
}

export async function readUpload(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return { bytes, mime: sniff(bytes) };
}
