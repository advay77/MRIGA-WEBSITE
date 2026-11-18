export const RIVA_COLOURS = [
  { id: "grey", name: "Grey", swatch: "#9AA09A", wash: "#E7E8E4", shots: ["/media/riva", "/media/riva-2", "/media/riva-3"] },
  { id: "silver", name: "Silver", swatch: "#C8CCD2", wash: "#F1F2F4", shots: ["/media/riva-4", "/media/riva-5", "/media/riva-6", "/media/riva-7"] },
  { id: "blue", name: "Light blue", swatch: "#C9D4DC", wash: "#EEF2F5", shots: ["/media/riva-8", "/media/riva-9"] },
  { id: "cream", name: "Cream", swatch: "#E4D3BE", wash: "#F7F1E8", shots: ["/media/riva-10", "/media/riva-11", "/media/riva-12", "/media/riva-13", "/media/riva-14", "/media/riva-15"] },
] as const;

export const RIVA_ALL = {
  id: "all",
  name: "All",
  swatch: "#2C2C2E",
  wash: "#F4F2EF",
  shots: RIVA_COLOURS.flatMap((colour) => colour.shots),
} as const;

export const RIVA_COLOUR_LINE = "grey, silver, light blue and cream";

export type RivaColourId = (typeof RIVA_COLOURS)[number]["id"];
