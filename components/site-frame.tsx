import { getSession } from "@/lib/auth";
import { getSiteContent } from "@/lib/content";
import { SiteContentProvider } from "@/components/site-content";
import { SiteShell } from "@/components/site-shell";

export async function SiteFrame({ children }: { children: React.ReactNode }) {
  const [session, content] = await Promise.all([getSession(), getSiteContent()]);
  const user = session ? { name: session.user.name, role: session.user.role } : null;
  return (
    <SiteContentProvider value={content}>
      <SiteShell user={user}>{children}</SiteShell>
    </SiteContentProvider>
  );
}
