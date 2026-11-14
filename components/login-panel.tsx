"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, signUp } from "@/lib/actions";

type LoungeUser = { name: string; role: string };

export function LoginPanel({ user, nextPath, startTab }: { user: LoungeUser | null; nextPath: string; startTab: "in" | "up" }) {
  const router = useRouter();
  const [tab, setTab] = useState<"in" | "up">(startTab);
  const [otp, setOtp] = useState(false);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(Boolean(user));
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [welcome, setWelcome] = useState(user ? `Welcome, ${user.name.split(" ")[0]}` : "");
  const [href, setHref] = useState(user?.role === "ADMIN" ? "/admin" : "/collection");
  const up = tab === "up";

  function reset(next: "in" | "up") {
    setTab(next);
    setOtp(false);
    setErr("");
    setInfo("");
    setBusy(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setErr("");
    setInfo("");
    const result = up ? await signUp(data) : await signIn(data);
    setBusy(false);
    if (!result.ok) {
      setErr(result.error);
      return;
    }
    setWelcome(`Welcome, ${result.name.split(" ")[0]}`);
    setHref(result.href);
    setDone(true);
    router.refresh();
  }

  async function leave() {
    await signOut();
    setDone(false);
    setWelcome("");
    setTab("in");
    router.refresh();
  }

  const kicker = otp ? "One-Time Passcode" : up ? "New Membership" : "Client Verification";
  const title = otp ? "Instant Access" : up ? "Join the Lounge" : "Welcome Back";
  const subtitle = otp
    ? "SMS codes are issued only after a messaging provider is connected."
    : up
      ? "Create your MRIGA account to reserve rides, track your scooter and book atelier services."
      : "Authenticate to synchronize telemetry, saddle preferences & scheduled atelier rides.";

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
                <span className="dchip"><span className="dot" />MRIGA Concierge Atelier</span>
                <span className="dchip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  Session locked to this device
                </span>
              </div>
              <div style={{ height: 60 }} />
              <div className="kicker">Private Members Lounge</div>
              <h1>Your Sovereign Sanctuary.</h1>
              <p>Enter the MRIGA Lounge — manage bespoke reservations, connected telemetry, real-time kinetic battery passport status, curated saddle selections, and private concierge appointments.</p>
              <div className="auth-feats">
                <span className="dchip"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg> Live Battery Passport</span>
                <span className="dchip"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg> Concierge Response &lt; 15 Mins</span>
                <span className="dchip"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" /></svg> Kinetic Telemetry Sync</span>
              </div>
              <div className="auth-stats">
                <div><b><span className="count c185" /> <small>km</small></b><span>Certified Range</span></div>
                <div><b>2.9 <small>s</small></b><span>0–40 km/h Sprint</span></div>
                <div><b>24/7</b><span>Atelier Valet</span></div>
              </div>
            </div>
            <div className="auth-r">
              {done ? (
                <div className="success" style={{ margin: "auto 0" }}>
                  <div className="tick">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  </div>
                  <div className="kicker plain">Lounge Access Granted</div>
                  <h2 style={{ margin: 0 }}>{welcome}</h2>
                  <p className="sub" style={{ fontSize: 14 }}>Your telemetry, saddle preferences and scheduled atelier rides are now synchronised.</p>
                  <div className="cta-row" style={{ justifyContent: "center", marginTop: 10 }}>
                    <a href={href} className="btn btn-p">{href === "/admin" ? "Open the Atelier Desk" : "Browse the Collection"}</a>
                    <button className="btn btn-g" onClick={leave}>Sign Out</button>
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
                    <div className="kicker plain">{kicker}</div>
                    <h2>{title}</h2>
                    <p className="sub">{subtitle}</p>
                  </div>
                  {otp ? (
                    <form className="form" onSubmit={(event) => { event.preventDefault(); setErr(""); setInfo("SMS codes are not enabled on this atelier yet. Sign in with your passkey."); }} noValidate>
                      <div className="fld">
                        <label htmlFor="lg-ph">Mobile number</label>
                        <div className="inp">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></svg>
                          <input id="lg-ph" name="phone" placeholder="+91 98765 43210" inputMode="tel" autoComplete="tel" />
                        </div>
                      </div>
                      {info ? <p className="desc" style={{ color: "var(--accent-text)", fontWeight: 600 }} role="status">{info}</p> : null}
                      <button type="submit" className="btn btn-d btn-block" style={{ minHeight: 56 }}>Send Code</button>
                      <button type="button" className="ulink" onClick={() => { setOtp(false); setInfo(""); setErr(""); }} style={{ justifySelf: "center" }}>Use password instead</button>
                    </form>
                  ) : (
                    <form className="form" onSubmit={submit} noValidate>
                      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                      <input type="hidden" name="next" value={nextPath} />
                      {up ? (
                        <div className="fld">
                          <label htmlFor="lg-name">Full name</label>
                          <div className="inp">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
                            <input id="lg-name" name="name" placeholder="Your full name" autoComplete="name" />
                          </div>
                        </div>
                      ) : null}
                      <div className="fld">
                        <label htmlFor="lg-id">Mobile number or email</label>
                        <div className="inp">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                          <input id="lg-id" name="id" placeholder="name@atelier.com or +91 98765 43210" autoComplete="username" />
                        </div>
                      </div>
                      <div className="fld">
                        <label htmlFor="lg-pw">Security passkey / password</label>
                        <div className="inp">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="7.5" cy="15.5" r="4.5" /><path d="m11 12 9-9M17 6l3 3M14 9l2 2" /></svg>
                          <input id="lg-pw" name="pw" type={show ? "text" : "password"} placeholder="Enter confidential passkey" autoComplete={up ? "new-password" : "current-password"} />
                          <button type="button" className="eye" onClick={() => setShow((value) => !value)} aria-label={show ? "Hide passkey" : "Show passkey"}>
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
                          <input type="checkbox" name="terms" /> I agree to the MRIGA Lounge terms and privacy notice.
                        </label>
                      ) : (
                        <div className="row-b">
                          <label className="check"><input type="checkbox" name="remember" defaultChecked /> Remember this device</label>
                          <button type="button" className="ulink" onClick={() => { setInfo("Passkey reset is confirmed by the concierge. We never send passwords by SMS."); setErr(""); }}>Forgot Passkey?</button>
                        </div>
                      )}
                      {info ? <p className="desc" style={{ color: "var(--accent-text)", fontWeight: 600 }} role="status">{info}</p> : null}
                      {err ? <p className="err" role="alert">{err}</p> : null}
                      <button type="submit" className="btn btn-d btn-block" disabled={busy} style={{ minHeight: 56, fontSize: 15 }}>
                        {busy ? <span className="spinner" /> : null}
                        {busy ? "Verifying…" : up ? "Create My Account" : "Enter Customer Lounge"}
                        <svg className="arr" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      </button>
                    </form>
                  )}
                  <div className="or" style={{ marginTop: 24 }}>Or instant access with</div>
                  <div className="alt">
                    <button className="btn btn-g" onClick={() => { setOtp(true); setErr(""); setInfo(""); }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M8 10h.01M12 10h.01M16 10h.01" /></svg>
                      Login via SMS OTP
                    </button>
                    <button className="btn btn-g" onClick={() => { setErr(""); setInfo("Google sign-in is not enabled on this atelier yet. Sign in with your passkey."); }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4" /><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="#34A853" /><path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1A10 10 0 0 0 2 12c0 1.6.4 3.1 1.1 4.6z" fill="#FBBC05" /><path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.4 3-4.1 5.6-4.1z" fill="#EA4335" /></svg>
                      Google One-Tap
                    </button>
                  </div>
                  <a href="/dealers" className="partner">
                    <span className="feat-ic" style={{ borderRadius: "50%" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9h18M9 20v-6h6v6" /></svg>
                    </span>
                    <span><b>Dealer &amp; Franchise Partner?</b><span>Access the Institutional Partner Console</span></span>
                    <svg className="arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
