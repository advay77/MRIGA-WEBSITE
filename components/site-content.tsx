"use client";

import { createContext, useContext } from "react";
import { contentDefaults, type SiteContent } from "@/lib/site-copy";

const SiteContentContext = createContext<SiteContent>(contentDefaults());

export function SiteContentProvider({ value, children }: { value: SiteContent; children: React.ReactNode }) {
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}
