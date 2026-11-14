import type { Metadata } from "next";
import { SiteFrame } from "@/components/site-frame";
import { INSTAGRAM } from "@/lib/mira";

export const metadata: Metadata = { title: "MRIGA — Contact" };

export default function Page() {
  return (
    <SiteFrame>
      <main className="page">
        <section className="phead">
          <div className="wrap contact-grid">
            <div>
              <span className="eyebrow"><span className="dot" />Rohini showroom</span>
              <h1 className="h1 mixed">Come see MIRA.</h1>
              <p className="lead">E-1/93, Sector-7, Rohini, New Delhi 110085, near M2K Rohini.</p>
              <div className="cta-row">
                <a href="tel:+917303042004" className="btn btn-p">+91 73030 42004</a>
                <a href="#book" className="btn btn-g">Book a test ride</a>
              </div>
            </div>
            <div className="contact-card">
              <div>
                <b>Founders</b>
                <p>Pankaj Jain, Ashish Jain, and Jiten Jain.</p>
              </div>
              <div>
                <b>Instagram</b>
                <a className="ig-line" href={INSTAGRAM} target="_blank" rel="noreferrer">
                  <span className="ig" aria-hidden="true"><IgIcon /></span>
                  @ridemriga
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}

function IgIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
