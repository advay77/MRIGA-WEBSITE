// Avatar letters: first and last name initials ("Advay Anand" -> "AA"), one shared rule for every avatar.
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "M";
}
