import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return new Response("Not found", { status: 404 });
  }
  const { id } = await context.params;
  const file = await prisma.dealerFile.findUnique({ where: { id } });
  if (!file) return new Response("Not found", { status: 404 });
  const filename = file.filename.replace(/["\r\n]/g, "");
  return new Response(Buffer.from(file.bytes), {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
