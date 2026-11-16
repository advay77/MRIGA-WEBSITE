"use client";

import { useSiteContent } from "@/components/site-content";
import { MIRA_COLOURS } from "@/lib/mira";

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
  const content = useSiteContent();

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
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l2.2 6.4H21l-5.2 3.8 2 6.3L12 16.2 6.2 19.5l2-6.3L3 9.4h6.8z" /></svg>
                  </span>
                  <span><b>Sartorial Craft</b>Bespoke Tan Saddle · Monocoque</span>
                </div>
                <div className="chip">
                  <span className="chip-ic">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
                  </span>
                  <span><b>Showroom open</b>Rohini, New Delhi</span>
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
                <div className="kicker">The scooters</div>
                <h2 className="h2">RIVA, MIRA, and VIRA.</h2>
                <p className="sub">MIRA is ready to see. RIVA and VIRA stay on the site until their photographs and specifications arrive.</p>
              </div>
              <a href="/collection" className="tlink">Compare All Models <Arrow size={14} /></a>
            </div>
            <div className="coll">
              <article className="card lift big rv-s">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div>
                    <span className="tag">Coming next</span>
                    <h3 className="mname">RIVA</h3>
                    <p className="mtag">Photographs and specifications are next.</p>
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
                <p className="desc">RIVA will get its own photographs and specification sheet. Nothing is published here until those details are confirmed.</p>
                <div className="card-foot">
                  <a href="/riva" className="btn btn-d btn-sm">Explore RIVA <Arrow size={14} /></a>
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
                      <span className="pill">Lithium <b>{content.lithiumPrice} · 3 yr</b></span>
                      <span className="pill">Lead-acid <b>{content.leadPrice} Â· 1 yr</b></span>
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
                    <span className="tag">Coming next</span>
                    <h3 className="mname">VIRA</h3>
                    <p className="mtag">Photographs and specifications are next.</p>
                    <p className="desc">VIRA will get its own page details when the photographs and numbers are ready.</p>
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

        <section className="cta" id="book">
          <div className="wrap cta-in rv">
            <span className="eyebrow"><span className="dot" />Rohini showroom</span>
            <h2 className="up">Book a test ride.</h2>
            <p>{content.address} Call {content.phone}.</p>
            <div className="cta-row">
              <a href="#book" className="btn btn-p">Book a test ride</a>
              <a href="/contact" className="btn btn-o">Showroom location</a>
            </div>
          </div>
        </section>
      </main>

  );
}
