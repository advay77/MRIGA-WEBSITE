"use client";

import Link from "next/link";
import { useState } from "react";
import { useModels, useSiteContent } from "@/components/site-content";
import { MIRA_COLOURS, type MiraColourId } from "@/lib/mira";
import { RIVA_COLOURS, type RivaColourId } from "@/lib/riva";
import { VIRA_COLOURS, type ViraColourId } from "@/lib/vira";
import type { ModelId, ModelSpec } from "@/lib/specs";

const ORDER: ModelId[] = ["riva", "mira", "vira"];

// Reads a specification row by label (e.g. "Top speed"), as edited in the admin Models section.
function row(spec: ModelSpec, label: RegExp) {
  for (const group of spec.groups) {
    for (const [key, value] of group.rows) if (label.test(key)) return value;
  }
  return null;
}

// True when any specification line mentions the feature (label or value).
function has(spec: ModelSpec, feature: RegExp) {
  return spec.groups.some((group) => group.rows.some(([key, value]) => feature.test(key) || (feature.test(value) && !/^no\b/i.test(value))));
}

const FEATURES: { label: string; test: (spec: ModelSpec) => boolean }[] = [
  { label: "Mobile app", test: (spec) => spec.app || has(spec, /mobile app/i) },
  { label: "Keyless / smart-card entry", test: (spec) => has(spec, /keyless|smart-card/i) },
  { label: "Find My Scooter", test: (spec) => has(spec, /find my scooter/i) },
  { label: "Reverse mode", test: (spec) => has(spec, /reverse/i) },
  { label: "Cruise control", test: (spec) => has(spec, /cruise/i) },
  { label: "Disc brakes with CBS", test: (spec) => has(spec, /CBS/) },
  { label: "Anti-theft alarm", test: (spec) => has(spec, /anti-theft|alarm/i) },
];

function Tick({ on }: { on: boolean }) {
  return on
    ? <span className="pk-yes" aria-label="Yes"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7" /></svg></span>
    : <span className="pk-no" aria-label="No">—</span>;
}

