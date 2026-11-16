"use client";

import { useEffect, useRef, useState } from "react";

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

// Waits until the form's Turnstile widget has produced a token, so a fast click never sends an
// empty one. Resolves true at once when Turnstile is off. Read the form's data AFTER this resolves.
export async function waitForTurnstile(form: HTMLFormElement, timeoutMs = 8_000) {
  if (!SITE_KEY) return true;
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const field = form.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]');
    if (field?.value) return true;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return false;
}

export const TURNSTILE_WAIT_MESSAGE = "The security check is still running. Please wait a moment and press the button again.";

// Renders Cloudflare's "verify you are human" check inside a form, always visible. The token
// lands in a hidden "cf-turnstile-response" field the server checks.
// Tokens are single-use: give this component a new `key` after each submit to get a fresh one.
// Cloudflare error codes worth explaining: https://developers.cloudflare.com/turnstile/troubleshooting/client-side-errors/error-codes/
function explain(code: string) {
  if (code.startsWith("1102")) return "This site's address is not on the Turnstile widget's hostname list in Cloudflare.";
  if (code.startsWith("110")) return "The Turnstile site key is not valid.";
  if (code.startsWith("300") || code.startsWith("600")) return "Cloudflare could not confirm this browser. Refresh the page and try again.";
  return "Cloudflare's check could not load. Refresh the page and try again.";
}

export function Turnstile({ action }: { action: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [failure, setFailure] = useState("");

  useEffect(() => {
    if (!SITE_KEY) return;
    let widget: string | undefined;
    let cancelled = false;
    let solved = false;
    // Some failures (e.g. 110200, hostname not allowed) never reach error-callback in
    // "interaction-only" mode, so the widget just stalls. Say so after a fair wait.
    const watchdog = window.setTimeout(() => {
      if (!solved && !cancelled) {
        setFailure(`The security check has not finished. Refresh the page and try again. ${location.hostname === "localhost" ? "On localhost, use Cloudflare's test keys or add localhost to the widget's hostnames." : ""}`.trim());
      }
    }, 15_000);
    loadTurnstile()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return;
        widget = window.turnstile.render(box.current, {
          sitekey: SITE_KEY,
          action,
          // Always visible: the "Verifying… Success!" box reassures people the form is protected.
          appearance: "always",
          size: "flexible",
          theme: "light",
          "response-field-name": "cf-turnstile-response",
          // Also surface failures as text, so nobody is left with a silent, stuck form.
          "error-callback": (code: string | number) => {
            setFailure(`Security check failed (${code}). ${explain(String(code))}`);
            return true;
          },
          callback: () => {
            solved = true;
            setFailure("");
          },
        });
      })
      .catch(() => setFailure("Cloudflare's security check could not load. Check your connection and refresh the page."));
    return () => {
      cancelled = true;
      window.clearTimeout(watchdog);
      if (widget && window.turnstile) window.turnstile.remove(widget);
    };
  }, [action]);

  if (!SITE_KEY) return null;
  return (
    <>
      <div ref={box} className="ts-box" />
      {failure ? <p className="err" role="alert">{failure}</p> : null}
    </>
  );
}
