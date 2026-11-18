import Link from "next/link";
import { removeMedia, resetModel, saveMedia, saveModel, saveSiteContent } from "@/lib/admin-actions";
import { PhotoPicker, SubmitButton } from "@/components/admin-controls";
import { getSiteContent } from "@/lib/content";
import { prisma } from "@/lib/db";
import { getModels, modelKey, modelSlots } from "@/lib/models";
import { CONTENT_FIELDS, CONTENT_GROUPS, type ContentKey } from "@/lib/site-copy";
import { MODEL_IDS, SPECS, isModelId, type ModelId } from "@/lib/specs";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/uploads";

type Query = { model?: string; saved?: string; field?: string; slot?: string; t?: string };

const FIELD_ERRORS: Record<string, string> = {
  status: "Status label is needed (up to 40 characters).",
  tagline: "Tagline is needed (up to 120 characters).",
  summary: "Summary is needed (up to 400 characters).",
  highlights: "Keep at least one highlight, each with a value and a label.",
  specs: "Keep at least one specification group, each with a title and at least one line.",
  text: "Something in the form was not valid. Check the fields and save again.",
};

const STATUS_PRESETS = ["Star product", "On sale now", "Coming soon", "Launching soon", "Pre-booking open", "Sold out"];

export async function ModelsPanel({ query }: { query: Query }) {
  const id: ModelId = query.model && isModelId(query.model) ? query.model : "mira";
  const [{ specs, photos }, content, uploads, override] = await Promise.all([
    getModels(),
    id === "mira" ? getSiteContent() : null,
    prisma.mediaAsset.findMany({ where: { slot: { in: modelSlots(id).map((slot) => slot.id) } }, select: { slot: true, updatedAt: true, filename: true } }),
    prisma.siteSetting.findUnique({ where: { key: modelKey(id) }, select: { updatedAt: true } }),
  ]);
  const spec = specs[id];
  const uploaded = new Map(uploads.map((row) => [row.slot, row]));
  const live = photos[id].length;
  const prices = CONTENT_GROUPS.find((group) => group.id === "mira");
  const highlights = [...spec.highlights, ...Array.from({ length: Math.max(0, 6 - spec.highlights.length) }, () => ({ value: "", unit: "", label: "" }))].slice(0, 6);
  const groups = [...spec.groups, { title: "", rows: [] as [string, string][] }, { title: "", rows: [] as [string, string][] }].slice(0, 10);
  const stamp = (slot: string) => (query.slot === slot || query.saved === slot || query.saved === `removed-${slot}`) && query.t ? query.t : uploaded.get(slot)?.updatedAt.getTime() ?? "built-in";

  return (
    <div className="desk-stack">
      <nav className="model-tabs" aria-label="Choose a model">
        {MODEL_IDS.map((model) => (
          <Link key={model} href={`/admin?section=models&model=${model}`} className={model === id ? "on" : undefined} aria-current={model === id ? "page" : undefined}>
            <b>{model === "mira" ? "★ " : ""}{SPECS[model].name}</b>
            <small>{specs[model].status} · {photos[model].length} {photos[model].length === 1 ? "photo" : "photos"}</small>
          </Link>
        ))}
      </nav>

      <section className="desk-panel model-summary">
        <div>
          <h2>{spec.name}</h2>
          <p>{spec.tagline}</p>
          <div className="model-facts">
            <span className="pill-s">{spec.status}</span>
            <span className="pill-s">{live} {live === 1 ? "photo" : "photos"} on the site</span>
            <span className={override ? "pill-s edited" : "pill-s"}>{override ? `Text edited ${override.updatedAt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" })}` : "Original specifications"}</span>
          </div>
        </div>
        <div className="model-links-row">
          <Link href={`/${id}`} target="_blank" rel="noopener" className="btn btn-g btn-sm">View page ↗</Link>
          <a href={`/catalogue/${id}`} target="_blank" rel="noopener" className="btn btn-g btn-sm">Catalogue PDF ↗</a>
        </div>
      </section>

      <section className="desk-panel" id="photos">
        <h2>Photos</h2>
        <p>
          {id === "mira"
            ? "Pink, orange, brown beige, silver, grey and cream. Each colour keeps its own shots. Removing an upload brings back the built-in photo."
            : id === "vira"
              ? "Light blue, white, grey and black. The black colour includes the photographs of the three scooters together. Removing an upload brings back the built-in photo."
              : "Grey, silver and cream. Grey is the cover on Home, Explore and the PDF catalogue. The RIVA page also has an All view of every shot. Removing an upload brings back the built-in photo."}
        </p>
        <div className="photo-grid">
          {modelSlots(id).map((slot) => {
            const has = uploaded.has(slot.id);
            const builtIn = slot.fallback !== "logo.png";
            return (
              <div key={slot.id} id={`photo-${slot.id}`} className="photo-card">
                <b>{slot.label}{has ? <em className="slot-tag on">Uploaded</em> : builtIn ? <em className="slot-tag">Built-in</em> : <em className="slot-tag off">Empty</em>}</b>
                <form action={saveMedia} className="photo-form">
                  <input type="hidden" name="slot" value={slot.id} />
                  <PhotoPicker current={has || builtIn ? `/media/${slot.id}?v=${stamp(slot.id)}` : ""} maxBytes={MAX_UPLOAD_BYTES} maxLabel={MAX_UPLOAD_LABEL} />
                </form>
                {has ? (
                  <form action={removeMedia}>
                    <input type="hidden" name="slot" value={slot.id} />
                    <SubmitButton className="btn btn-l btn-sm photo-remove" pending="Removing…">{builtIn ? "Use built-in photo" : "Remove photo"}</SubmitButton>
                  </form>
                ) : null}
                {query.saved === slot.id ? <p className="desk-note" role="status">Photo saved. It is live now.</p> : null}
                {query.saved === `removed-${slot.id}` ? <p className="desk-note" role="status">{builtIn ? "Back to the built-in photo." : "Removed from the site."}</p> : null}
                {query.saved === "photo-error" && query.slot === slot.id ? <p className="desk-note bad" role="alert">Use a JPG, PNG, or WEBP under {MAX_UPLOAD_LABEL}.</p> : null}
              </div>
            );
          })}
        </div>
      </section>

      {id === "mira" && content && prices ? (
        <section className="desk-panel" id="prices">
          <h2>Prices</h2>
          <p>Shown on Home, Explore, the MIRA page and its catalogue.</p>
          {query.saved === "prices" ? <p className="desk-note" role="status">Prices saved. The site shows them now.</p> : null}
          <form className="form" action={saveSiteContent}>
            <input type="hidden" name="block" value="mira" />
            <input type="hidden" name="model" value="mira" />
            <div className="field-grid">
              {prices.keys.map((key) => {
                const field = CONTENT_FIELDS.find((item) => item.key === key);
                if (!field) return null;
                const long = key.endsWith("Detail");
                return (
                  <div className={long ? "fld wide" : "fld"} key={key}>
                    <label htmlFor={`m-${key}`}>{field.label}</label>
                    {long
                      ? <textarea id={`m-${key}`} name={key} className="plain-in" rows={3} maxLength={600} defaultValue={content[key as ContentKey]} />
                      : <input id={`m-${key}`} name={key} className="plain-in" maxLength={600} defaultValue={content[key as ContentKey]} />}
                  </div>
                );
              })}
            </div>
            <SubmitButton className="btn btn-p" pending="Saving…">Save prices</SubmitButton>
          </form>
        </section>
      ) : null}

      <section className="desk-panel" id="details">
        <h2>Text and specifications</h2>
        <p>Everything written about {spec.name} on its page, the model cards and the PDF catalogue.</p>
        {query.saved === "text" ? <p className="desk-note" role="status">Saved. The {spec.name} page and catalogue show it now.</p> : null}
        {query.saved === "reset" ? <p className="desk-note" role="status">Back to the original specifications.</p> : null}
        {query.saved === "error" ? <p className="desk-note bad" role="alert">{FIELD_ERRORS[query.field ?? "text"] ?? FIELD_ERRORS.text} Nothing was saved.</p> : null}
        <form className="form model-form" action={saveModel} key={`${id}-${override?.updatedAt.getTime() ?? "default"}`}>
          <input type="hidden" name="model" value={id} />
          <div className="field-grid">
            <div className="fld">
              <label htmlFor="mf-status">Status label</label>
              <input id="mf-status" name="status" className="plain-in" list="status-presets" maxLength={40} required defaultValue={spec.status} />
              <datalist id="status-presets">{STATUS_PRESETS.map((item) => <option key={item} value={item} />)}</datalist>
              <small className="fld-hint">The badge on cards and the catalogue cover, e.g. Coming soon or On sale now.</small>
            </div>
            <div className="fld">
              <label htmlFor="mf-tagline">Tagline</label>
              <input id="mf-tagline" name="tagline" className="plain-in" maxLength={120} required defaultValue={spec.tagline} />
              <small className="fld-hint">One short line under the name.</small>
            </div>
            <div className="fld wide">
              <label htmlFor="mf-summary">Summary</label>
              <textarea id="mf-summary" name="summary" className="plain-in" rows={3} maxLength={400} required defaultValue={spec.summary} />
              <small className="fld-hint">Two or three sentences for the page header and the model cards.</small>
            </div>
            <label className="check wide">
              <input type="checkbox" name="app" defaultChecked={spec.app} /> Show the MRIGA app section (15 app features) on this page
            </label>
          </div>

          <h3 className="model-sub">At a glance</h3>
          <p className="model-help">Up to six big numbers on the page. Leave a row empty to hide it. Unit is optional (km, km/h, W).</p>
          <div className="hl-edit">
            <span className="hl-head">Value</span><span className="hl-head">Unit</span><span className="hl-head">Label</span>
            {highlights.map((item, index) => (
              <div className="hl-row" key={index}>
                <input name={`h${index}_value`} className="plain-in" aria-label={`Highlight ${index + 1} value`} maxLength={16} defaultValue={item.value} placeholder="85" />
                <input name={`h${index}_unit`} className="plain-in" aria-label={`Highlight ${index + 1} unit`} maxLength={10} defaultValue={item.unit} placeholder="km" />
                <input name={`h${index}_label`} className="plain-in" aria-label={`Highlight ${index + 1} label`} maxLength={40} defaultValue={item.label} placeholder="Range, LiFePO4" />
              </div>
            ))}
          </div>

          <h3 className="model-sub">Specifications</h3>
          <p className="model-help">One line per row, written <code>Label: value</code>, e.g. <code>Top speed: 25 km/h</code>. Clear a group&apos;s title and lines to delete it; fill an empty group to add one.</p>
          <div className="spec-edit">
            {groups.map((group, index) => (
              <fieldset className={group.title ? "spec-card" : "spec-card blank"} key={index}>
                <legend className="sr-only">Specification group {index + 1}</legend>
                <input name={`g${index}_title`} className="plain-in spec-title" aria-label={`Group ${index + 1} title`} maxLength={60} defaultValue={group.title} placeholder={group.title ? "" : "New group title, e.g. Comfort"} />
                <textarea name={`g${index}_rows`} className="plain-in" aria-label={`Group ${index + 1} lines`} rows={Math.max(3, group.rows.length + 1)} defaultValue={group.rows.map(([label, value]) => `${label}: ${value}`).join("\n")} placeholder={"Seat height: 760 mm\nBoot space: 22 L"} />
              </fieldset>
            ))}
          </div>

          <div className="model-actions">
            <SubmitButton className="btn btn-p" pending="Saving…">Save {spec.name}</SubmitButton>
            <span className="model-help">The warranty line ({"motor, controller, battery and charger"}) is shared by all models.</span>
          </div>
        </form>
        {override ? (
          <form action={resetModel} className="model-reset">
            <input type="hidden" name="model" value={id} />
            <SubmitButton className="btn btn-l btn-sm" pending="Resetting…">Reset {spec.name} to the original specifications</SubmitButton>
          </form>
        ) : null}
      </section>
    </div>
  );
}
