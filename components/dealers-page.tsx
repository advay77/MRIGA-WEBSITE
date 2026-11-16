"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { submitDealerApplication } from "@/lib/actions";
import { useSiteContent } from "@/components/site-content";
import { SEND_FAILED, sendWithTurnstile, Turnstile } from "@/components/turnstile";
import { WhatsAppButton } from "@/components/whatsapp-button";

const MODELS = [
  { key: "MIRA", sub: "Available now" },
  { key: "RIVA", sub: "Coming soon" },
  { key: "VIRA", sub: "Coming soon" },
] as const;

type ModelKey = (typeof MODELS)[number]["key"];
type Sent = { who: string; reference: string; location: string; model: ModelKey; name: string };

export function DealersPage() {
  const content = useSiteContent();
  const [model, setModel] = useState<ModelKey>("MIRA");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sent, setSent] = useState<Sent | null>(null);
  const [check, setCheck] = useState(0);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setErr("");
    const values = new FormData(form);
    const result = await sendWithTurnstile(form, (data) => data.set("model", model), submitDealerApplication, () => setCheck((value) => value + 1));
    setBusy(false);
    if (!result?.ok) {
      setErr(result?.error || SEND_FAILED);
      return;
    }
    setSent({ who: result.who, reference: result.reference, model, name: String(values.get("name") || ""), location: String(values.get("location") || "") });
  }

  return (
    <main className="page">
      <section className="phead center">
        <div className="wrap">
          <span className="eyebrow"><span className="dot" />Dealers</span>
          <h1 className="h1 mixed">Sell MRIGA.</h1>
          <p className="lead">Want to stock MRIGA scooters in your showroom? Leave four details and our team will call you. The Rohini showroom is {content.address}</p>
          <div className="cta-row"><Link href="/login" className="btn btn-g">Retailer login</Link></div>
        </div>
      </section>
      <section className="sec" id="apply">
        <div className="wrap">
          <div className="card formcard dealer-card">
            {sent ? (
              <div className="success">
                <h2 className="h2" style={{ margin: 0 }}>Thank you, {sent.who}.</h2>
                <p className="sub">Your reference is <b>{sent.reference}</b>. Our team will call you soon about {sent.model} for {sent.location}.</p>
                <div className="cta-row" style={{ justifyContent: "center" }}>
                  <WhatsAppButton message={`Hi MRIGA, I want to become a dealer. Reference ${sent.reference}. Name: ${sent.name}. Location: ${sent.location}. Model: ${sent.model}.`}>
                    Continue on WhatsApp
                  </WhatsAppButton>
                  <button className="btn btn-g" onClick={() => { setSent(null); setErr(""); }}>Send another enquiry</button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="dealer-form" noValidate>
                <div>
                  <h2 className="h2" style={{ margin: "0 0 6px" }}>Become a dealer</h2>
                  <p className="sub" style={{ margin: 0 }}>Takes under a minute. No documents needed now.</p>
                </div>
                <div className="fld">
                  <label className="lbl" htmlFor="d-name">Your name</label>
                  <input id="d-name" name="name" className="plain-in" required autoComplete="name" placeholder="Full name" maxLength={80} />
                </div>
                <div className="fld">
                  <label className="lbl" htmlFor="d-loc">Location</label>
                  <input id="d-loc" name="location" className="plain-in" required autoComplete="address-level2" placeholder="City or area, e.g. Pitampura, Delhi" maxLength={120} />
                </div>
                <div className="fld">
                  <label className="lbl" htmlFor="d-phone">Phone number</label>
                  <input id="d-phone" name="phone" className="plain-in" required inputMode="tel" autoComplete="tel" placeholder="+91 98765 43210" maxLength={24} />
                </div>
                <div className="fld">
                  <span className="lbl" id="d-model">Which model</span>
                  <div className="model-pick" role="radiogroup" aria-labelledby="d-model">
                    {MODELS.map((item) => (
                      <button type="button" role="radio" key={item.key} aria-label={`${item.key}, ${item.sub}`} aria-checked={model === item.key} className={model === item.key ? "on" : undefined} onClick={() => setModel(item.key)}>
                        <b>{item.key}</b>
                        <small>{item.sub}</small>
                      </button>
                    ))}
                  </div>
                </div>
                <Turnstile key={check} action="dealer" />
                {err ? <p className="err" role="alert">{err}</p> : null}
                <button type="submit" className="btn btn-p btn-block" disabled={busy}>
                  {busy ? <span className="spinner" /> : null}
                  {busy ? "Sending…" : "Send enquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
