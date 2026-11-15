"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { submitDealerApplication } from "@/lib/actions";

const PICKS = [
  { key: "mira", name: "MIRA", sub: "Star product" },
  { key: "riva", name: "RIVA", sub: "Specifications next" },
  { key: "vira", name: "VIRA", sub: "Specifications next" },
] as const;

type PickKey = (typeof PICKS)[number]["key"];

export function DealersPage() {
  const [picks, setPicks] = useState<Record<PickKey, boolean>>({ mira: true, riva: false, vira: false });
  const [names, setNames] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [who, setWho] = useState("");
  const [refCode, setRefCode] = useState("");
  const fileTitle = names.length ? `${names.length} ${names.length === 1 ? "file attached" : "files attached"}` : "Upload GST or showroom photos";
  const fileSub = names.length ? names.join(", ") : "PDF, JPG, or PNG. Up to 3 files, 4MB each.";

  function onPickFile(event: ChangeEvent<HTMLInputElement>) {
    setNames(Array.from(event.target.files || []).map((file) => file.name));
    setErr("");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!Object.values(picks).some(Boolean)) {
      setErr("Please select at least one model.");
      return;
    }
    const data = new FormData(event.currentTarget);
    data.set("models", PICKS.filter((item) => picks[item.key]).map((item) => item.key).join(","));
    setBusy(true);
    setErr("");
    const result = await submitDealerApplication(data);
    setBusy(false);
    if (!result.ok) {
      setErr(result.error);
      return;
    }
    setWho(result.who);
    setRefCode(result.reference);
    setDone(true);
  }

  return (
    <main className="page">
      <section className="phead">
        <div className="wrap">
          <span className="eyebrow"><span className="dot" />Dealers</span>
          <h1 className="h1 mixed">Sell MRIGA.</h1>
          <p className="lead">Apply to stock MIRA, and later RIVA and VIRA, from your own showroom. The Rohini showroom is E-1/93, Sector-7, New Delhi 110085.</p>
          <a href="/retailer" className="btn btn-g">Retailer login</a>
        </div>
      </section>
      <section className="sec" id="apply">
        <div className="wrap">
          <h2 className="h2">Dealer application</h2>
          <div className="card formcard">
            {done ? (
              <div className="success">
                <h2 className="h2" style={{ margin: 0 }}>Thank you, {who}.</h2>
                <p className="sub">Your reference is <b>{refCode}</b>. The team will call you about the application.</p>
                <button className="btn btn-g" onClick={() => { setDone(false); setNames([]); setErr(""); }}>Submit another application</button>
              </div>
            ) : (
              <form onSubmit={onSubmit}>
                <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <div className="fsec">
                  <div className="fsec-h"><b>A</b><h3>Signatory</h3></div>
                  <div className="fgrid">
                    <div className="fld"><label className="lbl" htmlFor="d-name">Full name *</label><input id="d-name" name="name" className="plain-in" required autoComplete="name" /></div>
                    <div className="fld"><label className="lbl" htmlFor="d-mob">Mobile *</label><input id="d-mob" name="mobile" className="plain-in" required inputMode="tel" /></div>
                    <div className="fld"><label className="lbl" htmlFor="d-mail">Business email *</label><input id="d-mail" name="email" type="email" className="plain-in" required /></div>
                    <div className="fld"><label className="lbl" htmlFor="d-title">Title *</label><input id="d-title" name="title" className="plain-in" required /></div>
                  </div>
                </div>
                <div className="fsec">
                  <div className="fsec-h"><b>B</b><h3>Business</h3></div>
                  <div className="fgrid">
                    <div className="fld"><label className="lbl" htmlFor="d-ent">Registered entity *</label><input id="d-ent" name="entity" className="plain-in" required /></div>
                    <div className="fld"><label className="lbl" htmlFor="d-con">Constitution *</label><select id="d-con" name="constitution" className="plain-in" required><option value="">Select</option><option>Private Limited</option><option>LLP</option><option>Partnership</option><option>Proprietorship</option></select></div>
                    <div className="fld"><label className="lbl" htmlFor="d-yrs">Years operating *</label><select id="d-yrs" name="years" className="plain-in" defaultValue="3 – 7 Years"><option>0 – 3 Years</option><option>3 – 7 Years</option><option>7 – 15 Years</option><option>15+ Years</option></select></div>
                    <div className="fld"><label className="lbl" htmlFor="d-gst">GSTIN *</label><input id="d-gst" name="gst" className="plain-in" required minLength={15} maxLength={15} /></div>
                  </div>
                </div>
                <div className="fsec">
                  <div className="fsec-h"><b>C</b><h3>Showroom</h3></div>
                  <div className="fgrid">
                    <div className="fld"><label className="lbl" htmlFor="d-city">City *</label><input id="d-city" name="city" className="plain-in" required /></div>
                    <div className="fld"><label className="lbl" htmlFor="d-area">Carpet area *</label><select id="d-area" name="area" className="plain-in" defaultValue="1,200 - 2,500 sq ft"><option>Under 1,200 sq ft</option><option>1,200 - 2,500 sq ft</option><option>2,500 sq ft or more</option></select></div>
                    <div className="fld"><span className="lbl">Road frontage *</span><div className="radios"><label><input type="radio" name="frontage" value="yes" defaultChecked /> Yes</label><label><input type="radio" name="frontage" value="pending" /> Still being arranged</label></div></div>
                    <div className="fld"><label className="lbl" htmlFor="d-brands">Other brands you sell</label><input id="d-brands" name="brands" className="plain-in" /></div>
                  </div>
                </div>
                <div className="fsec">
                  <div className="fsec-h"><b>D</b><h3>Models</h3></div>
                  <div className="picks">
                    {PICKS.map((item) => (
                      <button type="button" key={item.key} className={picks[item.key] ? "pick on" : "pick"} aria-pressed={picks[item.key]} onClick={() => setPicks((current) => ({ ...current, [item.key]: !current[item.key] }))}>
                        <span className="box"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
                        <span><b>{item.name}</b><small>{item.sub}</small></span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="fsec">
                  <div className="fsec-h"><b>E</b><h3>Plan</h3></div>
                  <div className="fgrid">
                    <div className="fld"><label className="lbl" htmlFor="d-liq">Investment you can put in *</label><select id="d-liq" name="liquidity" className="plain-in" defaultValue="₹25 lakh – ₹75 lakh"><option>Under ₹25 lakh</option><option>₹25 lakh – ₹75 lakh</option><option>Above ₹75 lakh</option></select></div>
                    <div className="fld"><label className="lbl" htmlFor="d-tl">When you want to open *</label><select id="d-tl" name="timeline" className="plain-in" defaultValue="45 – 60 Days"><option>Under 45 Days</option><option>45 – 60 Days</option><option>60 – 90 Days</option></select></div>
                  </div>
                  <div className="upload">
                    <span><b>{fileTitle}</b><small>{fileSub}</small></span>
                    <label className="btn btn-g btn-sm" htmlFor="d-file">Attach files</label>
                    <input id="d-file" name="credentials" type="file" className="file-in" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={onPickFile} />
                  </div>
                </div>
                <label className="certify"><input type="checkbox" name="certify" required /> I am an authorized signatory for this business.</label>
                {err ? <p className="err" role="alert">{err}</p> : null}
                <button type="submit" className="btn btn-p btn-block" disabled={busy}>{busy ? "Submitting…" : "Submit application"}</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
