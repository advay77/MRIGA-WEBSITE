"use client";

import { useEffect, useState } from "react";
import { MIRA_COLOURS, type MiraColourId } from "@/lib/mira";

const MIRA_SPECS = [
  { label: "Battery", value: "60V 30Ah lithium-ion, or lead-acid." },
  { label: "Lithium-ion", value: "₹75,000. Up to 70–80 km on a single charge. 3-year guarantee on the scooter, including the battery, motor, controller, and digital display." },
  { label: "Lead-acid", value: "₹62,000. 60 km on a single charge. 1-year guarantee." },
  { label: "Charging", value: "About 5 hours. The charger warranty is 1 year." },
  { label: "Colours", value: "Pink, orange, and brown beige." },
  { label: "Promise", value: "MIRA by MRIGA. Smart mobility. Sustainable future." },
];

export function ModelPage({ model, initialColour = "pink" }: { model: "mira" | "riva" | "vira"; initialColour?: string }) {
  const start = MIRA_COLOURS.some((item) => item.id === initialColour) ? (initialColour as MiraColourId) : "pink";
  const [colourId, setColourId] = useState<MiraColourId>(start);
  const [shot, setShot] = useState(0);
  const colour = MIRA_COLOURS.find((item) => item.id === colourId) ?? MIRA_COLOURS[0];
  const name = model.toUpperCase();
  const frame = colour.shots[shot] ?? colour.shots[0];

  useEffect(() => {
    if (model !== "mira" || colour.shots.length < 2) return;
    const timer = window.setInterval(() => {
      setShot((current) => (current + 1) % colour.shots.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [colour, model]);

  function chooseColour(id: MiraColourId) {
    setColourId(id);
    setShot(0);
  }

  return (
    <main className="page">
      <section className="phead">
        <div className="wrap">
          <span className="eyebrow"><span className="dot" />{model === "mira" ? "Star Product" : "MRIGA"}</span>
          <h1 className="h1 mixed">{name}</h1>
          <p className="lead">
            {model === "mira"
              ? "Smart mobility. Sustainable future. The specifications sit on this page, with the colour you choose."
              : `${name} has its own page. Photographs and the final specification sheet come next.`}
          </p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap model-layout">
          {model === "mira" ? (
            <div className="model-stage" style={{ background: colour.wash }}>
              <div className="model-colours">
                {MIRA_COLOURS.map((item) => (
                  <button key={item.id} type="button" className={item.id === colour.id ? "swatch-btn on" : "swatch-btn"} onClick={() => chooseColour(item.id)}>
                    <i style={{ background: item.swatch }} />
                    {item.name}
                  </button>
                ))}
              </div>
              <img key={frame} src={frame} alt={`MIRA in ${colour.name}`} />
              <div className="shot-row">
                {colour.shots.map((src, index) => (
                  <button key={src} type="button" className={index === shot ? "on" : undefined} onClick={() => setShot(index)} aria-label={`${colour.name} photo ${index + 1}`}>
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="model-stage model-soon">
              <span className="kicker">{name}</span>
              <h2 className="h2">Photographs are next.</h2>
              <p>MIRA is the model we are finishing first. {name} will get its own colours and specification sheet on this same page.</p>
            </div>
          )}

          <div className="spec-block">
            <div className="kicker">Specifications</div>
            <h2 className="h2">{name} specifications</h2>
            {model === "mira" ? (
              <div className="spec-grid">
                {MIRA_SPECS.map((item) => (
                  <article key={item.label} className="spec-card">
                    <b>{item.label}</b>
                    <p>{item.value}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="spec-grid">
                <article className="spec-card">
                  <b>Status</b>
                  <p>The {name} specification sheet is not ready yet. Battery, range, price, and warranty will be added here.</p>
                </article>
                <article className="spec-card">
                  <b>Meanwhile</b>
                  <p>MIRA is open now, in pink, orange, and brown beige.</p>
                </article>
              </div>
            )}
            <div className="cta-row" style={{ marginTop: 22 }}>
              <a href="#book" className="btn btn-p">Book a {name} test ride</a>
              <a href="/collection" className="btn btn-g">Back to Explore</a>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="kicker">The three models</div>
          <div className="model-links">
            <a href="/mira" className={model === "mira" ? "on" : undefined}>MIRA<span>Star product</span></a>
            <a href="/riva" className={model === "riva" ? "on" : undefined}>RIVA<span>Coming next</span></a>
            <a href="/vira" className={model === "vira" ? "on" : undefined}>VIRA<span>Coming next</span></a>
          </div>
        </div>
      </section>
    </main>
  );
}
