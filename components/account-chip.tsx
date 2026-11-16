"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { initials } from "@/lib/initials";

export type Me = { name: string; role: "MEMBER" | "RETAILER"; email: string | null; phone: string | null };

const MeContext = createContext<Me | null>(null);

export function useMe() {
  return useContext(MeContext);
}

// Fetches the signed-in customer or retailer once per page change. Pages stay static on the CDN;
// only this small request is per-visitor.
export const AUTH_CHANGED = "mriga:auth-changed";

// Call after a sign-in, sign-up or sign-out so the header updates without a page change.
export function announceAuthChange() {
  window.dispatchEvent(new Event(AUTH_CHANGED));
}

export function MeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    let live = true;
    const load = () => {
      fetch("/api/me", { cache: "no-store", credentials: "same-origin" })
        .then((response) => (response.ok ? response.json() : { user: null }))
        .then((data: { user: Me | null }) => {
          if (live) setMe(data.user);
        })
        .catch(() => undefined);
    };
    load();
    window.addEventListener(AUTH_CHANGED, load);
    return () => {
      live = false;
      window.removeEventListener(AUTH_CHANGED, load);
    };
  }, [pathname]);
  return <MeContext.Provider value={me}>{children}</MeContext.Provider>;
}


// Header control: "Login" when signed out; the person's initials and first name when signed in.
export function AccountChip({ onNavigate, variant = "chip" }: { onNavigate?: () => void; variant?: "chip" | "link" }) {
  const me = useMe();
  if (!me) {
    return variant === "chip"
      ? <Link href="/login" className="btn btn-d btn-sm" onClick={onNavigate}>Login</Link>
      : <Link href="/login" onClick={onNavigate}>Login</Link>;
  }
  const first = me.name.split(/\s+/)[0] || "Account";
  if (variant === "link") return <Link href="/account" onClick={onNavigate}>My account</Link>;
  return (
    <Link href="/account" className="acct-chip" onClick={onNavigate} aria-label={`My account, signed in as ${me.name}`}>
      <span className="acct-avatar" aria-hidden="true">{initials(me.name)}</span>
      <span className="acct-name">{first}</span>
    </Link>
  );
}
