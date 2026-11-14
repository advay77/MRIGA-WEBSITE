import { getSession } from "@/lib/auth";
import { SiteShell } from "@/components/site-shell";

export async function SiteFrame({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session ? { name: session.user.name, role: session.user.role } : null;
  return <SiteShell user={user}>{children}</SiteShell>;
}
