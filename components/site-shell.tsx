"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { reserveTestRide } from "@/lib/actions";
import { useSiteContent } from "@/components/site-content";
import { SEND_FAILED, sendWithTurnstile, Turnstile } from "@/components/turnstile";
import { AccountChip, useMe } from "@/components/account-chip";
import { WhatsAppButton, WhatsAppIcon } from "@/components/whatsapp-button";
import { whatsappLink } from "@/lib/whatsapp";

type Model = "RIVA" | "MIRA" | "VIRA";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/dealers", label: "Dealers" },
  { href: "/collection", label: "Explore" },
  { href: "/contact", label: "Contact" },
];

function activeLabel(pathname: string) {
  if (pathname.startsWith("/about")) return "About Us";
  if (pathname.startsWith("/dealers")) return "Dealers";
  if (pathname.startsWith("/collection") || pathname.startsWith("/mira") || pathname.startsWith("/riva") || pathname.startsWith("/vira")) return "Explore";
  if (pathname.startsWith("/contact")) return "Contact";
  if (pathname === "/") return "Home";
  return "";
}

function Logo() {
  return (
    <Link href="/" className="logo" aria-label="MRIGA home">
      <img src="/media/logo" alt="" className="logo-mark" />
      MRIGA
    </Link>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const content = useSiteContent();
  const pathname = usePathname();
  const active = activeLabel(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [book, setBook] = useState(false);
  // MIRA is the model on sale today; RIVA and VIRA are listed as coming next.
  const [model, setModel] = useState<Model>("MIRA");
  const me = useMe();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [rideChat, setRideChat] = useState("");
  const floatChat = whatsappLink(content.whatsapp, "Hi MRIGA, I'd like to know more about your scooters.");
  const [check, setCheck] = useState(0);

  const openBook = useCallback((next?: Model) => {
    // On /riva or /vira, the booking form starts on that model.
    const fromPage: Model | null = pathname === "/riva" ? "RIVA" : pathname === "/vira" ? "VIRA" : pathname === "/mira" ? "MIRA" : null;
    const pick = next ?? fromPage;
    if (pick) setModel(pick);
    setDone(false);
    setErr("");
    setBusy(false);
    setMenuOpen(false);
    setBook(true);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = book ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [book]);

  useEffect(() => {
    if (!book) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setBook(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [book]);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api") || pathname.startsWith("/media")) return;
    const path = pathname;
    let sent = 0;
    const started = performance.now();
    const post = (kind: "view" | "time" | "click", target: string, seconds: number) => {
      void fetch("/api/views", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path: target, kind, seconds }),
        keepalive: true,
      });
    };
    // One view per page per browser tab session, so refreshes do not inflate the admin counts.
    let seen = false;
    try {
      const key = `mriga-view:${path}`;
      seen = sessionStorage.getItem(key) === "1";
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage blocked (private mode): count the view.
    }
    if (!seen) post("view", path, 0);
    const flush = () => {
      const total = Math.round((performance.now() - started) / 1000);
      const delta = total - sent;
      if (delta < 1) return;
      sent = total;
      post("time", path, delta);
    };
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") flush();
    }, 15000);
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a[href]");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("/") || href.startsWith("//") || href.startsWith("/admin")) return;
      post("click", href.split("?")[0].split("#")[0] || "/", 0);
    };
    document.addEventListener("click", onClick);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      window.clearInterval(timer);
      document.removeEventListener("click", onClick);
      window.removeEventListener("pagehide", flush);
    };
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a[href='#book']");
      if (!link) return;
      event.preventDefault();
      const label = link.textContent || "";
      const next = label.includes("RIVA") ? "RIVA" : label.includes("MIRA") ? "MIRA" : label.includes("VIRA") ? "VIRA" : undefined;
      openBook(next);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [openBook]);

  useEffect(() => {
    if (window.location.hash !== "#book") return;
    const timer = window.setTimeout(() => openBook(), 0);
    return () => window.clearTimeout(timer);
  }, [openBook]);

  async function submitRide(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setErr("");
    const data = new FormData(form);
    const result = await sendWithTurnstile(form, (fields) => fields.set("model", model), reserveTestRide, () => setCheck((value) => value + 1));
    setBusy(false);
    if (!result?.ok) {
      setErr(result?.error || SEND_FAILED);
      return;
    }
    const date = String(data.get("date") || "");
    setRideChat(`Hi MRIGA, I just booked a ${model} test ride. Name: ${String(data.get("name") || "")}. City: ${String(data.get("city") || "")}.${date ? ` Preferred date: ${date}.` : ""}`);
    setDone(true);
    setMsg(result.message);
  }

  return (
    <div className="site theme-heritage cq">
      <header className="nav">
        <div className="wrap nav-in">
          <Logo />
          <nav className="links" aria-label="Primary">
            {NAV.map((item) => (
              <Link key={item.label} href={item.href} className={item.label === active ? "on" : undefined} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="nav-r">
            <a className="nav-phone" href="#book">Book a test ride</a>
            <AccountChip />
            <button className="icon-btn burger" onClick={() => setMenuOpen((open) => !open)} aria-label="Open menu" aria-expanded={menuOpen}>
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h10" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <div className={menuOpen ? "drawer open" : "drawer"}>
          {NAV.map((item) => (
            <Link key={item.label} href={item.href} className={item.label === active ? "on" : undefined} onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
          <a href="#book" onClick={() => setMenuOpen(false)}>Book a test ride</a>
          <AccountChip variant="link" onNavigate={() => setMenuOpen(false)} />
        </div>
      </header>
      {children}
      <footer className="foot">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <Logo />
              <p style={{ maxWidth: 340, lineHeight: 1.7, margin: "18px 0 0" }}>
                MIRA by MRIGA. Smart mobility. Sustainable future. {content.address}
              </p>
              <div className="foot-reach">
                <a href={`tel:${content.phoneHref}`}>{content.phone}</a>
                <a className="ig" href={content.instagram} target="_blank" rel="noreferrer" aria-label="MRIGA on Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h5>Company</h5>
              <ul>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/mira">MIRA</Link></li>
                <li><Link href="/riva">RIVA</Link></li>
                <li><Link href="/vira">VIRA</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/dealers">Become a Dealer</Link></li>
                <li><a href="#book">Book Test Ride</a></li>
              </ul>
            </div>
            <div>
              <h5>Owners</h5>
              <ul>
                <li><Link href="/login">Customer login</Link></li>
                <li><Link href="/login">Retailer login</Link></li>
              </ul>
            </div>
          </div>
          <div className="foot-bot">
            <span>© 2026 MRIGA. All rights reserved.</span>
          </div>
        </div>
      </footer>
      {floatChat && !book ? (
        <a className="wa-float" href={floatChat} target="_blank" rel="noopener" aria-label="Chat with MRIGA on WhatsApp">
          <WhatsAppIcon size={28} />
          <span>Chat with us</span>
        </a>
      ) : null}
      {book ? (
        <div className="modal" onClick={() => setBook(false)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-label="Book a test ride" onClick={(event) => event.stopPropagation()}>
            {done ? (
              <div className="success">
                <div className="tick">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </div>
                <h3>Ride Reserved</h3>
                <p className="sub" style={{ fontSize: 14 }}>{msg}</p>
                <div className="cta-row" style={{ justifyContent: "center" }}>
                  <WhatsAppButton message={rideChat}>Continue on WhatsApp</WhatsAppButton>
                  <button className="btn btn-d" onClick={() => setBook(false)}>Done</button>
                </div>
              </div>
            ) : (
              <>
                <div className="sheet-h">
                  <div>
                    <span className="eyebrow"><span className="dot" />Test ride</span>
                    <h3>Book a test ride</h3>
                    <p className="sub" style={{ fontSize: 14 }}>Tell us the model, city, and a day that suits you. We will call you back.</p>
                  </div>
                  <button className="icon-btn" onClick={() => setBook(false)} aria-label="Close">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
                  </button>
                </div>
                <form className="form" onSubmit={submitRide} noValidate>
                  <div className="fld">
                    <span className="lbl">Choose your model</span>
                    <div className="mpicks">
                      {(["RIVA", "MIRA", "VIRA"] as Model[]).map((item) => (
                        <button key={item} type="button" className={model === item ? "mpick on" : "mpick"} onClick={() => setModel(item)} aria-pressed={model === item}>
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="fld">
                    <label htmlFor="bk-name">Full name</label>
                    <input id="bk-name" name="name" className="plain-in" placeholder="Your name" autoComplete="name" defaultValue={me?.name ?? ""} />
                  </div>
                  <div className="fld">
                    <label htmlFor="bk-phone">Mobile number</label>
                    <input id="bk-phone" name="phone" className="plain-in" placeholder="+91 98765 43210" inputMode="tel" autoComplete="tel" defaultValue={me?.phone ?? ""} />
                  </div>
                  <div className="fgrid">
                    <div className="fld">
                      <label htmlFor="bk-city">City</label>
                      <select id="bk-city" name="city" className="plain-in" defaultValue="Rohini, New Delhi">
                        <option>Rohini, New Delhi</option>
                        <option>Bengaluru</option>
                        <option>Mumbai</option>
                        <option>Delhi NCR</option>
                        <option>Hyderabad</option>
                        <option>Pune</option>
                        <option>Jaipur</option>
                      </select>
                    </div>
                    <div className="fld">
                      <label htmlFor="bk-date">Preferred date</label>
                      <input id="bk-date" name="date" type="date" className="plain-in" />
                    </div>
                  </div>
                  <Turnstile key={check} action="test_ride" />
                  {err ? <p className="err" role="alert">{err}</p> : null}
                  <button type="submit" className="btn btn-p btn-block" disabled={busy}>
                    {busy ? <span className="spinner" /> : null}
                    {busy ? "Reserving…" : "Reserve My Test Ride"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
