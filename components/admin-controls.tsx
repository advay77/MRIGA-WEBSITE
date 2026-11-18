"use client";

import { useEffect, useId, useState, type ChangeEvent } from "react";
import { useFormStatus } from "react-dom";

// Disables itself and shows a busy label while its form's server action runs,
// so a slow upload or save cannot be submitted twice.
export function SubmitButton({ children, pending, className }: { children: React.ReactNode; pending: string; className?: string }) {
  const status = useFormStatus();
  return (
    <button type="submit" className={className} disabled={status.pending} aria-busy={status.pending}>
      {status.pending ? <span className="spinner" aria-hidden="true" /> : null}
      {status.pending ? pending : children}
    </button>
  );
}

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

// Shows the current photo, previews the chosen file, and checks type and size before upload.
// The server checks the file's real bytes again; this only saves a wasted round trip.
export function PhotoPicker({ current, maxBytes, maxLabel }: { current: string; maxBytes: number; maxLabel: string }) {
  const id = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function choose(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError("");
    if (!file) {
      setPreview(null);
      setName("");
      return;
    }
    if (!ACCEPT.includes(file.type)) {
      event.target.value = "";
      setPreview(null);
      setName("");
      setError("Choose a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > maxBytes) {
      event.target.value = "";
      setPreview(null);
      setName("");
      setError(`That photo is ${(file.size / 1024 / 1024).toFixed(1)}MB. Use one under ${maxLabel}.`);
      return;
    }
    setPreview(URL.createObjectURL(file));
    setName(`${file.name} · ${Math.max(1, Math.round(file.size / 1024))} KB`);
  }

  return (
    <>
      <div className="photo-frame">
        {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview and a dynamic /media route */}
        {preview ?? current ? <img src={preview ?? current} alt="" /> : <span className="photo-empty">No photo yet</span>}
        {preview ? <span className="photo-tag">New · not saved yet</span> : null}
      </div>
      <label className="photo-drop" htmlFor={id}>
        <input id={id} name="file" type="file" accept={ACCEPT.join(",")} required onChange={choose} />
        <span>{name || (current ? "Choose a new photo" : "Choose or drop a photo")}</span>
        <small>JPG, PNG, or WEBP · under {maxLabel}</small>
      </label>
      {error ? <p className="desk-note bad" role="alert">{error}</p> : null}
      {preview ? <SubmitButton className="btn btn-p btn-sm" pending="Uploading…">{current ? "Replace photo" : "Upload photo"}</SubmitButton> : null}
    </>
  );
}
