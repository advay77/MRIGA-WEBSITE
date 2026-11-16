import type { Metadata } from "next";
import { SiteFrame } from "@/components/site-frame";
import { LoginPanel } from "@/components/login-panel";
import { getSession } from "@/lib/auth";
import { googleConfigured } from "@/lib/google";
import { safeNext } from "@/lib/validators";

export const metadata: Metadata = { title: "MRIGA — Customer Lounge Sign In" };
export const dynamic = "force-dynamic";

const NOTICES: Record<string, string> = {
  google_config: "Google sign-in is not available yet. Sign in with your passkey.",
  google_password: "That email already has a MRIGA account. Sign in with its passkey.",
  google: "Google sign-in could not be completed. Try again, or use your passkey.",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; tab?: string }> }) {
  const params = await searchParams;
  const session = await getSession();
  const role = session?.user.role;
  const google = googleConfigured();
  return (
    <SiteFrame>
      <LoginPanel
        audience="user"
        user={role === "MEMBER" ? { name: session!.user.name, role } : null}
        nextPath={safeNext(typeof params.next === "string" ? params.next : "")}
        startTab={params.tab === "up" ? "up" : "in"}
        notice={NOTICES[params.error ?? ""] ?? ""}
        google={google}
      />
      <LoginPanel
        audience="retailer"
        user={role === "RETAILER" ? { name: session!.user.name, role } : null}
        nextPath="/account"
        startTab="in"
        google={false}
      />
    </SiteFrame>
  );
}
