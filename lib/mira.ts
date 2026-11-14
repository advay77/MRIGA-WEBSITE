export const INSTAGRAM = "https://www.instagram.com/ridemriga/";

export const MIRA_COLOURS = [
  { id: "pink", name: "Pink", swatch: "#E7A0B8", wash: "#F8E8EF", src: "/mira/pink.png" },
  { id: "orange", name: "Orange", swatch: "#E36A2C", wash: "#FBE4D4", src: "/mira/orange.png" },
  { id: "beige", name: "Brown Beige", swatch: "#C4A484", wash: "#F6EBDD", src: "/mira/beige.png" },
] as const;

export type MiraColourId = (typeof MIRA_COLOURS)[number]["id"];
