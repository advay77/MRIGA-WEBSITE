import data from "@/lib/specs.json";

// One source for every model's specification: the model pages and the PDF catalogues both read it.
export type ModelId = "mira" | "riva" | "vira";
export type SpecGroup = { title: string; rows: [string, string][] };
export type ModelSpec = {
  name: string;
  status: string;
  tagline: string;
  summary: string;
  app: boolean;
  highlights: { value: string; unit: string; label: string }[];
  groups: SpecGroup[];
};

export const MODEL_IDS: ModelId[] = ["mira", "riva", "vira"];
export const SPECS = data.models as Record<ModelId, ModelSpec>;
export const APP_FEATURES = data.appFeatures as { title: string; text: string }[];
export const WARRANTY = data.warranty;

export function isModelId(value: string): value is ModelId {
  return (MODEL_IDS as string[]).includes(value);
}
