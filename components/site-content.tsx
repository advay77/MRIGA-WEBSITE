"use client";

import { createContext, useContext } from "react";
import { contentDefaults, type SiteContent } from "@/lib/site-copy";
import { SPECS, type ModelId, type ModelSpec } from "@/lib/specs";

type ModelsData = { specs: Record<ModelId, ModelSpec>; photos: Record<ModelId, string[]> };

const SiteContentContext = createContext<SiteContent>(contentDefaults());
const ModelsContext = createContext<ModelsData>({ specs: SPECS, photos: { mira: [], riva: [], vira: [] } });

export function SiteContentProvider({ value, models, children }: { value: SiteContent; models: ModelsData; children: React.ReactNode }) {
  return (
    <SiteContentContext.Provider value={value}>
      <ModelsContext.Provider value={models}>{children}</ModelsContext.Provider>
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}

// Model text, specs and which gallery photos exist, as edited in the admin Models section.
export function useModels() {
  return useContext(ModelsContext);
}
