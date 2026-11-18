import { getSiteContent } from "@/lib/content";
import { getModels } from "@/lib/models";
import { SiteContentProvider } from "@/components/site-content";
import { SiteShell } from "@/components/site-shell";
import { MeProvider } from "@/components/account-chip";

export async function SiteFrame({ children }: { children: React.ReactNode }) {
  const [content, models] = await Promise.all([getSiteContent(), getModels()]);
  return (
    <SiteContentProvider value={content} models={models}>
      <MeProvider>
        <SiteShell>{children}</SiteShell>
      </MeProvider>
    </SiteContentProvider>
  );
}
