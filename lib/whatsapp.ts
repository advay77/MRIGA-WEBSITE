// WhatsApp click-to-chat links (https://wa.me/<digits>?text=...). No API, no account needed:
// the link opens the WhatsApp app on phones and WhatsApp Web on desktop, with the message typed in.

export function whatsappDigits(number: string) {
  const digits = number.replace(/\D/g, "");
  // A bare 10-digit Indian mobile needs the country code for wa.me.
  return digits.length === 10 ? `91${digits}` : digits;
}

export function whatsappLink(number: string, message: string) {
  const digits = whatsappDigits(number);
  if (digits.length < 11) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message.slice(0, 600))}`;
}
