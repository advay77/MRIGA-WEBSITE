"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CatalogueActions } from "@/components/catalogue-actions";
import { Reveal } from "@/components/reveal";
import { useModels, useSiteContent } from "@/components/site-content";
import { MIRA_COLOURS, type MiraColourId } from "@/lib/mira";
import { APP_FEATURES, WARRANTY, type ModelId } from "@/lib/specs";

export function ModelPage({ model, initialColour = "pink" }: { model: ModelId; initialColour?: string }) {
  const { specs, photos } = useModels();
  const spec = specs[model];
  const star = model === "mira";
  const content = useSiteContent();
  const gallery = star ? [] : photos[model].map((slot) => `/media/${slot}`);
  const [pic, setPic] = useState(0);
  const current = gallery[pic] ?? gallery[0];
  const start = MIRA_COLOURS.some((item) => item.id === initialColour) ? (initialColour as MiraColourId) : "pink";
  const [colourId, setColourId] = useState<MiraColourId>(start);
  const [shot, setShot] = useState(0);
  const colour = MIRA_COLOURS.find((item) => item.id === colourId) ?? MIRA_COLOURS[0];
  const frame = colour.shots[shot] ?? colour.shots[0];

  useEffect(() => {
    if (!star || colour.shots.length < 2) return;
    const timer = window.setInterval(() => setShot((current) => (current + 1) % colour.shots.length), 3200);
    return () => window.clearInterval(timer);
  }, [colour, star]);

  useEffect(() => {
    if (gallery.length < 2) return;
    const timer = window.setInterval(() => setPic((index) => (index + 1) % gallery.length), 3600);
    return () => window.clearInterval(timer);
  }, [gallery.length]);

  const groups = star
    ? [...spec.groups, { title: "Price", rows: [["LiFePO4 (lithium)", `${content.lithiumPrice} · ${content.lithiumDetail}`], ["SLA (lead-acid)", `${content.leadPrice} · ${content.leadDetail}`], ["Colours", "Pink, orange and brown beige"]] as [string, string][] }]
    : spec.groups;

  return (
    <main className="page model">
      <Reveal />
      <section className="phead model-head">
        <div className="wrap">
          <span className={star ? "eyebrow star-badge" : "eyebrow"}><span className="dot" />{star ? "★ Star product · on sale now" : `${spec.status} · ${spec.name}`}</span>
          <h1 className="h1 mixed model-title" data-reveal>{spec.name}</h1>
          <p className="lead model-tagline" data-reveal>{spec.tagline} {spec.summary}</p>
          <div data-reveal><CatalogueActions model={model} name={spec.name} /></div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap model-layout">
          {star ? (
            <div className="model-stage star-stage" style={{ background: colour.wash }} data-reveal>
              <div className="model-colours">
                {MIRA_COLOURS.map((item) => (
                  <button key={item.id} type="button" className={item.id === colour.id ? "swatch-btn on" : "swatch-btn"} onClick={() => { setColourId(item.id); setShot(0); }}>
                    <i style={{ background: item.swatch }} />
                    {item.name}
                  </button>
                ))}
              </div>
              <img key={frame} className="model-photo" src={frame} alt={`MIRA in ${colour.name}`} />
              <div className="shot-row">
                {colour.shots.map((src, index) => (
                  <button key={src} type="button" className={index === shot ? "on" : undefined} onClick={() => setShot(index)} aria-label={`${colour.name} photo ${index + 1}`}>
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={current ? "model-stage gallery-stage" : "model-stage model-soon"} data-reveal>
              {current ? (
                <>
                  <img key={current} className="model-photo" src={current} alt={`${spec.name} photo ${pic + 1}`} />
                  {gallery.length > 1 ? (
                    <div className="shot-row">
                      {gallery.map((src, index) => (
                        <button key={src} type="button" className={index === pic ? "on" : undefined} onClick={() => setPic(index)} aria-label={`${spec.name} photo ${index + 1}`}>
                          <img src={src} alt="" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <span className="soon-ring" aria-hidden="true" />
                  <span className="kicker">{spec.name}</span>
                  <h2 className="h2">Photographs coming soon.</h2>
                  <p>The full specification is ready below. Download the catalogue to share it.</p>
                </>
              )}
            </div>
          )}

          <div className="spec-block">
            <div className="kicker">At a glance</div>
            <div className="hl-grid" data-reveal>
              {spec.highlights.map((item) => (
                <div key={item.label} className="hl">
                  <b>{/^\d+$/.test(item.value) ? <span data-count={item.value}>{item.value}</span> : item.value}{item.unit ? <small>{item.unit}</small> : null}</b>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="cta-row" style={{ marginTop: 22 }}>
              <a href="#book" className="btn btn-p">{star ? "Book a MIRA test ride" : `Register interest in ${spec.name}`}</a>
              <Link href="/collection" className="btn btn-g">Compare all models</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="sec spec-sec">
        <div className="wrap">
          <div className="kicker">Specifications</div>
          <h2 className="h2">{spec.name} in detail</h2>
          <div className="spec-groups">
            {groups.map((group, index) => (
              <article key={group.title} className="spec-group" data-reveal style={{ ["--i" as string]: index }}>
                <h3>{group.title}</h3>
                <dl>
                  {group.rows.map(([label, value]) => (
                    <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                  ))}
                </dl>
              </article>
            ))}
            <article className="spec-group warranty" data-reveal style={{ ["--i" as string]: groups.length }}>
              <h3>Warranty</h3>
              <p>Covers the <b>{WARRANTY.toLowerCase()}</b>.</p>
            </article>
          </div>
        </div>
      </section>

      {spec.app ? (
        <section className="sec app-sec">
          <div className="wrap">
            <div className="kicker">The MRIGA app</div>
            <h2 className="h2">Your {spec.name}, from your phone.</h2>
            <p className="lead">{APP_FEATURES.length} things the app does, from keyless proximity unlock to finding your scooter in a crowded lot.</p>
            <ol className="app-grid">
              {APP_FEATURES.map((feature, index) => (
                <li key={feature.title} data-reveal style={{ ["--i" as string]: index % 6 }}>
                  <span className="app-num">{String(index + 1).padStart(2, "0")}</span>
                  <b>{feature.title}</b>
                  <p>{feature.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="kicker">The three models</div>
          <div className="model-links">
            <Link href="/mira" className={star ? "on star-link" : "star-link"}>MIRA<span>★ Star product · on sale</span></Link>
            <Link href="/riva" className={model === "riva" ? "on" : undefined}>RIVA<span>{specs.riva.status} · connected</span></Link>
            <Link href="/vira" className={model === "vira" ? "on" : undefined}>VIRA<span>{specs.vira.status} · connected</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
