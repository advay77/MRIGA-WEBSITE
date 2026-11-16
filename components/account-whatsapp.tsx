"use client";

import { WhatsAppButton } from "@/components/whatsapp-button";

export function AccountWhatsApp({ name }: { name: string }) {
  return <WhatsAppButton message={`Hi MRIGA, this is ${name}. I have a question about my account.`}>Help on WhatsApp</WhatsAppButton>;
}
