// Follow-up states for the two kinds of lead. Stored as plain strings in the database;
// this file is the only list of allowed values.

export const RIDE_STATUSES = [
  { id: "NEW", label: "New", tone: "new" },
  { id: "CONTACTED", label: "Contacted", tone: "wait" },
  { id: "COMPLETED", label: "Ride done", tone: "ok" },
  { id: "CANCELLED", label: "Cancelled", tone: "off" },
] as const;

export const DEALER_STATUSES = [
  { id: "NEW", label: "New", tone: "new" },
  { id: "CONTACTED", label: "Contacted", tone: "wait" },
  { id: "APPROVED", label: "Approved", tone: "ok" },
  { id: "REJECTED", label: "Rejected", tone: "off" },
] as const;

export type LeadKind = "ride" | "dealer";
type Status = { readonly id: string; readonly label: string; readonly tone: string };

export function statusesFor(kind: LeadKind): readonly Status[] {
  return kind === "ride" ? RIDE_STATUSES : DEALER_STATUSES;
}

export function statusInfo(kind: LeadKind, id: string): Status {
  return statusesFor(kind).find((status) => status.id === id) ?? statusesFor(kind)[0];
}

export function isStatus(kind: LeadKind, id: unknown): id is string {
  return typeof id === "string" && statusesFor(kind).some((status) => status.id === id);
}

export const NOTE_MAX = 500;
