import { getSiteContent } from "@/lib/content";
import { SiteContentProvider } from "@/components/site-content";
import { SiteShell } from "@/components/site-shell";

export async function SiteFrame({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  return (
    <SiteContentProvider value={content}>
      <SiteShell>{children}</SiteShell>
    </SiteContentProvider>
  );
}
