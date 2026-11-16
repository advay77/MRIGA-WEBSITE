export const CONTENT_FIELDS = [
  { key: "phone", label: "Phone", fallback: "+91 73030 42004" },
  { key: "phoneHref", label: "Phone link (digits)", fallback: "+917303042004" },
  { key: "whatsapp", label: "WhatsApp number", fallback: "917303042004" },
  { key: "email", label: "Contact email", fallback: "" },
  { key: "address", label: "Showroom address", fallback: "E-1/93, Sector-7, Rohini, New Delhi 110085, near M2K Rohini." },
  { key: "instagram", label: "Instagram URL", fallback: "https://www.instagram.com/ridemriga/" },
  { key: "heroLead", label: "Home introduction", fallback: "MIRA by MRIGA. Smart mobility. Sustainable future. See it in pink, orange, and brown beige at the Rohini showroom." },
  { key: "aboutLead", label: "About introduction", fallback: "MRIGA is an electric-scooter company from Rohini, New Delhi. MIRA is the first model." },
  { key: "lithiumPrice", label: "MIRA lithium price", fallback: "₹75,000" },
  { key: "lithiumDetail", label: "MIRA lithium detail", fallback: "Up to 85 km on a single charge with the LiFePO4 battery. 3-year warranty on the motor, controller, battery and charger." },
  { key: "leadPrice", label: "MIRA lead-acid price", fallback: "₹62,000" },
  { key: "leadDetail", label: "MIRA lead-acid detail", fallback: "65–70 km on a single charge with the SLA battery. 1-year warranty on the motor, controller, battery and charger." },
  { key: "founder1", label: "Founder 1", fallback: "Pankaj Jain" },
  { key: "founder2", label: "Founder 2", fallback: "Ashish Jain" },
  { key: "founder3", label: "Founder 3", fallback: "Jiten Jain" },
] as const;

export type ContentKey = (typeof CONTENT_FIELDS)[number]["key"];
export type SiteContent = Record<ContentKey, string>;

export function contentDefaults(): SiteContent {
  return Object.fromEntries(CONTENT_FIELDS.map((field) => [field.key, field.fallback])) as SiteContent;
}

export const CONTENT_GROUPS = [
  { id: "showroom", title: "Showroom", note: "Phone, WhatsApp, address, and Instagram. These appear in the footer, on Contact, and on the WhatsApp buttons.", keys: ["phone", "phoneHref", "whatsapp", "email", "address", "instagram"] },
  { id: "pages", title: "Home and About", note: "The introduction on the home page and the About page.", keys: ["heroLead", "aboutLead"] },
  { id: "mira", title: "MIRA", note: "Prices and warranty lines on the home page, Explore, and the MIRA page.", keys: ["lithiumPrice", "lithiumDetail", "leadPrice", "leadDetail"] },
  { id: "founders", title: "Founder names", note: "Names on About and Contact. Photos are changed in the Photos section.", keys: ["founder1", "founder2", "founder3"] },
] as const;

export const MEDIA_SLOTS = [
  { id: "logo", label: "Logo", group: "brand", fallback: "logo.png" },
  { id: "founder-pankaj", label: "Pankaj Jain", group: "founders", fallback: "founders/pankaj.jpg" },
  { id: "founder-ashish", label: "Ashish Jain", group: "founders", fallback: "logo.png" },
  { id: "founder-jiten", label: "Jiten Jain", group: "founders", fallback: "logo.png" },
  { id: "mira-pink", label: "Pink · 1", group: "mira", fallback: "mira/pink.png" },
  { id: "mira-pink-2", label: "Pink · 2", group: "mira", fallback: "mira/pink-2.png" },
  { id: "mira-pink-3", label: "Pink · 3", group: "mira", fallback: "mira/pink-3.png" },
  { id: "mira-orange", label: "Orange", group: "mira", fallback: "mira/orange.png" },
  { id: "mira-beige", label: "Brown beige · 1", group: "mira", fallback: "mira/beige.png" },
  { id: "mira-beige-2", label: "Brown beige · 2", group: "mira", fallback: "mira/beige-2.png" },
  { id: "riva", label: "RIVA", group: "models", fallback: "logo.png" },
  { id: "vira", label: "VIRA", group: "models", fallback: "logo.png" },
] as const;

export const PHOTO_GROUPS = [
  { id: "brand", title: "Brand", note: "The mark in the navigation and footer." },
  { id: "founders", title: "Founders", note: "Portraits on the About page. A missing photo shows the logo until you upload one." },
  { id: "models", title: "RIVA and VIRA", note: "Main photo for each model. It shows on its page and on the cover of its PDF catalogue." },
  { id: "mira", title: "MIRA colours", note: "Pink, orange, and brown beige. These are the shots on Home, Explore, and the MIRA page." },
] as const;

export function mediaSlot(id: string) {
  return MEDIA_SLOTS.find((slot) => slot.id === id) ?? null;
}
