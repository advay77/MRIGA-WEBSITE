export const VIRA_COLOURS = [
  { id: "blue", name: "Light blue", swatch: "#C5D4DE", wash: "#EEF3F6", shots: ["/media/vira", "/media/vira-2"] },
  { id: "white", name: "White", swatch: "#F4F5F6", wash: "#F7F7F8", shots: ["/media/vira-3", "/media/vira-4"] },
  { id: "grey", name: "Grey", swatch: "#9AA0A6", wash: "#E8E9EB", shots: ["/media/vira-5"] },
  { id: "black", name: "Black", swatch: "#1C1C1E", wash: "#E6E6E8", shots: ["/media/vira-6", "/media/vira-7"] },
] as const;

export const VIRA_COLOUR_LINE = "light blue, white, grey and black";

export type ViraColourId = (typeof VIRA_COLOURS)[number]["id"];
