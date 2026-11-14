"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { submitDealerApplication } from "@/lib/actions";

const PICKS = [
  { key: "mira", name: "MIRA Urban Purist", sub: "Commuter Haute Couture" },
  { key: "riva", name: "RIVA Grand Tourer", sub: "Long-Range Sovereign" },
  { key: "vira", name: "VIRA Apex Corsa", sub: "High-Torque Performance" },
] as const;

type PickKey = (typeof PICKS)[number]["key"];

export function DealersPage() {
  const [picks, setPicks] = useState<Record<PickKey, boolean>>({ mira: true, riva: true, vira: false });
  const [names, setNames] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [who, setWho] = useState("");
  const [refCode, setRefCode] = useState("");
  const fileTitle = names.length ? `${names.length} ${names.length === 1 ? "file attached" : "files attached"}` : "Upload Business Credentials";
  const fileSub = names.length ? names.join(", ") : "GST Certificate & Proposed Showroom Blueprint / Photos (PDF, JPG under 4MB each)";
  const cta = busy ? "Submitting securely…" : "Submit Authorized Dealer Application";

  function onPickFile(event: ChangeEvent<HTMLInputElement>) {
    setNames(Array.from(event.target.files || []).map((file) => file.name));
    setErr("");
  }

  function resetForm() {
    setDone(false);
    setNames([]);
    setErr("");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!Object.values(picks).some(Boolean)) {
      setErr("Please select at least one model for your showroom.");
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


<section className="phead d-hero">
<div className="wrap">
<div className="d-top">
<div>
<span className="eyebrow fade-up"><span className="dot"></span>Institutional Franchise Network 2025–26</span>
<h1 className="h1"><span className="ln"><span>Build Your Business</span></span><span className="ln"><span><em>With MRIGA.</em></span></span></h1>
<p className="lead fade-up d1">Partner with India’s foremost electric mobility atelier and bring haute electric commuting to your territory. Forged with sovereign agility, sculpted bespoke fairings, and unparalleled retail margins.</p>
</div>
</div>

<div className="d-grid">
<div className="card showroom rv-s">
<div className="m-top"><span className="foot-note" style={{color: "var(--accent-text)"}}>Atelier Display Unit · MIRA S1 Urban</span><span className="series">Homologated ARAI Batch 09</span></div>
<div className="m-img" style={{background: "linear-gradient(180deg, var(--bg2), var(--surface))"}}>
<div className="plinth" aria-hidden="true"></div>
<svg viewBox="0 0 420 300" aria-hidden="true" style={{position: "relative", width: "62%", marginBottom: "30px"}}>
<g className="spin"><circle cx="96" cy="236" r="44" fill="#1d1a1a"></circle><circle cx="96" cy="236" r="27" fill="#d8d2c6"></circle><path d="M96 211v50M71 236h50" stroke="#8d867a" strokeWidth="3"></path></g>
<g className="spin"><circle cx="318" cy="236" r="44" fill="#1d1a1a"></circle><circle cx="318" cy="236" r="27" fill="#d8d2c6"></circle><path d="M318 211v50M293 236h50" stroke="#8d867a" strokeWidth="3"></path></g>
<path d="M50 206 C42 150 86 116 150 120 L208 126 C222 164 232 186 268 192 L282 198 C266 222 140 230 56 216 Z" fill="#EFE6CF"></path>
<path d="M140 196 L268 192 L272 206 L140 212 Z" fill="#cfc4ac"></path>
<path d="M258 198 C254 148 270 96 288 66 L306 70 C296 110 290 160 306 206 Z" fill="#EFE6CF"></path>
<path d="M268 214 C278 184 352 184 360 216 L346 216 C336 198 290 198 282 216 Z" fill="#EFE6CF"></path>
<path d="M92 118 C110 96 190 96 212 110 C212 126 100 130 92 118 Z" fill="#A8642F"></path>
<path d="M292 68 L284 36M256 36 L318 32" stroke="#3a3330" strokeWidth="6" strokeLinecap="round"></path>
<circle cx="304" cy="54" r="15" fill="#EFE6CF"></circle>
</svg>
</div>
<div>
<h3 style={{fontFamily: "var(--serif)", fontSize: "20px", color: "var(--ink)", margin: "0 0 6px"}}>Exemplary Craftsmanship</h3>
<p className="desc" style={{fontSize: "13px"}}>Heritage warm-tones, saddle-grade seat sculpting, whisper-quiet kinetic drive.</p>
<div className="tiny-k" style={{marginTop: "10px"}}>✓ High Margin Flagship</div>
</div>
</div>
<div style={{display: "grid", gap: "16px"}}>
<div className="card velo rv-s">
<div className="m-top"><span className="tiny-k">Expansion Velocity</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{color: "var(--accent-glow)"}}><path d="M3 17l6-6 4 4 8-8M15 7h6v6"></path></svg></div>
<div className="bigx">4.8× YoY</div>
<p>Pre-order organic growth across top metropolitan hubs with zero retail price discounting.</p>
<svg className="spark" viewBox="0 0 300 56" preserveAspectRatio="none" aria-hidden="true"><path className="ln" d="M0 50 C40 46 60 40 90 38 S150 30 180 22 S240 12 300 4" stroke="var(--accent-glow)" strokeWidth="3" fill="none"></path></svg>
<div className="m-top" style={{marginTop: "8px", fontSize: "11px", color: "var(--on-dark-muted)"}}><span>National Fleet Footprint</span><span>Targeting 35 New Cities</span></div>
</div>
<div className="mini-stats">
<div className="card rv-s"><div className="cap">Live Presence</div><div className="num"><span className="count c18"></span> Hubs</div><p className="desc" style={{fontSize: "12px"}}>Flagship Sanctuary ateliers live across India.</p></div>
<div className="card rv-s"><div className="cap" style={{color: "var(--accent-text)"}}>Atelier Subsidy</div><div className="num"><span className="count c100"></span>% CAD</div><p className="desc" style={{fontSize: "12px"}}>Comprehensive spatial fit-out blueprint.</p></div>
</div>
</div>
</div>
<div className="strip rv">
<div><span className="chip-ic"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M14 9h1M9 13h1M14 13h1"></path></svg></span><span><b>18 Flagship Markets</b>Active Luxury Enclaves</span></div>
<div><span className="chip-ic"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"></path></svg></span><span><b>Tier-1 HV Network</b>Over-The-Air Central Telemetry</span></div>
<div><span className="chip-ic"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></span><span><b>Exclusive Zoning</b>Single Partner Per Territory</span></div>
<div><span className="chip-ic"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9h18"></path></svg></span><span><b>Architectural Grant</b>Turnkey Fit-out Assistance</span></div>
</div>
</div>
</section>

<section className="sec">
<div className="wrap">
<div className="sec-head rv">
<div>
<div className="kicker plain">Uncompromised Economics</div>
<h2 className="h2">Why Capitalists &amp; Operators Choose MRIGA</h2>
</div>
<p className="sub" style={{maxWidth: "440px", fontSize: "14px"}}>We reject commodity EV economics. Our model is built like prestige horology and fine automotive coachwork, preserving operator yields and customer devotion.</p>
</div>
<div className="why">

<article className="wcard rv-s">
<div className="wic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 7h20v10H2zM6 12h.01M18 12h.01M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path></svg></div>
<h3>High Average Order Value &amp; Robust Margins</h3>
<p>Ticket sizes between ₹1.95L – ₹2.85L deliver three times the dealer contribution per vehicle versus mass commuter electric scooters.</p>
<span className="wnum">Superior ROI Model →</span>
</article>

<article className="wcard rv-s">
<div className="wic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l9 18H3zM12 9v6"></path></svg></div>
<h3>Full Turnkey Atelier Architectural Blueprint</h3>
<p>Our Bengaluru architectural studio provides 3D CAD schematics, bespoke lighting, lux charts, leather swatch displays, and luxury spatial staging.</p>
<span className="wnum">Spatial Excellence →</span>
</article>

<article className="wcard rv-s">
<div className="wic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
<h3>Exclusive Territorial Protection</h3>
<p>Strict geographical covenants guarantee a single MRIGA Atelier per sovereign affluent territory — guaranteeing no internal cannibalization.</p>
<span className="wnum">Protected Radius →</span>
</article>

<article className="wcard rv-s">
<div className="wic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5a2 2 0 1 0 0-.01M5 19a2 2 0 1 0 0-.01M19 19a2 2 0 1 0 0-.01M12 7v4M12 11l-6 6M12 11l6 6"></path></svg></div>
<h3>Centralized CRM &amp; Instant Digital Lead Flow</h3>
<p>High-net-worth online test ride reservations and digital paint atelier configurations routed instantly to your local concierge iPad terminal.</p>
<span className="wnum">Omnichannel Pipeline →</span>
</article>

</div>
</div>
</section>

<section className="sec mani">
<div className="wrap">
<div className="rv" style={{textAlign: "center", marginBottom: "48px"}}>
<div className="kicker center">Protocol &amp; Timeline</div>
<h2 className="h2">Dealership Onboarding Journey</h2>
<p className="sub" style={{margin: "0 auto", fontSize: "14px"}}>From initial portfolio review to white-glove ribbon cutting in under 60 days.</p>
</div>
<div className="steps">

<article className="card lift step rv-s">
<div className="sn">01</div>
<h4>Application Review</h4>
<p className="desc" style={{fontSize: "12.5px"}}>48-hour rigorous preliminary review by our Commercial Steering Directorate.</p>
<div className="dur"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>48 Hours</div>
</article>

<article className="card lift step rv-s">
<div className="sn">02</div>
<h4>Site Evaluation</h4>
<p className="desc" style={{fontSize: "12.5px"}}>On-ground inspection of prime street frontage, charging capacity &amp; demographics.</p>
<div className="dur"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>Days 3 – 10</div>
</article>

<article className="card lift step rv-s">
<div className="sn">03</div>
<h4>Commercial Pact</h4>
<p className="desc" style={{fontSize: "12.5px"}}>Execution of territorial covenants, quota schedules &amp; institutional margins.</p>
<div className="dur"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>Days 11 – 18</div>
</article>

<article className="card lift step rv-s">
<div className="sn">04</div>
<h4>Atelier Fit-Out</h4>
<p className="desc" style={{fontSize: "12.5px"}}>Full interior execution, test track prep, technician &amp; sales concierge certification.</p>
<div className="dur"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>Days 19 – 45</div>
</article>

<article className="card lift step rv-s">
<div className="sn">05</div>
<h4>Grand Opening</h4>
<p className="desc" style={{fontSize: "12.5px"}}>VIP press premiere, local collector test drives, and national press amplification.</p>
<div className="dur"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>Day 60 Milestone</div>
</article>

</div>
</div>
</section>

<section className="sec" id="apply">
<div className="wrap">
<div className="rv" style={{textAlign: "center", marginBottom: "40px"}}>
<div className="kicker center">Confidential Application</div>
<h2 className="h2">Authorized Dealer Franchise Prospectus Form</h2>
<p className="sub" style={{margin: "0 auto", fontSize: "14px"}}>Please provide verified institutional credentials. Our strategic team reviews applications on a rolling bi-weekly basis.</p>
</div>
<div className="card formcard rv-s">
{!done ? (<>
<form onSubmit={onSubmit}>
<input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
<div className="fsec">
<div className="fsec-h"><b>A</b><h3>Personal &amp; Authorized Signatory Information</h3></div>
<div className="fgrid">
<div className="fld"><label className="lbl" htmlFor="d-name">Full legal name *</label><input id="d-name" name="name" className="plain-in" placeholder="e.g. Veeramaditya Singhania" required autoComplete="name" /></div>
<div className="fld"><label className="lbl" htmlFor="d-mob">Mobile contact (WhatsApp enabled) *</label><input id="d-mob" name="mobile" className="plain-in" placeholder="+91 98765 43210" required inputMode="tel" pattern="[+0-9 ]{10,16}" /></div>
<div className="fld"><label className="lbl" htmlFor="d-mail">Corporate / business email *</label><input id="d-mail" name="email" type="email" className="plain-in" placeholder="v.singhania@apexholding.in" required /></div>
<div className="fld"><label className="lbl" htmlFor="d-title">Official designation / title *</label><input id="d-title" name="title" className="plain-in" placeholder="Managing Director / Promoter" required /></div>
</div>
</div>
<div className="fsec">
<div className="fsec-h"><b>B</b><h3>Business &amp; Legal Entity Profile</h3></div>
<div className="fgrid">
<div className="fld"><label className="lbl" htmlFor="d-ent">Registered entity name *</label><input id="d-ent" name="entity" className="plain-in" placeholder="e.g. Apex Luxury Mobilities LLP" required /></div>
<div className="fld"><label className="lbl" htmlFor="d-con">Constitution of business *</label><select id="d-con" name="constitution" className="plain-in" required><option value="">Select structure</option><option>Private Limited</option><option>LLP</option><option>Partnership</option><option>Proprietorship</option></select></div>
<div className="fld"><label className="lbl" htmlFor="d-yrs">Years in active operation *</label><select id="d-yrs" name="years" className="plain-in" defaultValue="7 – 15 Years"><option>0 – 3 Years</option><option>3 – 7 Years</option><option>7 – 15 Years</option><option>15+ Years</option></select></div>
<div className="fld"><label className="lbl" htmlFor="d-gst">GSTIN number *</label><input id="d-gst" name="gst" className="plain-in" placeholder="29AAAAA0000A1Z5" required minLength={15} maxLength={15} /></div>
</div>
</div>
<div className="fsec">
<div className="fsec-h"><b>C</b><h3>Target Territory &amp; Spatial Infrastructure</h3></div>
<div className="fgrid">
<div className="fld"><label className="lbl" htmlFor="d-city">Target state &amp; city *</label><input id="d-city" name="city" className="plain-in" placeholder="e.g. Maharashtra — Pune (Koregaon Park)" required /></div>
<div className="fld"><label className="lbl" htmlFor="d-area">Proposed carpet area *</label><select id="d-area" name="area" className="plain-in" defaultValue="2,500 – 4,000 sq ft (Flagship Atelier)"><option>1,200 – 2,500 sq ft (Boutique)</option><option>2,500 – 4,000 sq ft (Flagship Atelier)</option><option>4,000+ sq ft (Sanctuary)</option></select></div>
<div className="fld"><span className="lbl">Prime arterial frontage available? *</span><div className="radios"><label><input type="radio" name="frontage" value="yes" defaultChecked /> Yes (&gt;40 ft frontage)</label><label><input type="radio" name="frontage" value="pending" /> Pending lease negotiation</label></div></div>
<div className="fld"><label className="lbl" htmlFor="d-brands">Existing dealership brands represented</label><input id="d-brands" name="brands" className="plain-in" placeholder="e.g. BMW Motorrad, Triumph, Ducati, or None" /></div>
</div>
</div>
<div className="fsec">
<div className="fsec-h"><b>D</b><div><h3>Product Portfolio Interest</h3><p>Select models intended for showroom display and test fleet deployment.</p></div></div>
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
<div className="fsec-h"><b>E</b><h3>Capital Allocation &amp; Documentation</h3></div>
<div className="fgrid" style={{marginBottom: "18px"}}>
<div className="fld"><label className="lbl" htmlFor="d-liq">Committed liquidity tier *</label><select id="d-liq" name="liquidity" className="plain-in" defaultValue="₹1.75 Cr – ₹2.50 Cr (Flagship Tier)"><option>₹75 L – ₹1.75 Cr (Boutique Tier)</option><option>₹1.75 Cr – ₹2.50 Cr (Flagship Tier)</option><option>₹2.50 Cr+ (Sanctuary Tier)</option></select></div>
<div className="fld"><label className="lbl" htmlFor="d-tl">Anticipated launch timeline *</label><select id="d-tl" name="timeline" className="plain-in" defaultValue="45 – 60 Days"><option>Under 45 Days</option><option>45 – 60 Days</option><option>60 – 90 Days</option></select></div>
</div>
<div className="upload">
<span className="chip-ic" style={{width: "44px", height: "44px", borderRadius: "12px"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><path d="M14 3v6h6M12 18v-6M9 15l3-3 3 3"></path></svg></span>
<span><b>{fileTitle}</b><small>{fileSub}</small></span>
<label className="btn btn-g btn-sm" htmlFor="d-file">Attach Files</label>
<input id="d-file" name="credentials" type="file" className="file-in" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={onPickFile} />
</div>
</div>
<label className="certify"><input type="checkbox" name="certify" required /> I certify that I am an authorized signatory. I acknowledge that submissions undergo rigorous ARAI-aligned commercial validation, financial screening, and MRIGA brand territory appraisal before execution.</label>
{err ? (<><p className="err" role="alert" style={{marginBottom: "14px"}}>{err}</p></>) : null}
<button type="submit" className="btn btn-p btn-block" disabled={busy} style={{minHeight: "56px", letterSpacing: ".08em", textTransform: "uppercase", fontSize: "13px"}}>
{busy ? (<><span className="spinner"></span></>) : null}
{cta}
</button>
</form>
</>) : null}
{done ? (<>
<div className="success">
<div className="tick"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg></div>
<div className="kicker plain">Application Received</div>
<h2 className="h2" style={{margin: "0"}}>Thank you, {who}.</h2>
<p className="sub" style={{fontSize: "14px"}}>Your reference number is <b style={{color: "var(--ink)"}}>{refCode}</b>. A strategic partnerships director will contact you within 48 hours to schedule the site evaluation.</p>
<button className="btn btn-g" onClick={resetForm}>Submit another application</button>
</div>
</>) : null}
</div>
</div>
</section>

<div className="wrap">
<div className="partner-band rv">
<div>
<span className="eyebrow"><span className="dot"></span>Partner Console 3.4</span>
<h3>Already an Authorized MRIGA Partner?</h3>
<p>Access inventory tracking, vehicle build telemetry, automated warranty approvals, and concierge CRM allocations via the protected Dealer Management Console.</p>
</div>
<div style={{display: "flex", flexWrap: "wrap", gap: "12px"}}>
<a href="/login" className="btn btn-g btn-sm">Sign in to Dealer Console</a>
<a href="#book" className="btn btn-o btn-sm">Priority Desk</a>
</div>
</div>
</div>

    </main>
  );
}
