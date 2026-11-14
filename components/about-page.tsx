"use client";

import { useState } from "react";

const YEARS = [
  {
    "year": "2022",
    "badge": "Genesis",
    "title": "The Blank Parchment",
    "text": "Founded by automotive sculptors and veteran aerospace electronics architects in Bengaluru. Early clay prototypes benchmarked against vintage European scooters.",
    "foot": "Bengaluru Clay Studio",
    "prog": "100%",
    "more": "Twelve full-scale clay bucks were sculpted by hand before the first steel frame was welded. The RIVA silhouette was chosen from prototype number seven."
  },
  {
    "year": "2023",
    "badge": "Validation",
    "title": "Ghats & Monsoon Trials",
    "text": "250,000 cumulative kilometers across torrential Western Ghat gradients, coastal salt air in Goa, and summer tarmac in Delhi.",
    "foot": "Western Ghats Testing Lab",
    "prog": "100%",
    "more": "Thermal safety sealing with proprietary phase-change immersion cooling was proven in 46°C Delhi heat and 300mm monsoon days."
  },
  {
    "year": "2024",
    "badge": "Homologation",
    "title": "ARAI Sovereign Certification",
    "text": "Achieved pinnacle ARAI safety clearance for AIS-156 Phase 2 battery fire containment.",
    "foot": "Certified Homologation",
    "prog": "100%",
    "more": "The flagship Mriga Vayu S1 and Agni GT editions were unveiled to private connoisseur collector circles in Mumbai and Bengaluru."
  },
  {
    "year": "2025",
    "badge": "Present",
    "title": "Expansion into 18 Metros",
    "text": "Inauguration of MRIGA Sanctuary Studios across Mumbai, Delhi NCR, Bengaluru, Hyderabad, and Pune.",
    "foot": "Active Nationwide Rollout",
    "prog": "72%",
    "more": "Bespoke white-glove doorstep delivery has begun for discerning early patrons, with 13 of 18 metropolitan hubs now open."
  }
];

