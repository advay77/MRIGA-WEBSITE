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
  { id: "founder-ashish", label: "Ashish Jain", group: "founders", fallback: "founders/ashish.jpg" },
  { id: "founder-jiten", label: "Jiten Jain", group: "founders", fallback: "founders/jiten.jpg" },
  { id: "mira-pink", label: "Pink · 1", group: "mira", fallback: "mira/pink.png" },
  { id: "mira-pink-2", label: "Pink · 2", group: "mira", fallback: "mira/pink-2.png" },
  { id: "mira-pink-3", label: "Pink · 3", group: "mira", fallback: "mira/pink-3.png" },
  { id: "mira-orange", label: "Orange", group: "mira", fallback: "mira/orange.png" },
  { id: "mira-beige", label: "Brown beige · 1", group: "mira", fallback: "mira/beige.png" },
  { id: "mira-beige-2", label: "Brown beige · 2", group: "mira", fallback: "mira/beige-2.png" },
  { id: "mira-silver", label: "Silver · 1", group: "mira", fallback: "mira/silver.jpg" },
  { id: "mira-silver-2", label: "Silver · 2", group: "mira", fallback: "mira/silver-2.jpg" },
  { id: "mira-grey", label: "Grey", group: "mira", fallback: "mira/grey.jpg" },
  { id: "mira-cream", label: "Cream", group: "mira", fallback: "mira/cream.jpg" },
  // RIVA and VIRA galleries: photo 1 is the cover (Home, Explore, PDF catalogue). A slot whose
  // fallback is the logo stays hidden on the site until a photo is uploaded into it.
  { id: "riva", label: "Grey · 1 · cover", group: "riva", fallback: "riva/grey-front.jpg" },
  { id: "riva-2", label: "Grey · 2", group: "riva", fallback: "riva/grey-side.jpg" },
  { id: "riva-3", label: "Grey · 3", group: "riva", fallback: "riva/grey-2.jpg" },
  { id: "riva-4", label: "Silver · 1", group: "riva", fallback: "riva/silver-rear.jpg" },
  { id: "riva-5", label: "Silver · 2", group: "riva", fallback: "riva/ride.jpg" },
  { id: "riva-6", label: "Silver · 3", group: "riva", fallback: "riva/panel.jpg" },
  { id: "riva-7", label: "Silver · 4", group: "riva", fallback: "logo.png" },
  { id: "riva-8", label: "Light blue · 1", group: "riva", fallback: "riva/blue.jpg" },
  { id: "riva-9", label: "Light blue · 2", group: "riva", fallback: "riva/blue-2.jpg" },
  { id: "riva-10", label: "Cream · 1", group: "riva", fallback: "riva/cream-rear.jpg" },
  { id: "riva-11", label: "Cream · 2", group: "riva", fallback: "riva/cream-side.jpg" },
  { id: "riva-12", label: "Cream · 3", group: "riva", fallback: "riva/cream-wheel.jpg" },
  { id: "riva-13", label: "Cream · 4", group: "riva", fallback: "riva/cream-wheel-2.jpg" },
  { id: "riva-14", label: "Cream · 5", group: "riva", fallback: "riva/cream.jpg" },
  { id: "riva-15", label: "Cream · 6", group: "riva", fallback: "riva/cream-front.jpg" },
  { id: "vira", label: "Light blue · 1", group: "vira", fallback: "vira/blue.jpg" },
  { id: "vira-2", label: "Light blue · 2", group: "vira", fallback: "vira/blue-2.jpg" },
  { id: "vira-3", label: "White · 1", group: "vira", fallback: "vira/white.jpg" },
  { id: "vira-4", label: "White · 2", group: "vira", fallback: "vira/white-2.jpg" },
  { id: "vira-5", label: "Grey", group: "vira", fallback: "vira/grey.jpg" },
  { id: "vira-6", label: "Black · 1", group: "vira", fallback: "vira/black.jpg" },
  { id: "vira-7", label: "Black · 2", group: "vira", fallback: "vira/black-2.jpg" },
] as const;

// Groups shown in the admin Photos section. Model galleries (mira, riva, vira) live in Models.
export const PHOTO_GROUPS = [
  { id: "brand", title: "Brand", note: "The mark in the navigation and footer." },
  { id: "founders", title: "Founders", note: "Passport-style portraits on the About page. Upload a tall photo (about 2:3) to replace one." },
] as const;

export function mediaSlot(id: string) {
  return MEDIA_SLOTS.find((slot) => slot.id === id) ?? null;
}
