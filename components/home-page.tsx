"use client";

import { useState } from "react";
import { MIRA_COLOURS } from "@/lib/mira";

const POSTS = [
  {
    loc: "#MRIGAOutdoors · Hyderabad",
    quote: "“I stopped rushing through the city. Riding Riva made me fall in love with the streets again.”",
    name: "Ananya S.",
    role: "Architect & Riva Owner",
    body: "#EFE6CF",
    seat: "#A8642F",
    sunX: 300,
    sky1: "#F6C99A",
    sky2: "#FBEBD8",
    sun: "#F07A43",
    b1: "#E2B98C",
    b2: "#D7A877",
    b3: "#C9935F",
    ground: "#B98A62",
  },
  {
    loc: "#WildAndFree · South Mumbai",
    quote: "“The instant torque is playful, but what turns heads is the sheer design poise. Nothing else looks like this.”",
    name: "Karan V.",
    role: "Creative Director & Mira Rider",
    body: "#F2A27A",
    seat: "#6B4A3A",
    sunX: 90,
    sky1: "#F6C99A",
    sky2: "#FBEBD8",
    sun: "#F07A43",
    b1: "#E2B98C",
    b2: "#D7A877",
    b3: "#C9935F",
    ground: "#B98A62",
  },
  {
    loc: "#ElectricElegance · Jaipur",
    quote: "“Pure tranquility. No vibration, no petrol smell, just clean, sculptural movement through dawn.”",
    name: "Rohini M.",
    role: "Textile Designer",
    body: "#F5EFE2",
    seat: "#8a5a32",
    sunX: 210,
    sky1: "#F6C99A",
    sky2: "#FBEBD8",
    sun: "#F07A43",
    b1: "#E2B98C",
    b2: "#D7A877",
    b3: "#C9935F",
    ground: "#B98A62",
  },
];

