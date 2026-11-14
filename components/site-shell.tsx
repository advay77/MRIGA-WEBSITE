"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { reserveTestRide } from "@/lib/actions";
import { INSTAGRAM } from "@/lib/mira";

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
    <a href="/" className="logo" aria-label="MRIGA home">
      <img src="/logo.png" alt="" className="logo-mark" />
      MRIGA
    </a>
  );
}

export function SiteShell({ children, user = null }: { children: React.ReactNode; user?: { name: string; role: string } | null }) {
  const pathname = usePathname();
  const active = activeLabel(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [book, setBook] = useState(false);
  const [model, setModel] = useState<Model>("RIVA");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const openBook = useCallback((next?: Model) => {
    if (next) setModel(next);
    setDone(false);
    setErr("");
    setBusy(false);
    setMenuOpen(false);
    setBook(true);
  }, []);

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
    if (window.location.hash === "#book") openBook();
  }, [openBook]);

  async function submitRide(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    data.set("model", model);
    setBusy(true);
    setErr("");
    const result = await reserveTestRide(data);
    setBusy(false);
    if (!result.ok) {
      setErr(result.error);
      return;
    }
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
              <a key={item.label} href={item.href} className={item.label === active ? "on" : undefined} onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="nav-r">
            <a className="nav-phone" href="tel:+917303042004">+91 73030 42004</a>
            <a href="/login" className="btn btn-d btn-sm">{user ? user.name : "Login"}</a>
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
            <a key={item.label} href={item.href} className={item.label === active ? "on" : undefined} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
          <a href="tel:+917303042004" onClick={() => setMenuOpen(false)}>+91 73030 42004</a>
          <a href="/login" onClick={() => setMenuOpen(false)}>{user ? user.name : "Login"}</a>
          {user?.role === "ADMIN" ? <a href="/admin" onClick={() => setMenuOpen(false)}>Atelier Desk</a> : null}
        </div>
      </header>
      {children}
      <footer className="foot">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <Logo />
              <p style={{ maxWidth: 340, lineHeight: 1.7, margin: "18px 0 0" }}>
                MIRA by MRIGA. Smart mobility. Sustainable future. E-1/93, Sector-7, Rohini, New Delhi 110085, near M2K Rohini.
              </p>
              <div className="foot-reach">
                <a href="tel:+917303042004">+91 73030 42004</a>
                <a className="ig" href={INSTAGRAM} target="_blank" rel="noreferrer" aria-label="MRIGA on Instagram">
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
                <li><a href="/about">About Us</a></li>
                <li><a href="/mira">MIRA</a></li>
                <li><a href="/riva">RIVA</a></li>
                <li><a href="/vira">VIRA</a></li>
                <li><a href="/contact">Contact</a></li>
                <li><a href="/dealers">Become a Dealer</a></li>
                <li><a href="#book">Book Test Ride</a></li>
              </ul>
            </div>
            <div>
              <h5>Owners</h5>
              <ul>
                <li><a href="/login">Customer Lounge</a></li>
                <li><a href="/login?tab=up">Create Account</a></li>
                <li><a href="/dealers">Partner Console</a></li>
                {user?.role === "ADMIN" ? <li><a href="/admin">Atelier Desk</a></li> : null}
              </ul>
            </div>
          </div>
          <div className="foot-bot">
            <span>© 2026 MRIGA Mobility. All rights reserved.</span>
            <span>Privacy · Terms · Cookies</span>
          </div>
        </div>
      </footer>
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
                <button className="btn btn-d" onClick={() => setBook(false)}>Done</button>
              </div>
            ) : (
              <>
                <div className="sheet-h">
                  <div>
                    <span className="eyebrow"><span className="dot" />Priority Reservation</span>
                    <h3>Book Your VIP Test Ride</h3>
                    <p className="sub" style={{ fontSize: 14 }}>A curator brings the scooter to your door. No charge, no obligation.</p>
                  </div>
                  <button className="icon-btn" onClick={() => setBook(false)} aria-label="Close">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
                  </button>
                </div>
                <form className="form" onSubmit={submitRide} noValidate>
                  <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
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
                    <input id="bk-name" name="name" className="plain-in" placeholder="Your name" autoComplete="name" />
                  </div>
                  <div className="fld">
                    <label htmlFor="bk-phone">Mobile number</label>
                    <input id="bk-phone" name="phone" className="plain-in" placeholder="+91 98765 43210" inputMode="tel" autoComplete="tel" />
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