export function AboutPage() {
  const [year, setYear] = useState(3);
  const sel = YEARS[year];
  return (
    <main className="page">


<section className="phead" style={{paddingBottom: "72px"}}>
<div className="wrap">
<div className="about-head" style={{paddingTop: "0"}}>
<div>
<div style={{display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center"}} className="fade-up">
<span className="eyebrow"><span className="dot"></span>Origins &amp; Manifesto</span>
<span className="foot-note">Est. Bengaluru · MMXXII</span>
</div>
<h1 className="h1 mixed"><span className="ln"><span>We are not just changing</span></span><span className="ln"><span>the way India rides.</span></span><span className="ln"><span><em>We are changing the way it feels.</em></span></span></h1>
</div>
<div className="fade-up d2">
<p className="side-note">Born in Bengaluru. Inspired by heritage architecture and avant-garde silent engineering.</p>
<p className="lead" style={{fontSize: "14px"}}>Where neoclassical stone colonnades meet whispering electric kinetics. MRIGA was conceived as a sovereign departure from sterile, plastic gadgetry — crafted for those who consider motion an art form.</p>
</div>
</div>

<div className="story">
<div className="story-img rv-s">
<svg viewBox="0 0 800 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<rect width="800" height="460" fill="var(--sky1)"></rect>
<circle cx="400" cy="150" r="90" fill="var(--accent-glow)" opacity=".35"></circle>
<path d="M0 460 V60 H800 V460 H660 V210 A140 140 0 0 0 380 210 V460 Z" fill="var(--stone2)"></path>
<path d="M0 460 V60 H140 V460 Z" fill="var(--stone)"></path>
<path d="M660 460 V60 H800 V460 Z" fill="var(--stone)"></path>
<path d="M400 460 V220 A120 120 0 0 1 640 220 V460" stroke="var(--ink)" strokeOpacity=".2" strokeWidth="3" fill="none"></path>
<rect x="0" y="40" width="800" height="24" fill="var(--stone)"></rect>
<rect x="0" y="400" width="800" height="60" fill="#7d6e5e"></rect>
<g transform="translate(370 230) scale(.62)">
<g className="spin"><circle cx="96" cy="236" r="44" fill="#1d1a1a"></circle><circle cx="96" cy="236" r="27" fill="#d8d2c6"></circle><path d="M96 211v50M71 236h50" stroke="#8d867a" strokeWidth="3"></path></g>
<g className="spin"><circle cx="318" cy="236" r="44" fill="#1d1a1a"></circle><circle cx="318" cy="236" r="27" fill="#d8d2c6"></circle><path d="M318 211v50M293 236h50" stroke="#8d867a" strokeWidth="3"></path></g>
<path d="M50 206 C42 150 86 116 150 120 L208 126 C222 164 232 186 268 192 L282 198 C266 222 140 230 56 216 Z" fill="#EADBC0"></path>
<path d="M258 198 C254 148 270 96 288 66 L306 70 C296 110 290 160 306 206 Z" fill="#EADBC0"></path>
<path d="M268 214 C278 184 352 184 360 216 L346 216 C336 198 290 198 282 216 Z" fill="#EADBC0"></path>
<path d="M92 118 C110 96 190 96 212 110 C212 126 100 130 92 118 Z" fill="#A8642F"></path>
<path d="M292 68 L284 36M256 36 L318 32" stroke="#3a3330" strokeWidth="6" strokeLinecap="round"></path>
</g>
</svg>
<span className="story-tag">THE ROYAL STEED · SILENT KINETIC</span>
<div className="story-cap">
<div><span className="tiny-k">Architectural Serenity</span><h3>Tailored for city boulevards, courtyard estates, and quiet urban sanctuaries.</h3></div>
<a href="/collection" className="btn btn-g btn-sm">Explore Fleet <svg className="arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
</div>
</div>
<div className="side-stack">
<div className="card rv-s">
<span className="feat-ic" style={{borderRadius: "50%"}}><span className="wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span></span>
<h3>Zero Decibels. Pure Cadence.</h3>
<p className="desc">Our bespoke brushless drivetrain eliminates gear whine and harmonic turbulence. You don’t hear the motor — you only sense the rhythmic hum of asphalt rolling beneath your boots.</p>
<div className="mstats">
<div><div className="num" style={{color: "var(--accent-text)"}}>0.08<small>s</small></div><div className="cap" style={{marginTop: "6px"}}>Throttle Response</div></div>
<div><div className="num">&lt; <span className="count c38"></span><small>dB</small></div><div className="cap" style={{marginTop: "6px"}}>Acoustic Signature</div></div>
</div>
</div>
<div className="card creed rv-s">
<span className="tiny-k">Our Creed</span>
<p>“True opulence in the twenty-first century is not excess horsepower. It is uninterrupted poise, graceful balance, and absolute silence.”</p>
</div>
</div>
</div>
</div>
</section>

<section className="sec mani">
<div className="wrap">
<div className="sec-head rv">
<div>
<div className="kicker plain">Foundational Craft</div>
<h2 className="h2">The Four Pillars of MRIGA</h2>
</div>
<p className="sub" style={{maxWidth: "420px", fontSize: "14px"}}>Conceived at the intersection of classical Indian saddle artisanship and next-generation solid-state electronic kinetics.</p>
</div>
<div className="pillars">

<article className="card lift pillar rv-s">
<span className="feat-ic" style={{borderRadius: "50%"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22a10 10 0 1 1 10-10c0 2-1.5 3-3 3h-2a2 2 0 0 0-1 3.7c.6.5.4 1.6-.4 2-1 .2-2.3.3-3.6.3z"></path></svg></span>
<div className="wnum" style={{marginTop: "18px"}}>Pillar 01</div>
<h3>Haute Indian Craftsmanship</h3>
<p className="desc" style={{fontSize: "13px"}}>Full-grain vegetal saddle hide hand-stitched by third-generation tanners, aerograde billet aluminum switches, and organic lacquer topcoats inspired by Royal Rajasthani enameling.</p>
<div className="kd"><small>Key Detail</small>Bespoke Tan Saddlehide • CNC Alloy</div>
</article>

<article className="card lift pillar rv-s">
<span className="feat-ic" style={{borderRadius: "50%"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6"></path></svg></span>
<div className="wnum" style={{marginTop: "18px"}}>Pillar 02</div>
<h3>Acoustic Purity &amp; Silent Cadence</h3>
<p className="desc" style={{fontSize: "13px"}}>Whisper-quiet direct carbon belt transmission delivers linear torque without gear meshing chatter or high-frequency vibration, gliding effortlessly past congested city arteries.</p>
<div className="kd"><small>Key Detail</small>Carbon Belt Direct • Zero Harmonics</div>
</article>

<article className="card lift pillar rv-s">
<span className="feat-ic" style={{borderRadius: "50%"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"></path></svg></span>
<div className="wnum" style={{marginTop: "18px"}}>Pillar 03</div>
<h3>Urban Sovereign Agility</h3>
<p className="desc" style={{fontSize: "13px"}}>A bespoke trellis spine balances the high-density floorboard battery, locking center of gravity 180mm above road grade for intuitive, feather-light city chicane maneuvers.</p>
<div className="kd"><small>Key Detail</small>50:50 Weight Split • 1.35m Turn Radius</div>
</article>

<article className="card lift pillar rv-s">
<span className="feat-ic" style={{borderRadius: "50%"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"></path></svg></span>
<div className="wnum" style={{marginTop: "18px"}}>Pillar 04</div>
<h3>Zero Compromise Sustainability</h3>
<p className="desc" style={{fontSize: "13px"}}>Ethically sourced, cobalt-conscious cell chemistry enclosed in fully modular recyclable aluminum extrusion casings. Designed for second-life residential energy storage.</p>
<div className="kd"><small>Key Detail</small>Circular Battery Passport • 94% Recyclable</div>
</article>

</div>
</div>
</section>

<section className="sec">
<div className="wrap">
<div className="rv" style={{marginBottom: "44px"}}>
<div className="kicker plain">Chronicle · Bengaluru Atelier</div>
<h2 className="h2">The Atelier Journey</h2>
<p className="sub" style={{fontSize: "14px"}}>From an artisan sketches studio in Indiranagar to sovereign delivery bays across India’s premier capitals. Tap a year to explore.</p>
</div>
<div className="timeline">
{YEARS.map((item, index) => (
  <button key={item.year} type="button" className={year === index ? "card tl on rv-s" : "card tl rv-s"} onClick={() => setYear(index)} aria-pressed={year === index}>
    <div className="tl-top"><span className="tl-year">{item.year}</span><span className="tl-badge">{item.badge}</span></div>
    <h4>{item.title}</h4>
    <p className="desc" style={{ fontSize: "13px", marginBottom: "22px" }}>{item.text}</p>
    <div className="tl-prog"><i style={{ width: item.prog }} /></div>
    <div className="tl-foot">{item.foot}</div>
  </button>
))}
</div>
<div className="tl-detail" aria-live="polite">
<span className="tick" style={{width: "52px", height: "52px", flex: "none"}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg></span>
<div><div className="tiny-k">{sel.year} · {sel.badge}</div><p className="desc" style={{marginTop: "6px", color: "var(--text)"}}>{sel.more}</p></div>
</div>
</div>
</section>

<section style={{padding: "20px 0 110px"}}>
<div className="wrap">
<div className="founders rv-s">
<div style={{position: "relative"}}>
<span className="eyebrow">Philosophy · Founders’ Desk</span>
<blockquote>“We built MRIGA not to be another sterile gadget on wheels, but an extension of your tailored wardrobe and personal poise.”</blockquote>
<div style={{fontFamily: "var(--serif)", fontSize: "18px"}}>Devraj Sengupta &amp; Maya Iyer</div>
<div style={{fontSize: "12px", color: "var(--on-dark-muted)", marginTop: "6px"}}>Co-Founders &amp; Chief Creative Officers, MRIGA Mobility</div>
</div>
<div className="sig">
<div className="sig-av">M</div>
<span className="tiny-k">Handcrafted Signature</span>
<p>Every chassis is individually numbered, hand-calibrated, and lacquer-cured in Bengaluru before release.</p>
<div className="sig-stats">
<div><b><span className="count c100"></span>%</b><small>Domestic Craft</small></div>
<div><b>5-Year</b><small>Atelier Pledge</small></div>
</div>
</div>
</div>
</div>
</section>

<section className="cta light">
<div className="wrap cta-in rv">
<span className="eyebrow">Private Consultations · Metros Nationwide</span>
<h2>Experience the Craft in Person</h2>
<p>Step inside an intimate MRIGA Sanctuary Studio for an unhurried tea service, curated color swatches, and a whisper-silent sunset trial.</p>
<div className="cta-row">
<a href="#book" className="btn btn-p">Book a Private Test Ride</a>
<a href="/dealers" className="btn btn-g">Visit a Sanctuary Atelier</a>
</div>
<div className="assure">
<span>◎ White-Glove Home Delivery</span>
<span>◎ Bespoke Monogramming Included</span>
<span>◎ Direct Atelier Line Access</span>
</div>
</div>
</section>

    </main>
  );
}
