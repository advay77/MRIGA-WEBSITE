"use client";

import { useState } from "react";
import { MIRA_COLOURS, MIRA_COLOUR_LINE, type MiraColourId } from "@/lib/mira";
import { RIVA_COLOURS, type RivaColourId } from "@/lib/riva";
import { VIRA_COLOURS, type ViraColourId } from "@/lib/vira";
import { useModels, useSiteContent } from "@/components/site-content";

const TABS = [
  { key: "all", label: "All" },
  { key: "riva", label: "RIVA" },
  { key: "mira", label: "MIRA" },
  { key: "vira", label: "VIRA" },
];

export function CollectionPage() {
  const [filter, setFilter] = useState("all");
  const [miraColour, setMiraColour] = useState<MiraColourId>("pink");
  const [rivaColour, setRivaColour] = useState<RivaColourId>("grey");
  const [viraColour, setViraColour] = useState<ViraColourId>("blue");
  const content = useSiteContent();
  const { specs } = useModels();
  const mira = MIRA_COLOURS.find((item) => item.id === miraColour) ?? MIRA_COLOURS[0];
  const riva = RIVA_COLOURS.find((item) => item.id === rivaColour) ?? RIVA_COLOURS[0];
  const vira = VIRA_COLOURS.find((item) => item.id === viraColour) ?? VIRA_COLOURS[0];
  function visible(key: string) {
    return filter === "all" || filter === key;
  }
  return (
    <main className="page">


<section className="phead">
<div className="wrap">
<div className="phead-grid">
<div>
<span className="eyebrow fade-up"><span className="dot"></span>Explore</span>
<h1 className="h1 mixed"><span className="ln"><span>RIVA, MIRA,</span></span><span className="ln"><span>and VIRA</span></span></h1>
<p className="ital fade-up d1">MIRA is on sale now.</p>
</div>
<p className="lead fade-up d2" style={{fontSize: "15px"}}>MIRA is our star scooter, on sale in {MIRA_COLOUR_LINE}. RIVA and VIRA add a full mobile app and keyless entry: see the full specifications on each model's page.</p>
</div>
<div className="filters fade-up d3">
<div className="tabs" role="group" aria-label="Filter models">
{TABS.map((tab) => (
  <button key={tab.key} type="button" className={filter === tab.key ? "on" : undefined} aria-pressed={filter === tab.key} onClick={() => setFilter(tab.key)}>{tab.label}</button>
))}
</div>
</div>
</div>
</section>

<div className="wrap models">

{visible("riva") ? (<>
<article className="model">
<div className="m-media">
<div className="m-top"><span className="series">RIVA</span><span className="idx">01</span></div>
<div className="m-img has-photo" style={{ background: riva.wash }}>
<img className="mira-shot" src={riva.shots[0]} alt={`RIVA in ${riva.name}`} />
<div className="mira-switch">
{RIVA_COLOURS.map((item) => (
<button key={item.id} type="button" className={item.id === riva.id ? "on" : undefined} style={{ background: item.swatch }} aria-label={item.name} onClick={() => setRivaColour(item.id)} />
))}
</div>
<svg viewBox="0 0 420 300" aria-hidden="true">
<g className="spin"><circle cx="96" cy="236" r="44" fill="#1d1a1a"></circle><circle cx="96" cy="236" r="27" fill="#d8d2c6"></circle><path d="M96 211v50M71 236h50M78 218l36 36M114 218l-36 36" stroke="#8d867a" strokeWidth="3"></path></g>
<g className="spin"><circle cx="318" cy="236" r="44" fill="#1d1a1a"></circle><circle cx="318" cy="236" r="27" fill="#d8d2c6"></circle><path d="M318 211v50M293 236h50M300 218l36 36M336 218l-36 36" stroke="#8d867a" strokeWidth="3"></path></g>
<path d="M50 206 C42 150 86 116 150 120 L208 126 C222 164 232 186 268 192 L282 198 C266 222 140 230 56 216 Z" fill="#EFE6CF"></path>
<path d="M64 196 C70 168 100 150 140 150" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".7"></path>
<path d="M140 196 L268 192 L272 206 L140 212 Z" fill="#cfc4ac"></path>
<path d="M258 198 C254 148 270 96 288 66 L306 70 C296 110 290 160 306 206 Z" fill="#EFE6CF"></path>
<path d="M268 214 C278 184 352 184 360 216 L346 216 C336 198 290 198 282 216 Z" fill="#EFE6CF"></path>
<path d="M92 118 C110 96 190 96 212 110 C212 126 100 130 92 118 Z" fill="#A8642F"></path>
<path d="M292 68 L284 36M256 36 L318 32" stroke="#3a3330" strokeWidth="6" strokeLinecap="round"></path>
<circle cx="304" cy="54" r="15" fill="#EFE6CF"></circle><circle cx="306" cy="54" r="9" fill="#fff8e6" stroke="#b9ad92" strokeWidth="2"></circle>
</svg>
</div>
<div className="m-stats">
<div><div className="cap">Status</div><div className="num">Next</div></div>
</div>
</div>
<div className="m-body">
<div className="kicker">{specs.riva.status}</div>
<h2>RIVA</h2>
<p className="mtag">{specs.riva.tagline}</p>
<p className="desc" style={{marginTop: "18px"}}>{specs.riva.summary}</p>
<div className="m-acts">
<a href={`/riva?colour=${riva.id}`} className="btn btn-p btn-sm">Explore RIVA</a>
<a href="#book" className="btn btn-d btn-sm">Book Test Ride</a>
<a href="#book" className="btn btn-l btn-sm">Enquire</a>
</div>
</div>
</article>
</>) : null}

{visible("mira") ? (<>
<article className="model flip">
<div className="m-media">
<div className="m-top"><span className="series">Star Product · MIRA</span><span className="idx">02</span></div>
<div className="m-img" style={{background: mira.wash}}>
<img className="mira-shot" src={mira.shots[0]} alt={`MIRA in ${mira.name}`} />
<div className="mira-switch">
{MIRA_COLOURS.map((item) => (
<button key={item.id} type="button" className={item.id === mira.id ? "on" : undefined} style={{background: item.swatch}} aria-label={item.name} onClick={() => setMiraColour(item.id)} />
))}
</div>
</div>
<div className="m-stats">
<div><div className="cap">Range, LiFePO4</div><div className="num">85<small>km</small></div></div>
<div><div className="cap">Lead-acid Range</div><div className="num">60<small>km</small></div></div>
<div><div className="cap">Charge Time</div><div className="num">5<small>hr</small></div></div>
</div>
</div>
<div className="m-body">
<div className="kicker">Star Product</div>
<h2>MIRA</h2>
<p className="mtag">Smart Mobility. Sustainable Future.</p>
<p className="desc" style={{marginTop: "18px"}}>MIRA by MRIGA is the first model we are building. Colours: {MIRA_COLOUR_LINE}. Range follows the battery you choose.</p>
<div className="m-list">
<div className="m-li"><span className="feat-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"></path></svg></span><div><h4>Lithium-ion · {content.lithiumPrice}</h4><p>{content.lithiumDetail} About 5 hours to charge. Charger warranty is 1 year.</p></div></div>
<div className="m-li"><span className="feat-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="7" width="18" height="10" rx="2"></rect><path d="M22 11v2"></path></svg></span><div><h4>Lead-acid · {content.leadPrice}</h4><p>{content.leadDetail}</p></div></div>
<div className="m-li"><span className="feat-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg></span><div><h4>Colours</h4><p>{MIRA_COLOUR_LINE[0].toUpperCase() + MIRA_COLOUR_LINE.slice(1)}.</p></div></div>
</div>
<div className="m-acts">
<a href={`/mira?colour=${mira.id}`} className="btn btn-p btn-sm">MIRA specifications</a>
<a href="#book" className="btn btn-d btn-sm">Book Test Ride</a>
<a href="#book" className="btn btn-l btn-sm">Enquire</a>
</div>
</div>
</article>
</>) : null}

{visible("vira") ? (<>
<article className="model dark">
<div className="m-media">
<div className="m-top"><span className="series">VIRA</span><span className="idx">03</span></div>
<div className="m-img has-photo" style={{ background: vira.wash }}>
<img className="mira-shot" src={vira.shots[0]} alt={`VIRA in ${vira.name}`} />
<div className="mira-switch">
{VIRA_COLOURS.map((item) => (
<button key={item.id} type="button" className={item.id === vira.id ? "on" : undefined} style={{ background: item.swatch }} aria-label={item.name} onClick={() => setViraColour(item.id)} />
))}
</div>
<svg viewBox="0 0 420 300" aria-hidden="true">
<path className="beam" d="M318 58 L420 34 L420 86 Z" fill="#E0602A" opacity=".3"></path>
<g className="spin"><circle cx="96" cy="236" r="44" fill="#0b0b0e"></circle><circle cx="96" cy="236" r="27" fill="#3a3a42"></circle><path d="M96 211v50M71 236h50M78 218l36 36M114 218l-36 36" stroke="#E0602A" strokeWidth="3"></path></g>
<g className="spin"><circle cx="318" cy="236" r="44" fill="#0b0b0e"></circle><circle cx="318" cy="236" r="27" fill="#3a3a42"></circle><path d="M318 211v50M293 236h50M300 218l36 36M336 218l-36 36" stroke="#E0602A" strokeWidth="3"></path></g>
<path d="M40 200 L70 140 L150 120 L214 126 C226 160 236 184 270 190 L290 198 C266 222 140 230 46 214 Z" fill="#2a2a30"></path>
<path d="M80 176 L200 160" stroke="#E0602A" strokeWidth="3"></path>
<path d="M140 196 L268 192 L272 206 L140 212 Z" fill="#1c1c22"></path>
<path d="M258 198 L276 100 L296 62 L316 70 L296 130 L306 206 Z" fill="#2a2a30"></path>
<path d="M264 214 L290 190 L350 192 L366 216 L346 216 L330 202 L290 202 L280 216 Z" fill="#2a2a30"></path>
<path d="M90 120 L200 108 L214 118 L100 128 Z" fill="#111"></path>
<path d="M296 64 L286 34M258 36 L320 30" stroke="#9a9aa4" strokeWidth="6" strokeLinecap="round"></path>
<path d="M300 58 L322 52 L318 66 Z" fill="#E0602A"></path>
</svg>
</div>
<div className="m-stats">
<div><div className="cap">Status</div><div className="num">Next</div></div>
</div>
</div>
<div className="m-body">
<div className="kicker">{specs.vira.status}</div>
<h2>VIRA</h2>
<p className="mtag">{specs.vira.tagline}</p>
<p className="desc" style={{marginTop: "18px"}}>{specs.vira.summary}</p>
<div className="m-acts">
<a href={`/vira?colour=${vira.id}`} className="btn btn-p btn-sm">Explore VIRA</a>
<a href="#book" className="btn btn-d btn-sm">Book Test Ride</a>
<a href="#book" className="btn btn-l btn-sm">Enquire</a>
</div>
</div>
</article>
</>) : null}
</div>


<div className="wrap" style={{paddingTop: "80px"}}>
<div className="duo">
<div className="card lt">
<h3>Want to stock MRIGA?</h3>
<p className="desc">Send a dealer application. Retailers also get a separate login.</p>
<div className="acts"><a href="/dealers" className="btn btn-d btn-sm">Dealer application</a></div>
</div>
<div className="card dk">
<h3>See MIRA in Rohini.</h3>
<p className="desc">Book a test ride, or open the showroom map on the contact page.</p>
<div className="acts"><a href="#book" className="btn btn-p btn-sm">Book a test ride</a></div>
</div>
</div>
</div>

    </main>
  );
}
