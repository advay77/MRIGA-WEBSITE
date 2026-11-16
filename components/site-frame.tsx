import { getSiteContent } from "@/lib/content";
import { SiteContentProvider } from "@/components/site-content";
import { SiteShell } from "@/components/site-shell";
import { MeProvider } from "@/components/account-chip";

export async function SiteFrame({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  return (
    <SiteContentProvider value={content}>
      <MeProvider>
        <SiteShell>{children}</SiteShell>
      </MeProvider>
    </SiteContentProvider>
  );
}
