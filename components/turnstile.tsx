"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
let loader: Promise<void> | null = null;

function loadTurnstile() {
  loader ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loader = null;
      reject(new Error("turnstile script failed"));
    };
    document.head.appendChild(script);
  });
  return loader;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function tokenOf(form: HTMLFormElement) {
  return form.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]')?.value || "";
}

// Waits until the form's Turnstile widget has a token (other than `used`, which the server has
// already spent). Resolves at once when Turnstile is off.
async function waitForToken(form: HTMLFormElement, timeoutMs: number, used = "") {
  if (!SITE_KEY) return true;
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const token = tokenOf(form);
    if (token && token !== used) return true;
    await sleep(200);
  }
  return false;
}

// The only error a visitor ever sees from the bot check, and only after a silent retry failed.
export const SEND_FAILED = "Couldn't send. Please check your internet connection and try again.";

// Sends a form protected by Turnstile without ever bothering the visitor: waits for the token,
// and if the server rejects it (expired, network blip) gets a fresh one and tries once more.
// `refresh` must remount the <Turnstile> (bump its key). Returns null when nothing worked.
export async function sendWithTurnstile<T extends { ok: boolean; retry?: boolean }>(
  form: HTMLFormElement,
  prepare: (data: FormData) => void,
  send: (data: FormData) => Promise<T>,
  refresh: () => void,
): Promise<T | null> {
  let used = "";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (!(await waitForToken(form, 20_000, used))) {
      refresh();
      if (!(await waitForToken(form, 15_000, used))) return null;
    }
    used = tokenOf(form);
    const data = new FormData(form);
    prepare(data);
    let result: T;
    try {
      result = await send(data);
    } catch {
      refresh();
      if (attempt === 0) continue;
      return null;
    }
    refresh();
    if (!result.ok && result.retry && attempt === 0) continue;
    return result;
  }
  return null;
}

// Renders Cloudflare's "verify you are human" check inside a form, always visible. The token
// lands in a hidden "cf-turnstile-response" field the server checks. Tokens are single-use:
// sendWithTurnstile remounts this (new `key`) after each submit to get a fresh one.
// Failures are only logged; Cloudflare retries on its own and sendWithTurnstile handles the rest,
// so visitors never see technical security messages.
export function Turnstile({ action }: { action: string }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SITE_KEY) return;
    let widget: string | undefined;
    let cancelled = false;
    loadTurnstile()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return;
        widget = window.turnstile.render(box.current, {
          sitekey: SITE_KEY,
          action,
          appearance: "always",
          size: "flexible",
          theme: "light",
          retry: "auto",
          "refresh-expired": "auto",
          "response-field-name": "cf-turnstile-response",
          "error-callback": (code: string | number) => {
            console.warn(`turnstile error ${code}`);
          },
        });
      })
      .catch(() => console.warn("turnstile script failed to load"));
    return () => {
      cancelled = true;
      if (widget && window.turnstile) window.turnstile.remove(widget);
    };
  }, [action]);

  if (!SITE_KEY) return null;
  return <div ref={box} className="ts-box" />;
}
