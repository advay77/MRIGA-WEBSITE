"use client";

import { useState } from "react";

// Download the model's PDF catalogue, or share it: the file itself where the phone supports it
// (WhatsApp, email, AirDrop...), otherwise a link to it.
export function CatalogueActions({ model, name }: { model: string; name: string }) {
  const [note, setNote] = useState("");
  const href = `/catalogue/${model}`;
  const fileName = `MRIGA-${name}-catalogue.pdf`;

  async function share() {
    setNote("");
    const url = new URL(href, window.location.origin).toString();
    const text = `MRIGA ${name} catalogue: specifications, features and showroom details.`;
    try {
      if (navigator.share) {
        const response = await fetch(href);
        const file = new File([await response.blob()], fileName, { type: "application/pdf" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `MRIGA ${name}`, text });
          return;
        }
        await navigator.share({ title: `MRIGA ${name}`, text, url });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
    // Desktop fallback: hand the link to WhatsApp, which most people here share with.
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank", "noopener");
    setNote("Opened WhatsApp with the catalogue link.");
  }

  return (
    <div className="cat-actions">
      <a className="btn btn-d" href={href} download={fileName}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
        Download {name} catalogue
      </a>
      <button type="button" className="btn btn-g" onClick={share}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>
        Share
      </button>
      {note ? <small className="cat-note" role="status">{note}</small> : null}
    </div>
  );
}
