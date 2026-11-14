export const INSTAGRAM = "https://www.instagram.com/ridemriga/";

export const MIRA_COLOURS = [
  { id: "pink", name: "Pink", swatch: "#E7A0B8", wash: "#F8E8EF", shots: ["/mira/pink.png", "/mira/pink-2.png", "/mira/pink-3.png"] },
  { id: "orange", name: "Orange", swatch: "#E36A2C", wash: "#FBE4D4", shots: ["/mira/orange.png"] },
  { id: "beige", name: "Brown Beige", swatch: "#C4A484", wash: "#F6EBDD", shots: ["/mira/beige.png", "/mira/beige-2.png"] },
] as const;

export type MiraColourId = (typeof MIRA_COLOURS)[number]["id"];
