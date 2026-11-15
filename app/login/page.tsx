import type { Metadata } from "next";
import { SiteFrame } from "@/components/site-frame";
import { LoginPanel } from "@/components/login-panel";
import { ensureAdmin, getSession } from "@/lib/auth";
import { safeNext } from "@/lib/validators";

export const metadata: Metadata = { title: "MRIGA — Customer Lounge Sign In" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; tab?: string }> }) {
  await ensureAdmin();
  const params = await searchParams;
  const nextRaw = typeof params.next === "string" ? params.next : "";
  const session = await getSession();
  const notice = params.error === "google_config"
    ? "Google sign-in is connected in the site. Add the Google client id and secret, then try again."
    : params.error === "google_password"
      ? "That email already uses a passkey. Sign in with the passkey. Google is not linked to it."
      : params.error === "google"
        ? "Google sign-in could not be completed. Try again, or use your passkey."
        : "";
  return (
    <SiteFrame>
      <LoginPanel
        audience="user"
        user={session?.user.role === "MEMBER" ? { name: session.user.name, role: session.user.role } : null}
        nextPath={safeNext(nextRaw)}
        startTab={params.tab === "up" ? "up" : "in"}
        notice={notice}
      />
      <LoginPanel
        audience="retailer"
        user={session?.user.role === "RETAILER" ? { name: session.user.name, role: session.user.role } : null}
        nextPath="/retailer"
        startTab="in"
      />
    </SiteFrame>
  );
}
