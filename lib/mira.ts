
export const MIRA_COLOURS = [
  { id: "pink", name: "Pink", swatch: "#E7A0B8", wash: "#F8E8EF", shots: ["/media/mira-pink", "/media/mira-pink-2", "/media/mira-pink-3"] },
  { id: "orange", name: "Orange", swatch: "#E36A2C", wash: "#FBE4D4", shots: ["/media/mira-orange"] },
  { id: "beige", name: "Brown Beige", swatch: "#C4A484", wash: "#F6EBDD", shots: ["/media/mira-beige", "/media/mira-beige-2"] },
  { id: "silver", name: "Silver", swatch: "#C5C8CE", wash: "#F2F3F5", shots: ["/media/mira-silver", "/media/mira-silver-2"] },
  { id: "grey", name: "Grey", swatch: "#8B9086", wash: "#E7E8E3", shots: ["/media/mira-grey"] },
  { id: "cream", name: "Cream", swatch: "#E8DCC8", wash: "#F8F2E8", shots: ["/media/mira-cream"] },
] as const;

export const MIRA_COLOUR_LINE = "pink, orange, brown beige, silver, grey and cream";

export type MiraColourId = (typeof MIRA_COLOURS)[number]["id"];
