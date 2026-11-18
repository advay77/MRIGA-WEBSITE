"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
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

// Last known signed-in name and role, so the header shows the account at once on every page
// instead of flashing "Login" until /api/me answers. Only name and role; the server stays the
// source of truth and clears this the moment it says nobody is signed in.
const HINT_KEY = "mriga:me";

function readHintRaw() {
  try {
    return window.localStorage.getItem(HINT_KEY);
  } catch {
    return null;
  }
}

const noSubscribe = () => () => undefined;

function parseHint(raw: string | null): Me | null {
  try {
    if (!raw) return null;
    const hint = JSON.parse(raw) as { name?: unknown; role?: unknown };
    if (typeof hint.name !== "string" || (hint.role !== "MEMBER" && hint.role !== "RETAILER")) return null;
    return { name: hint.name.slice(0, 80), role: hint.role, email: null, phone: null };
  } catch {
    return null;
  }
}

function writeHint(me: Me | null) {
  try {
    if (me) window.localStorage.setItem(HINT_KEY, JSON.stringify({ name: me.name, role: me.role }));
    else window.localStorage.removeItem(HINT_KEY);
  } catch {
    // Private mode or blocked storage: the header just waits for /api/me.
  }
}

export function MeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [known, setKnown] = useState(false);
  // Read once on the client; the server render always starts signed out.
  const hintRaw = useSyncExternalStore(noSubscribe, readHintRaw, () => null);
  const hint = useMemo(() => parseHint(hintRaw), [hintRaw]);
  useEffect(() => {
    let live = true;
    const load = () => {
      fetch("/api/me", { cache: "no-store", credentials: "same-origin" })
        .then((response) => {
          // 503 or a network error: keep showing whoever was signed in rather than "Login".
          if (!response.ok) return undefined;
          return response.json() as Promise<{ user: Me | null }>;
        })
        .then((data) => {
          if (!live || !data) return;
          setMe(data.user);
          setKnown(true);
          writeHint(data.user);
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
  return <MeContext.Provider value={known ? me : me ?? hint}>{children}</MeContext.Provider>;
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