export function ModelPicker() {
  const { specs, photos } = useModels();
  const content = useSiteContent();
  const [active, setActive] = useState<ModelId>("mira");
  const [colourId, setColourId] = useState<MiraColourId>("pink");
  const [rivaId, setRivaId] = useState<RivaColourId>("silver");
  const [viraId, setViraId] = useState<ViraColourId>("blue");
  const spec = specs[active];
  const star = active === "mira";
  const colour = MIRA_COLOURS.find((item) => item.id === colourId) ?? MIRA_COLOURS[0];
  const riva = RIVA_COLOURS.find((item) => item.id === rivaId) ?? RIVA_COLOURS[0];
  const vira = VIRA_COLOURS.find((item) => item.id === viraId) ?? VIRA_COLOURS[0];
  const shown = active === "mira" ? colour : active === "riva" ? riva : active === "vira" ? vira : null;
  const photo = shown ? shown.shots[0] : photos[active][0] ? `/media/${photos[active][0]}` : null;
  const price = (id: ModelId) => (id === "mira" ? `From ${content.leadPrice}` : "Announced at launch");

  return (
    <section className="sec pk-sec" id="choose">
      <div className="wrap">
        <div className="sec-head rv pk-head">
          <div>
            <div className="kicker">Three scooters · one family</div>
            <h2 className="h2">Which MRIGA is yours?</h2>
            <p className="sub">Tap a model to see it, its numbers, and how it compares with the other two.</p>
          </div>
        </div>

        <div className="pk-tabs" role="tablist" aria-label="Choose a model">
          {ORDER.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`pk-tab-${id}`}
              aria-selected={active === id}
              aria-controls="pk-panel"
              className={active === id ? "on" : undefined}
              onClick={() => setActive(id)}
            >
              <b>{id === "mira" ? "★ " : ""}{specs[id].name}</b>
              <small>{specs[id].status}</small>
            </button>
          ))}
        </div>

        <div className="pk-panel" id="pk-panel" role="tabpanel" aria-labelledby={`pk-tab-${active}`} key={active}>
          <div className={photo ? "pk-stage" : "pk-stage pk-empty"} style={shown ? { background: shown.wash } : undefined}>
            {photo ? <img key={photo} src={photo} alt={shown ? `${spec.name} in ${shown.name}` : spec.name} /> : (
              <div className="pk-soon">
                <span className="pk-ring" aria-hidden="true" />
                <b>{spec.name}</b>
                <span>Photographs coming soon</span>
              </div>
            )}
            {active === "mira" ? (
              <div className="pk-colours" role="group" aria-label="MIRA colour">
                {MIRA_COLOURS.map((item) => (
                  <button key={item.id} type="button" className={item.id === colour.id ? "on" : undefined} onClick={() => setColourId(item.id)} aria-pressed={item.id === colour.id}>
                    <i style={{ background: item.swatch }} />{item.name}
                  </button>
                ))}
              </div>
            ) : null}
            {active === "riva" ? (
              <div className="pk-colours" role="group" aria-label="RIVA colour">
                {RIVA_COLOURS.map((item) => (
                  <button key={item.id} type="button" className={item.id === riva.id ? "on" : undefined} onClick={() => setRivaId(item.id)} aria-pressed={item.id === riva.id}>
                    <i style={{ background: item.swatch }} />{item.name}
                  </button>
                ))}
              </div>
            ) : null}
            {active === "vira" ? (
              <div className="pk-colours" role="group" aria-label="VIRA colour">
                {VIRA_COLOURS.map((item) => (
                  <button key={item.id} type="button" className={item.id === vira.id ? "on" : undefined} onClick={() => setViraId(item.id)} aria-pressed={item.id === vira.id}>
                    <i style={{ background: item.swatch }} />{item.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="pk-info">
            <span className={star ? "pk-badge star" : "pk-badge"}>{star ? "★ " : ""}{spec.status}</span>
            <h3>{spec.name}</h3>
            <p className="pk-tag">{spec.tagline}</p>
            <p className="pk-sum">{spec.summary}</p>
            <ul className="pk-hl">
              {spec.highlights.slice(0, 4).map((item) => (
                <li key={item.label}><b>{item.value}{item.unit ? <small>{item.unit}</small> : null}</b><span>{item.label}</span></li>
              ))}
            </ul>
            <p className="pk-price">{price(active)}</p>
            <div className="cta-row pk-actions">
              <a href="#book" className="btn btn-p">{star ? "Book a MIRA test ride" : `Register interest in ${spec.name}`}</a>
              <Link href={`/${active}`} className="btn btn-d">View {spec.name}</Link>
              <a href={`/catalogue/${active}`} className="btn btn-g" download={`MRIGA-${spec.name}-catalogue.pdf`}>Catalogue PDF</a>
            </div>
          </div>
        </div>

        <div className="pk-compare rv">
          <h3>Side by side</h3>
          <div className="pk-table-wrap">
            <table className="pk-table">
              <thead>
                <tr>
                  <th scope="col"><span className="sr-only">Feature</span></th>
                  {ORDER.map((id) => (
                    <th scope="col" key={id} className={active === id ? "on" : undefined}>
                      <button type="button" onClick={() => setActive(id)}>{specs[id].name}</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Status", (id: ModelId) => specs[id].status],
                  ["Range", (id: ModelId) => row(specs[id], /^range/i) ?? "—"],
                  ["Top speed", (id: ModelId) => row(specs[id], /top speed/i) ?? "—"],
                  ["Motor", (id: ModelId) => row(specs[id], /^motor/i) ?? "—"],
                  ["Price", price],
                ].map(([label, value]) => (
                  <tr key={label as string}>
                    <th scope="row">{label as string}</th>
                    {ORDER.map((id) => <td key={id} className={active === id ? "on" : undefined}>{(value as (id: ModelId) => string)(id)}</td>)}
                  </tr>
                ))}
                {FEATURES.map((feature) => (
                  <tr key={feature.label}>
                    <th scope="row">{feature.label}</th>
                    {ORDER.map((id) => <td key={id} className={active === id ? "on" : undefined}><Tick on={feature.test(specs[id])} /></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
