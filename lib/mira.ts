export const INSTAGRAM = "https://www.instagram.com/ridemriga/";

export const MIRA_COLOURS = [
  { id: "pink", name: "Pink", swatch: "#E7A0B8", wash: "#F8E8EF", shots: ["/media/mira-pink", "/media/mira-pink-2", "/media/mira-pink-3"] },
  { id: "orange", name: "Orange", swatch: "#E36A2C", wash: "#FBE4D4", shots: ["/media/mira-orange"] },
  { id: "beige", name: "Brown Beige", swatch: "#C4A484", wash: "#F6EBDD", shots: ["/media/mira-beige", "/media/mira-beige-2"] },
] as const;

export type MiraColourId = (typeof MIRA_COLOURS)[number]["id"];
