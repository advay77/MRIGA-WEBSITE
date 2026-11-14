"use client";

import { useState } from "react";

const TABS = [
  { key: "all", label: "All Models" },
  { key: "riva", label: "Grand Tourer (RIVA)" },
  { key: "mira", label: "Urban Purist (MIRA)" },
  { key: "vira", label: "Apex Corsa (VIRA)" },
];

export function CollectionPage() {
  const [filter, setFilter] = useState("all");
  const [cmpOpen, setCmp] = useState(false);
  function visible(key: string) {
    return filter === "all" || filter === key;
  }
  return (
    <main className="page">


<section className="phead">
<div className="wrap">
<div className="phead-grid">
<div>
<span className="eyebrow fade-up"><span className="dot"></span>Fleet Portfolio · Volume MMXXV</span>
<h1 className="h1 mixed"><span className="ln"><span>The Haute Electric</span></span><span className="ln"><span>Collection</span></span></h1>
<p className="ital fade-up d1">Three Personalities. One Electric Soul.</p>
</div>
<p className="lead fade-up d2" style={{fontSize: "15px"}}>Engineered through avant-garde Indian craftsmanship and unyielding electric architectures. A sartorial celebration of effortless motion, warm textures, and unapologetic poise.</p>
</div>
<div className="filters fade-up d3">
<div className="tabs" role="group" aria-label="Filter models">
{TABS.map((tab) => (
  <button key={tab.key} type="button" className={filter === tab.key ? "on" : undefined} aria-pressed={filter === tab.key} onClick={() => setFilter(tab.key)}>{tab.label}</button>
))}
</div>
<div className="cohort">Active cohort: <span>⚡ Gen 2 Architecture</span></div>
</div>
</div>
</section>

<div className="wrap models">

{visible("riva") ? (<>
<article className="model">
<div className="m-media">
<div className="m-top"><span className="series">Series I · Grand Tourer</span><span className="idx">01</span></div>
<div className="m-img">
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
<div><div className="cap">Range (IDC)</div><div className="num"><span className="count c185"></span><small>km</small></div></div>
<div><div className="cap">Acceleration</div><div className="num">3.2<small>s</small></div></div>
<div><div className="cap">Hypercharge</div><div className="num"><span className="count c45"></span><small>min</small></div></div>
</div>
</div>
<div className="m-body">
<div className="kicker">The Sovereign Stance</div>
<h2>RIVA</h2>
<p className="mtag">Pure Grace in Motion</p>
<p className="desc" style={{marginTop: "18px"}}>Sculpted for interstate leisure and effortless urban transcendence. Features our hallmark Crema &amp; Cuoio handcrafted vegan saddle, classic round optical projector beam, and balanced low-center gravity cradle for unmatched calm at cruising speeds.</p>
<div className="m-list">
<div className="m-li"><span className="feat-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 14c3-1 6-1 8 1s5 2 8 1"></path><path d="M4 10c3-1 6-1 8 1s5 2 8 1"></path></svg></span><div><h4>Cuoio Vegan Saddlery</h4><p>Hand-stitched perimeter with micro-perforated lumbar ventilation.</p></div></div>
<div className="m-li"><span className="feat-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2"></path></svg></span><div><h4>Optical Bi-Sphere Beam</h4><p>Signature round focal lens projecting 140m daylight-temperature illumination.</p></div></div>
<div className="m-li"><span className="feat-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6"></path></svg></span><div><h4>Silent Cadence Belt Drive</h4><p>Carbon-cord synchronous transmission producing zero mechanical whine.</p></div></div>
</div>
<div className="m-acts">
<a href="#book" className="btn btn-p btn-sm">Explore RIVA</a>
<a href="#book" className="btn btn-d btn-sm">Book Test Ride</a>
<a href="#book" className="btn btn-l btn-sm">Enquire</a>
</div>
</div>
</article>
</>) : null}

{visible("mira") ? (<>
<article className="model flip">
<div className="m-media">
<div className="m-top"><span className="series">Series II · Urban Purist</span><span className="idx">02</span></div>
<div className="m-img" style={{background: "linear-gradient(180deg, var(--stone), var(--stone2))"}}>
<svg viewBox="0 0 420 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{width: "100%", height: "100%", position: "absolute", inset: "0"}}>
<rect x="0" y="0" width="420" height="230" fill="var(--stone)"></rect>
<path d="M20 230 V70 A40 40 0 0 1 100 70 V230 Z M130 230 V70 A40 40 0 0 1 210 70 V230 Z M240 230 V70 A40 40 0 0 1 320 70 V230 Z M350 230 V70 A40 40 0 0 1 430 70 V230 Z" fill="var(--stone2)" opacity=".75"></path>
<rect x="0" y="22" width="420" height="10" fill="var(--stone2)"></rect>
<rect x="0" y="230" width="420" height="70" fill="#8d8478"></rect>
<path d="M0 248 H420 M0 270 H420" stroke="#7a7266" strokeWidth="2"></path>
<g transform="translate(90 120) scale(.6)">
<g className="spin"><circle cx="96" cy="236" r="44" fill="#1d1a1a"></circle><circle cx="96" cy="236" r="27" fill="#e9dccb"></circle><path d="M96 211v50M71 236h50" stroke="#a08a74" strokeWidth="3"></path></g>
<g className="spin"><circle cx="318" cy="236" r="44" fill="#1d1a1a"></circle><circle cx="318" cy="236" r="27" fill="#e9dccb"></circle><path d="M318 211v50M293 236h50" stroke="#a08a74" strokeWidth="3"></path></g>
<path d="M50 206 C42 150 86 116 150 120 L208 126 C222 164 232 186 268 192 L282 198 C266 222 140 230 56 216 Z" fill="#F2E7D2"></path>
<path d="M258 198 C254 148 270 96 288 66 L306 70 C296 110 290 160 306 206 Z" fill="#F2E7D2"></path>
<path d="M268 214 C278 184 352 184 360 216 L346 216 C336 198 290 198 282 216 Z" fill="#F2A27A"></path>
<path d="M92 118 C110 96 190 96 212 110 C212 126 100 130 92 118 Z" fill="#6B4A3A"></path>
<path d="M292 68 L284 36M256 36 L318 32" stroke="#3a3330" strokeWidth="6" strokeLinecap="round"></path>
<circle cx="304" cy="54" r="15" fill="#F2A27A"></circle>
</g>
</svg>
</div>
<div className="m-stats">
<div><div className="cap">Range (City)</div><div className="num"><span className="count c145"></span><small>km</small></div></div>
<div><div className="cap">Curb Weight</div><div className="num"><span className="count c88"></span><small>kg</small></div></div>
<div><div className="cap">Turn Radius</div><div className="num">1.4<small>m</small></div></div>
</div>
</div>
<div className="m-body">
<div className="kicker">Urban Intuition &amp; Poise</div>
<h2>MIRA</h2>
<p className="mtag">Wild Intuition</p>
<p className="desc" style={{marginTop: "18px"}}>A lightweight featherweight maestro tailored for historical boulevards, café avenues, and spontaneous detours. Infused with sun-drenched peach accents and an ultra-nimble step-through architecture that turns urban congestion into personal runway theater.</p>
<div className="m-list">
<div className="m-li"><span className="feat-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="13" cy="4" r="2"></circle><path d="M7 21l3-6 3 2v4M10 15l1-5 4 2 3-1"></path></svg></span><div><h4>Agile Monocoque Chassis</h4><p>Ultralight aeronautic aluminum core weighing just 88 kg dry.</p></div></div>
<div className="m-li"><span className="feat-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"></rect><path d="M8 20h8"></path></svg></span><div><h4>Café Telemetry Concierge</h4><p>Integrated haptic screen with smart route-stowaway &amp; valet lock.</p></div></div>
<div className="m-li"><span className="feat-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"></path><path d="M21 3v5h-5"></path></svg></span><div><h4>Tangerine Regeneration</h4><p>Single-pedal glide recovering up to 14% urban kinetic energy.</p></div></div>
</div>
<div className="m-acts">
<a href="#book" className="btn btn-p btn-sm">Explore MIRA</a>
<a href="#book" className="btn btn-d btn-sm">Book Test Ride</a>
<a href="#book" className="btn btn-l btn-sm">Enquire</a>
</div>
</div>
</article>
</>) : null}

{visible("vira") ? (<>
<article className="model dark">
<div className="m-media">
<div className="m-top"><span className="series">Series III · Apex Corsa</span><span className="idx">03</span></div>
<div className="m-img">
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
<div><div className="cap">Top Velocity</div><div className="num"><span className="count c125"></span><small>km/h</small></div></div>
<div><div className="cap">0–60 km/h</div><div className="num">2.6<small>s</small></div></div>
<div><div className="cap">Peak Torque</div><div className="num"><span className="count c86"></span><small>Nm</small></div></div>
</div>
</div>
<div className="m-body">
<div className="kicker">Raw Aerodynamic Force</div>
<h2>VIRA</h2>
<p className="mtag">Uncompromising Power</p>
<p className="desc" style={{marginTop: "18px"}}>The dark monolith. Chiseled for apex cornering with aerodynamic winglets, high-discharge cylindrical chemistry cells, and inverted dual-damper suspension borrowed directly from premier superbike engineering.</p>
<div className="m-list">
<div className="m-li"><span className="feat-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"></path></svg></span><div><h4>Overboost Corsa Mode</h4><p>Surges power from 9kW to 14kW peak for lightning overtake windows.</p></div></div>
<div className="m-li"><span className="feat-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12h13M3 7h9M3 17h6M17 8l4 4-4 4"></path></svg></span><div><h4>Aero-Strake Fairings</h4><p>Downforce induction channels engineered to anchor high-speed stability.</p></div></div>
<div className="m-li"><span className="feat-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"></path></svg></span><div><h4>Active Thermal Liquid Loop</h4><p>Maintains peak continuous discharge even under demanding climates.</p></div></div>
</div>
<div className="m-acts">
<a href="#book" className="btn btn-p btn-sm">Explore VIRA</a>
<a href="#book" className="btn btn-d btn-sm">Book Test Ride</a>
<a href="#book" className="btn btn-l btn-sm">Enquire</a>
</div>
</div>
</article>
</>) : null}
</div>


<section style={{background: "var(--bg2)", padding: "80px 0"}}>
<div className="wrap">
<div className="card compare rv">
<div className="compare-top">
<div style={{maxWidth: "640px"}}>
<span className="tag">⚡ Telemetry Matrix</span>
<h2 className="h2">Can’t Decide Between Personalities?</h2>
<p className="sub">Compare mechanical geometry, riding stances, luggage capacities, and bespoke battery architectures side by side with real-time range estimators.</p>
</div>
<div style={{textAlign: "right"}}>
<button type="button" className="btn btn-d" onClick={() => setCmp((value) => !value)} aria-expanded={cmpOpen}>{cmpOpen ? "Hide Comparator" : "Launch Comparator"} <svg className="arr" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></button>
<div className="foot-note" style={{marginTop: "10px"}}>3 Models · 18 Measurable Metrics</div>
</div>
</div>
<div className="cmp-cards">
<div className="cmp-card"><span className="foot-note">RIVA · Grand Tourer</span><h4>Up to 185 km Range</h4><p>Optimal for dual touring &amp; highway cruising</p></div>
<div className="cmp-card"><span className="foot-note">MIRA · Urban Purist</span><h4>88 kg Ultra-Agile Frame</h4><p>Bespoke step-through for boutique commutes</p></div>
<div className="cmp-card"><span className="foot-note">VIRA · Apex Corsa</span><h4>125 km/h Top Velocity</h4><p>Twin inverted forks &amp; launch control</p></div>
</div>
{cmpOpen ? (<>
<div className="cmp-table">

<div className="cmp-row">
<b>Range</b>
<div className="bars">
<div className="bar-l"><span>RIVA</span><div className="track"><div className="fill" style={{width: "100%"}}></div></div><span>185 km</span></div>
<div className="bar-l"><span>MIRA</span><div className="track"><div className="fill f2" style={{width: "78%"}}></div></div><span>145 km</span></div>
<div className="bar-l"><span>VIRA</span><div className="track"><div className="fill f3" style={{width: "65%"}}></div></div><span>120 km</span></div>
</div>
</div>

<div className="cmp-row">
<b>Top Speed</b>
<div className="bars">
<div className="bar-l"><span>RIVA</span><div className="track"><div className="fill" style={{width: "68%"}}></div></div><span>85 km/h</span></div>
<div className="bar-l"><span>MIRA</span><div className="track"><div className="fill f2" style={{width: "56%"}}></div></div><span>70 km/h</span></div>
<div className="bar-l"><span>VIRA</span><div className="track"><div className="fill f3" style={{width: "100%"}}></div></div><span>125 km/h</span></div>
</div>
</div>

<div className="cmp-row">
<b>Weight</b>
<div className="bars">
<div className="bar-l"><span>RIVA</span><div className="track"><div className="fill" style={{width: "88%"}}></div></div><span>112 kg</span></div>
<div className="bar-l"><span>MIRA</span><div className="track"><div className="fill f2" style={{width: "69%"}}></div></div><span>88 kg</span></div>
<div className="bar-l"><span>VIRA</span><div className="track"><div className="fill f3" style={{width: "100%"}}></div></div><span>128 kg</span></div>
</div>
</div>

<div className="cmp-row">
<b>Peak Torque</b>
<div className="bars">
<div className="bar-l"><span>RIVA</span><div className="track"><div className="fill" style={{width: "49%"}}></div></div><span>42 Nm</span></div>
<div className="bar-l"><span>MIRA</span><div className="track"><div className="fill f2" style={{width: "35%"}}></div></div><span>30 Nm</span></div>
<div className="bar-l"><span>VIRA</span><div className="track"><div className="fill f3" style={{width: "100%"}}></div></div><span>86 Nm</span></div>
</div>
</div>

<div className="cmp-row">
<b>Fast Charge 0–80%</b>
<div className="bars">
<div className="bar-l"><span>RIVA</span><div className="track"><div className="fill" style={{width: "100%"}}></div></div><span>45 min</span></div>
<div className="bar-l"><span>MIRA</span><div className="track"><div className="fill f2" style={{width: "89%"}}></div></div><span>40 min</span></div>
<div className="bar-l"><span>VIRA</span><div className="track"><div className="fill f3" style={{width: "78%"}}></div></div><span>35 min</span></div>
</div>
</div>

<div className="cmp-row">
<b>Under-seat Storage</b>
<div className="bars">
<div className="bar-l"><span>RIVA</span><div className="track"><div className="fill" style={{width: "100%"}}></div></div><span>32 L</span></div>
<div className="bar-l"><span>MIRA</span><div className="track"><div className="fill f2" style={{width: "69%"}}></div></div><span>22 L</span></div>
<div className="bar-l"><span>VIRA</span><div className="track"><div className="fill f3" style={{width: "56%"}}></div></div><span>18 L</span></div>
</div>
</div>

</div>
</>) : null}
</div>
</div>
</section>

<div className="wrap" style={{paddingTop: "80px"}}>
<div className="duo">
<div className="card lt rv-s">
<div className="kicker plain">Enterprise &amp; Retail Network</div>
<h3>Looking to stock MRIGA in your territory?</h3>
<p className="desc">Join Bharat’s most exclusive electric mobility atelier network. Selected franchise partners receive full architect-designed showroom fit-outs, technician academies, and prioritized production allocations.</p>
<div className="acts">
<a href="/dealers" className="btn btn-d btn-sm">Become an Authorized Dealer</a>
<a href="/dealers" className="tlink">Dealer Program Overview</a>
</div>
</div>
<div className="card dk rv-s">
<div className="kicker plain">Private Atelier Test Rides</div>
<h3>Experience Haute Mobility in Person.</h3>
<p className="desc">Schedule a 45-minute private sensory session with our mobility curators in Mumbai, Delhi, Bengaluru, or Jaipur.</p>
<div className="acts"><a href="#book" className="btn btn-p btn-block">Reserve Your Session</a></div>
</div>
</div>
</div>

    </main>
  );
}