function Arrow({ size = 16 }: { size?: number }) {
  return (
    <svg className="arr" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Wheels({ light = "#d8d2c6", spoke = "#8d867a", cross = true }: { light?: string; spoke?: string; cross?: boolean }) {
  const spokes = (cx: number) => (
    <path d={`M${cx} 211v50M${cx - 25} 236h50${cross ? `M${cx - 18} 218l36 36M${cx + 18} 218l-36 36` : ""}`} stroke={spoke} strokeWidth="3" />
  );
  return (
    <>
      <g className="spin">
        <circle cx="96" cy="236" r="44" fill="#1d1a1a" />
        <circle cx="96" cy="236" r="27" fill={light} />
        {spokes(96)}
      </g>
      <g className="spin">
        <circle cx="318" cy="236" r="44" fill="#1d1a1a" />
        <circle cx="318" cy="236" r="27" fill={light} />
        {spokes(318)}
      </g>
    </>
  );
}

function CreamScooter({ seat = "#A8642F", body = "#EFE6CF", deck = "#cfc4ac" }: { seat?: string; body?: string; deck?: string }) {
  return (
    <>
      <path d="M50 206 C42 150 86 116 150 120 L208 126 C222 164 232 186 268 192 L282 198 C266 222 140 230 56 216 Z" fill={body} />
      <path d="M140 196 L268 192 L272 206 L140 212 Z" fill={deck} />
      <path d="M258 198 C254 148 270 96 288 66 L306 70 C296 110 290 160 306 206 Z" fill={body} />
      <path d="M268 214 C278 184 352 184 360 216 L346 216 C336 198 290 198 282 216 Z" fill={body} />
      <path d="M92 118 C110 96 190 96 212 110 C212 126 100 130 92 118 Z" fill={seat} />
      <path d="M292 68 L284 36M256 36 L318 32" stroke="#3a3330" strokeWidth="6" strokeLinecap="round" />
    </>
  );
}

export function HomePage() {
  const [liked, setLiked] = useState<Record<number, boolean>>({});

  return (
      <main className="page">
        <section className="hero" id="top">
          <div className="hero-bg" aria-hidden="true">
            <div className="orb a" />
            <div className="orb b" />
          </div>
          <div className="wrap hero-grid">
            <div>
              <span className="eyebrow fade-up"><span className="dot" />100% Electric Haute Mobility · Bharat Flagship</span>
              <h1 className="h1">
                <span className="ln"><span>Your City.</span></span>
                <span className="ln"><span><em>Your Rules.</em></span></span>
                <span className="ln"><span>Your Ride.</span></span>
              </h1>
              <p className="lead fade-up d1">Meet the new expression of electric freedom. Fusing timeless sartorial craft with silent, exhilarating propulsion — designed for those who move deliberately.</p>
              <div className="cta-row fade-up d2">
                <a href="#collection" className="btn btn-p">Explore Our Scooters <Arrow /></a>
                <a href="#book" className="btn btn-g">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M6 17h6l3-7h3M9 7h3" />
                  </svg>
                  Book a Test Ride
                </a>
              </div>
              <div className="chips fade-up d3">
                <div className="chip">
                  <span className="chip-ic">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" /><path d="M2 21c0-3 1.9-5.4 5-6" /></svg>
                  </span>
                  <span><b>Pure Expression</b>0g Emissions · Silent Cadence</span>
                </div>
                <div className="chip">
                  <span className="chip-ic">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
                  </span>
                  <span><b>Deliveries Opening</b>Across 18 Metropolitan Centers</span>
                </div>
              </div>
            </div>

            <div className="stage-h hero-film fade-up d2">
              <video
                className="hero-video"
                src="/mira.mp4"
                poster="/mira/pink.png"
                playsInline
                muted
                loop
                autoPlay
                onError={(event) => {
                  event.currentTarget.hidden = true;
                  event.currentTarget.nextElementSibling?.removeAttribute("hidden");
                }}
              />
              <div className="hero-video-fallback" hidden>
                <img src="/mira/pink.png" alt="MIRA" />
              </div>
            </div>
          </div>
          <div className="marquee" aria-hidden="true">
            <div className="mq">
              {[0, 1].map((copy) => (
                <span key={copy}>
                  MIRA by MRIGA <i /> Star Product <i /> Pink · Orange · Brown Beige <i /> 70–80 km Lithium <i /> Rohini, New Delhi <i />
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="sec" id="collection">
          <div className="wrap">
            <div className="sec-head rv">
              <div>
                <div className="kicker">The Haute Collection</div>
                <h2 className="h2">Three Personalities. <em>One Electric Soul.</em></h2>
                <p className="sub">Architected for varied pulses of modern urban expression. Hand-sculpted fairings, authentic vegan saddlework, and responsive instantaneous torque.</p>
              </div>
              <a href="/collection" className="tlink">Compare All Models <Arrow size={14} /></a>
            </div>
            <div className="coll">
              <article className="card lift big rv-s">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div>
                    <span className="tag">Grand Tourer</span>
                    <h3 className="mname">RIVA</h3>
                    <p className="mtag">Pure Grace in Motion</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="foot-note" style={{ marginBottom: 8 }}>Aesthetic</div>
                    <div className="swatches"><i style={{ background: "#EFE6CF" }} /><i style={{ background: "#A8642F" }} /><i style={{ background: "#4A0E1F" }} /></div>
                  </div>
                </div>
                <div className="prod">
                  <svg viewBox="0 0 420 300" aria-hidden="true">
                    <Wheels />
                    <CreamScooter />
                    <circle cx="304" cy="54" r="15" fill="#EFE6CF" />
                    <circle cx="306" cy="54" r="9" fill="#fff8e6" stroke="#b9ad92" strokeWidth="2" />
                  </svg>
                  <span className="ptag">Featured Spec: Crema & Cuoio</span>
                </div>
                <p className="desc">Sculpted for refined inter-city promenades. Generous plush dual saddle, soft-glow circular signature optic, and ultra-smooth cruise dynamics.</p>
                <div className="pills">
                  <span className="pill">Range: <b>ARAI Verified</b></span>
                  <span className="pill">Hypercharge: <b>Fast-Hub Ready</b></span>
                  <span className="pill">Top Speed: <b>Tourer Stance</b></span>
                </div>
                <div className="card-foot">
                  <a href="/riva" className="btn btn-d btn-sm">Explore RIVA <Arrow size={14} /></a>
                  <span className="foot-note">Limited Debut Allocation</span>
                </div>
              </article>

              <div className="stack">
                <article className="card lift mini rv-s">
                  <div>
                    <span className="tag">Star Product</span>
                    <h3 className="mname">MIRA</h3>
                    <p className="mtag">Smart Mobility. Sustainable Future.</p>
                    <p className="desc">60V 30Ah lithium-ion, 70–80 km on a charge, about 5 hours to charge. Lead-acid is 60 km. Pink, orange, and brown beige.</p>
                    <div className="pills" style={{ marginTop: 14 }}>
                      <span className="pill">Lithium <b>₹75,000 · 3 yr</b></span>
                      <span className="pill">Lead-acid <b>₹62,000 · 1 yr</b></span>
                    </div>
                    <div className="swatches" style={{ marginTop: 14 }}><i style={{ background: "#E7A0B8" }} /><i style={{ background: "#E36A2C" }} /><i style={{ background: "#C4A484" }} /></div>
                    <a href="/mira" className="explore">
                      View specifications <Arrow size={14} />
                    </a>
                  </div>
                  <a href="/mira" className="prod mira-prod" aria-label="MIRA specifications">
                    <img src="/mira/pink.png" alt="MIRA in pink" />
                    <span className="ptag">Pink</span>
                  </a>
                </article>

                <article className="card lift mini rv-s">
                  <div>
                    <span className="tag">Apex Corsa</span>
                    <h3 className="mname">VIRA</h3>
                    <p className="mtag">Uncompromising Power</p>
                    <p className="desc">The dark monolith. Matte charcoal silhouette, aerodynamic strakes, forged lightweight alloy accents, and immediate full-torque launches.</p>
                    <div className="swatches" style={{ marginTop: 14 }}><i style={{ background: "#2a2a30" }} /><i style={{ background: "#E0602A" }} /><i style={{ background: "#9a9aa4" }} /></div>
                    <a href="/vira" className="explore">
                      Explore VIRA <Arrow size={14} />
                    </a>
                  </div>
                  <div className="prod dark-prod">
                    <svg viewBox="0 0 420 300" aria-hidden="true">
                      <path className="beam" d="M318 58 L420 34 L420 86 Z" fill="#E0602A" opacity=".25" />
                      <g className="spin"><circle cx="96" cy="236" r="44" fill="#0b0b0e" /><circle cx="96" cy="236" r="27" fill="#3a3a42" /><path d="M96 211v50M71 236h50M78 218l36 36M114 218l-36 36" stroke="#E0602A" strokeWidth="3" /></g>
                      <g className="spin"><circle cx="318" cy="236" r="44" fill="#0b0b0e" /><circle cx="318" cy="236" r="27" fill="#3a3a42" /><path d="M318 211v50M293 236h50M300 218l36 36M336 218l-36 36" stroke="#E0602A" strokeWidth="3" /></g>
                      <path d="M40 200 L70 140 L150 120 L214 126 C226 160 236 184 270 190 L290 198 C266 222 140 230 46 214 Z" fill="#2a2a30" />
                      <path d="M80 176 L200 160" stroke="#E0602A" strokeWidth="3" />
                      <path d="M140 196 L268 192 L272 206 L140 212 Z" fill="#1c1c22" />
                      <path d="M258 198 L276 100 L296 62 L316 70 L296 130 L306 206 Z" fill="#2a2a30" />
                      <path d="M264 214 L290 190 L350 192 L366 216 L346 216 L330 202 L290 202 L280 216 Z" fill="#2a2a30" />
                      <path d="M90 120 L200 108 L214 118 L100 128 Z" fill="#111" />
                      <path d="M296 64 L286 34M258 36 L320 30" stroke="#9a9aa4" strokeWidth="6" strokeLinecap="round" />
                      <path d="M300 58 L322 52 L318 66 Z" fill="#E0602A" />
                    </svg>
                    <span className="ptag">Apex Performance</span>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="sec mira-sec" id="mira">
          <div className="wrap">
            <div className="sec-head rv">
              <div>
                <div className="kicker">Star Product · Three Colours</div>
                <h2 className="h2">MIRA, in the colour you ride.</h2>
                <p className="sub">Pink, orange, and brown beige. Open a colour to read the full specifications.</p>
              </div>
            </div>
            <div className="mira-row">
              {MIRA_COLOURS.map((item, index) => (
                <a key={item.id} href={`/mira?colour=${item.id}`} className="mira-card" style={{ background: item.wash, animationDelay: `${index * 0.12}s` }}>
                  <img src={item.shots[0]} alt="" />
                  <span className="mira-meta">
                    <i style={{ background: item.swatch }} />
                    {item.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="sec mani" id="manifesto">
          <div className="wrap mani-grid">
            <div className="rv">
              <div className="kicker">Haute Mobility Manifesto</div>
              <p className="quote">“More than a ride. It’s an intimate expression of how we live, feel, and flow.”</p>
              <p className="sub">Most electric vehicles are conceived inside sterile tech labs. MRIGA was conceived beneath the historic palatial colonnades of Indian architecture and the breathless tempo of our contemporary metropolitan centers.</p>
              <div className="feats">
                <div className="feat">
                  <span className="feat-ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22a10 10 0 1 1 10-10c0 2-1.5 3-3 3h-2a2 2 0 0 0-1 3.7c.6.5.4 1.6-.4 2-1 .2-2.3.3-3.6.3z" /><circle cx="7.5" cy="10.5" r="1" /><circle cx="12" cy="7" r="1" /><circle cx="16.5" cy="10.5" r="1" /></svg></span>
                  <div><h4>Sculpted for the Streets</h4><p>Smooth, organic curves that deflect city clutter with effortless grace.</p></div>
                </div>
                <div className="feat">
                  <span className="feat-ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6" /></svg></span>
                  <div><h4>Silent Kinetic Luxury</h4><p>Engineered acoustic balance allowing you to glide in quiet mindfulness.</p></div>
                </div>
                <div className="feat">
                  <span className="feat-ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="5" r="2" /><path d="M12 7v6l-4 8M12 13l4 8M6 11h12" /></svg></span>
                  <div><h4>Crafted Ergonomics</h4><p>Saddle geometry tailored for upright posture and untroubled daily journeys.</p></div>
                </div>
              </div>
            </div>
            <div className="collage rv-s">
              <div className="tile t1" aria-hidden="true">
                <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">
                  <path d="M0 260 C60 200 240 200 300 250 L300 400 L0 400 Z" fill="#A8642F" />
                  <path d="M0 270 C70 222 230 222 300 262" stroke="#c8864c" strokeWidth="3" fill="none" strokeDasharray="6 8" />
                  <path d="M30 300 C90 270 210 270 270 300" stroke="#8a4f22" strokeWidth="2" fill="none" strokeDasharray="5 7" />
                  <ellipse cx="150" cy="150" rx="70" ry="70" fill="var(--surface)" opacity=".6" />
                  <text x="150" y="156" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="20" fill="#7a5a3a">Mriga</text>
                </svg>
              </div>
              <div className="tile t2">
                <div className="big-n"><span className="count c18" /></div>
                <h4>Metropolitan Hubs</h4>
                <p>Bespoke delivery and white-glove atelier experience across India.</p>
              </div>
              <div className="tile t3" aria-hidden="true">
                <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">
                  <path d="M20 400 V160 A60 60 0 0 1 140 160 V400 Z" fill="var(--stone)" opacity=".8" />
                  <path d="M160 400 V120 A70 70 0 0 1 300 120 V400 Z" fill="var(--stone)" opacity=".6" />
                  <path d="M40 400 V170 A40 40 0 0 1 120 170 V400" stroke="var(--ink)" strokeOpacity=".18" strokeWidth="2" fill="none" />
                  <g transform="translate(40 250) scale(.55)">
                    <circle cx="96" cy="236" r="40" fill="#1d1a1a" />
                    <circle cx="318" cy="236" r="40" fill="#1d1a1a" />
                    <path d="M50 206 C42 150 86 116 150 120 L208 126 C222 164 232 186 268 192 L282 198 C266 222 140 230 56 216 Z" fill="#EFE6CF" />
                    <path d="M258 198 C254 148 270 96 288 66 L306 70 C296 110 290 160 306 206 Z" fill="#EFE6CF" />
                    <path d="M92 118 C110 96 190 96 212 110 C212 126 100 130 92 118 Z" fill="#A8642F" />
                  </g>
                </svg>
              </div>
              <div className="tile t4">
                <span className="tiny-k">Acoustic Purity</span>
                <p className="q">“The silence is not an absence. It is an elevated presence.”</p>
                <small>MRIGA Sound Labs · Bengaluru</small>
              </div>
            </div>
          </div>
        </section>

        <section className="sec" id="why">
          <div className="wrap">
            <div className="rv" style={{ textAlign: "center", marginBottom: 56 }}>
              <div className="kicker center">Engineering Philosophy</div>
              <h2 className="h2">Why Electric, Why MRIGA?</h2>
              <p className="sub" style={{ margin: "0 auto" }}>Built around the rhythms of Indian urban life — engineered to liberate you from gas stations, sterile plastics, and noisy commutes.</p>
            </div>
            <div className="why">
              <article className="wcard rv-s">
                <div className="wic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="7" width="16" height="10" rx="2" /><path d="M22 11v2M10 9l-2 3h4l-2 3" /></svg></div>
                <div className="wnum">01 · Convenience</div>
                <h3>Everyday Range & Plug Anywhere</h3>
                <p>Convenient home wall plug support and high-speed urban hub compatibility. Wake up everyday with a full reservoir of silent potential.</p>
                <span className="wtag">Smart Battery Guard™</span>
              </article>
              <article className="wcard rv-s">
                <div className="wic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" /></svg></div>
                <div className="wnum">02 · Detail</div>
                <h3>Haute Automotive Detailing</h3>
                <p>Hand-stitched vegan saddle leather, dual-coat automotive pearlescent lacquer, and custom brushed metal hardware designed to age with dignity.</p>
                <span className="wtag">Bespoke Saddlework</span>
              </article>
              <article className="wcard rv-s">
                <div className="wic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a14 14 0 0 1 20 0" /><circle cx="12" cy="19.5" r="1" /></svg></div>
                <div className="wnum">03 · OS Intelligence</div>
                <h3>Connected MRIGA Companion</h3>
                <p>Real-time geofencing, digital proximity key, remote temperature pre-conditioning, and seamless over-the-air ride profile refinements.</p>
                <span className="wtag">MRIGA Connect App</span>
              </article>
              <article className="wcard rv-s">
                <div className="wic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" /><path d="M2 21c0-3 1.9-5.4 5-6" /></svg></div>
                <div className="wnum">04 · Heritage</div>
                <h3>Zero Emission Wild Spirit</h3>
                <p>Proudly conceived and engineered in India. Sustainable materials coupled with circular lifecycle recycling protocols for battery packs.</p>
                <span className="wtag">Circular Lifecycle</span>
              </article>
            </div>
          </div>
        </section>

        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head rv">
              <div>
                <div className="kicker">Community & Culture</div>
                <h2 className="h2">The World Looks Different On a MRIGA</h2>
                <p className="sub">Moments shared by owners, riders, and tastemakers transforming their daily journey into personal cinema.</p>
              </div>
              <a href="#top" className="tlink">
                Follow @mrigamobility
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
              </a>
            </div>
            <div className="comm">
              {POSTS.map((post, index) => (
                <article className="card lift rv-s" key={post.name}>
                  <div className="scene" aria-hidden="true">
                    <svg viewBox="0 0 400 330" preserveAspectRatio="xMidYMid slice">
                      <defs>
                        <linearGradient id={`sky${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0" stopColor={post.sky1} />
                          <stop offset="1" stopColor={post.sky2} />
                        </linearGradient>
                      </defs>
                      <rect width="400" height="330" fill={`url(#sky${index})`} />
                      <circle cx={post.sunX} cy="90" r="46" fill={post.sun} opacity=".8" />
                      <path d="M0 330 V150 h40 v-30 h30 v30 h40 V110 A40 40 0 0 1 190 110 V330 Z" fill={post.b1} />
                      <path d="M200 330 V170 A50 50 0 0 1 300 170 V130 h40 v-20 h20 v20 h40 V330 Z" fill={post.b2} />
                      <path d="M120 330 V200 A30 30 0 0 1 180 200 V330 Z" fill={post.b3} />
                      <rect y="292" width="400" height="38" fill={post.ground} />
                      <g transform="translate(110 200) scale(.46)">
                        <circle cx="96" cy="236" r="40" fill="#1d1a1a" />
                        <circle cx="318" cy="236" r="40" fill="#1d1a1a" />
                        <path d="M50 206 C42 150 86 116 150 120 L208 126 C222 164 232 186 268 192 L282 198 C266 222 140 230 56 216 Z" fill={post.body} />
                        <path d="M258 198 C254 148 270 96 288 66 L306 70 C296 110 290 160 306 206 Z" fill={post.body} />
                        <path d="M92 118 C110 96 190 96 212 110 C212 126 100 130 92 118 Z" fill={post.seat} />
                        <path d="M292 68 L284 36M256 36 L318 32" stroke="#3a3330" strokeWidth="6" strokeLinecap="round" />
                      </g>
                    </svg>
                    <span className="loc">{post.loc}</span>
                  </div>
                  <div className="cbody">
                    <p className="cq-t">{post.quote}</p>
                    <div className="cfoot">
                      <span className="who"><b>{post.name}</b> · {post.role}</span>
                      <button
                        className={liked[index] ? "heart liked" : "heart"}
                        onClick={() => setLiked((current) => ({ ...current, [index]: !current[index] }))}
                        aria-label="Like this story"
                        aria-pressed={liked[index] ? true : false}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cta" id="book">
          <div className="wrap cta-in rv">
            <span className="eyebrow"><span className="dot" />Priority Reservation Gateway</span>
            <h2 className="up">Ready to Ride Different?</h2>
            <p>Your next favourite ride is waiting. Schedule an exclusive doorstep test ride or visit a flagship MRIGA Experience Atelier in your city.</p>
            <div className="cta-row">
              <a href="#book" className="btn btn-p">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M6 17h6l3-7h3M9 7h3" />
                </svg>
                Book Your VIP Test Ride
              </a>
              <a href="#manifesto" className="btn btn-o">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" />
                </svg>
                Locate Nearest Atelier
              </a>
            </div>
            <div className="assure">
              <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg> Doorstep Delivery Available</span>
              <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg> Complimentary Concierge Briefing</span>
              <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg> Flexible Ownership Plans</span>
            </div>
          </div>
        </section>
      </main>

  );
}
