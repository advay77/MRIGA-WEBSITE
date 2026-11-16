"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, signUp, signUpRetailer } from "@/lib/actions";
import { announceAuthChange } from "@/components/account-chip";
import { useSiteContent } from "@/components/site-content";
import { SEND_FAILED, sendWithTurnstile, Turnstile } from "@/components/turnstile";
import { WhatsAppButton } from "@/components/whatsapp-button";

type LoungeUser = { name: string; role: string };

const ICON = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

// First "70–80 km" style range in the admin-editable detail text, so the stat never contradicts it.
function rangeFrom(detail: string) {
  return detail.match(/(\d+\s*[–-]\s*\d+|\d+)\s*km/i)?.[1]?.replace(/\s/g, "") ?? "70–80";
}

export function LoginPanel({ user, nextPath, startTab, notice = "", audience = "user", google = false }: { user: LoungeUser | null; nextPath: string; startTab: "in" | "up"; notice?: string; audience?: "user" | "retailer"; google?: boolean }) {
  const router = useRouter();
  const content = useSiteContent();
  const retailer = audience === "retailer";
  const [tab, setTab] = useState<"in" | "up">(startTab);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(Boolean(user));
  const [err, setErr] = useState("");
  const [info, setInfo] = useState(notice);
  const [check, setCheck] = useState(0);
  const [firstName, setFirstName] = useState(user ? user.name.split(" ")[0] : "");
  const up = tab === "up";

  function reset(next: "in" | "up") {
    setTab(next);
    setErr("");
    setInfo("");
    setBusy(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setErr("");
    setInfo("");
    const send = up ? (retailer ? signUpRetailer : signUp) : signIn;
    const result = await sendWithTurnstile(form, (data) => data.set("desk", retailer ? "retailer" : "member"), send, () => setCheck((value) => value + 1));
    setBusy(false);
    if (!result?.ok) {
      setErr(result?.error || SEND_FAILED);
      return;
    }
    setFirstName(result.name.split(" ")[0]);
    setDone(true);
    announceAuthChange();
    router.refresh();
  }

  async function leave() {
    await signOut();
    setDone(false);
    setFirstName("");
    setTab("in");
    announceAuthChange();
    router.refresh();
  }

  const title = up ? (retailer ? "Create a retailer account" : "Create your account") : "Welcome back";
  const subtitle = up
    ? (retailer ? "For showroom partners. Separate from a customer account." : "Book test rides and follow them in one place.")
    : (retailer ? "Sign in to your retailer account." : "Sign in to see your test-ride bookings and account details.");

  return (
    <main className="page">
      <section className="auth-wrap">
        <div className="wrap">
          <div className="auth fade-up">
            <div className="auth-l">
              <svg className="bgart" viewBox="0 0 600 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <path d="M0 700 V120 H600 V700 H470 V330 A170 170 0 0 0 130 330 V700 Z" fill="#000" />
                <path d="M160 700 V340 A140 140 0 0 1 440 340 V700" stroke="#fff" strokeOpacity=".35" strokeWidth="3" fill="none" />
                <g transform="translate(120 400) scale(.85)" opacity=".9">
                  <circle cx="96" cy="236" r="44" fill="#000" />
                  <circle cx="318" cy="236" r="44" fill="#000" />
                  <path d="M50 206 C42 150 86 116 150 120 L208 126 C222 164 232 186 268 192 L282 198 C266 222 140 230 56 216 Z" fill="#fff" opacity=".5" />
                  <path d="M258 198 C254 148 270 96 288 66 L306 70 C296 110 290 160 306 206 Z" fill="#fff" opacity=".5" />
                </g>
              </svg>
              <div className="auth-chips">
                <span className="dchip"><span className="dot" />{retailer ? "MRIGA retailer desk" : "MRIGA customer account"}</span>
                <span className="dchip">
                  <svg {...ICON}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  Protected sign-in
                </span>
              </div>
              <div style={{ height: 60 }} />
              <div className="kicker">{retailer ? "Retailer" : "Customer"}</div>
              <h1>{retailer ? "Login as a retailer." : "Login as a customer."}</h1>
              <p>{retailer ? "For showroom partners selling MRIGA. Separate from a customer account." : "Book a test ride, follow its status, and come back to the same account."}</p>
              <div className="auth-feats">
                <span className="dchip"><svg {...ICON}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg> Your test-ride bookings</span>
                <span className="dchip"><svg {...ICON}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> Help on WhatsApp</span>
                <span className="dchip"><svg {...ICON}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg> Your sign-in history</span>
              </div>
              <div className="auth-stats">
                <div><b>{rangeFrom(content.lithiumDetail)} <small>km</small></b><span>MIRA range per charge</span></div>
                <div><b>3 <small>yr</small></b><span>Guarantee incl. battery</span></div>
                <div><b>Rohini</b><span>Showroom, New Delhi</span></div>
              </div>
            </div>
            <div className="auth-r">
              {done ? (
                <div className="success" style={{ margin: "auto 0" }}>
                  <div className="tick">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  </div>
                  <div className="kicker plain">Signed in</div>
                  <h2 style={{ margin: 0 }}>Welcome, {firstName}</h2>
                  <p className="sub" style={{ fontSize: 14 }}>Your bookings, details and sign-in history are in My account.</p>
                  <div className="cta-row" style={{ justifyContent: "center", marginTop: 10 }}>
                    <Link href="/account" className="btn btn-p">My account</Link>
                    <WhatsAppButton message={`Hi MRIGA, this is ${firstName}. ${retailer ? "I just signed in to my retailer account." : "I just signed in and have a question."}`}>Chat on WhatsApp</WhatsAppButton>
                    <button className="btn btn-g" onClick={leave}>Sign out</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={up ? "atabs right" : "atabs"} role="group" aria-label="Account mode">
                    <span className="pillbg" aria-hidden="true" />
                    <button type="button" className={up ? undefined : "on"} onClick={() => reset("in")} aria-pressed={!up}>Sign In</button>
                    <button type="button" className={up ? "on" : undefined} onClick={() => reset("up")} aria-pressed={up}>Create Account</button>
                  </div>
                  <div style={{ marginTop: 32 }}>
                    <div className="kicker plain">{up ? "New account" : "Sign in"}</div>
                    <h2>{title}</h2>
                    <p className="sub">{subtitle}</p>
                  </div>
                  <form className="form" onSubmit={submit} noValidate>
                    <input type="hidden" name="next" value={nextPath} />
                    <input type="hidden" name="desk" value={retailer ? "retailer" : "member"} />
                    {up ? (
                      <div className="fld">
                        <label htmlFor={`${audience}-name`}>Full name</label>
                        <div className="inp">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
                          <input id={`${audience}-name`} name="name" placeholder="Your full name" autoComplete="name" />
                        </div>
                      </div>
                    ) : null}
                    <div className="fld">
                      <label htmlFor={`${audience}-id`}>Mobile number or email</label>
                      <div className="inp">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                        <input id={`${audience}-id`} name="id" placeholder="name@example.com or +91 98765 43210" autoComplete="username" />
                      </div>
                    </div>
                    <div className="fld">
                      <label htmlFor={`${audience}-pw`}>Password</label>
                      <div className="inp">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="7.5" cy="15.5" r="4.5" /><path d="m11 12 9-9M17 6l3 3M14 9l2 2" /></svg>
                        <input id={`${audience}-pw`} name="pw" type={show ? "text" : "password"} placeholder={up ? "10+ characters, a letter and a number" : "Your password"} autoComplete={up ? "new-password" : "current-password"} />
                        <button type="button" className="eye" onClick={() => setShow((value) => !value)} aria-label={show ? "Hide password" : "Show password"}>
                          {show ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A9.8 9.8 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6C3.9 8.4 2 12 2 12s4 7 10 7c1.7 0 3.2-.5 4.5-1.2" /></svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
                          )}
                        </button>
                      </div>
                    </div>
                    {up ? (
                      <label className="check" style={{ fontSize: 13 }}>
                        <input type="checkbox" name="terms" /> I agree to the MRIGA terms and privacy notice.
                      </label>
                    ) : (
                      <div className="row-b">
                        <label className="check"><input type="checkbox" name="remember" defaultChecked /> Remember this device</label>
                        <WhatsAppButton className="ulink" message={`Hi MRIGA, I forgot the password for my ${retailer ? "retailer" : "customer"} account. Please help me reset it.`}>Forgot password?</WhatsAppButton>
                      </div>
                    )}
                    {info ? <p className="desc" style={{ color: "var(--accent-text)", fontWeight: 600 }} role="status">{info}</p> : null}
                    <Turnstile key={check} action={up ? "signup" : "login"} />
                    {err ? <p className="err" role="alert">{err}</p> : null}
                    <button type="submit" className="btn btn-d btn-block" disabled={busy} style={{ minHeight: 56, fontSize: 15 }}>
                      {busy ? <span className="spinner" /> : null}
                      {busy ? "Verifying…" : up ? "Create my account" : "Sign in"}
                      <svg className="arr" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                    </button>
                  </form>
                  {!retailer && google ? (
                    <>
                      <div className="or" style={{ marginTop: 24 }}>Or continue with</div>
                      <div className="alt">
                        <a className="btn btn-g" href={`/api/auth/google?next=${encodeURIComponent(nextPath)}`}>
                          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4" /><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="#34A853" /><path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1A10 10 0 0 0 2 12c0 1.6.4 3.1 1.1 4.6z" fill="#FBBC05" /><path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.4 3-4.1 5.6-4.1z" fill="#EA4335" /></svg>
                          Google
                        </a>
                      </div>
                    </>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
