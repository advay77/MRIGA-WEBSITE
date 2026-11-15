import type { Metadata } from "next";
import { SiteFrame } from "@/components/site-frame";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = { title: "MRIGA — Contact" };

export default async function Page() {
  const content = await getSiteContent();
  const map = `https://maps.google.com/maps?q=${encodeURIComponent(content.address)}&z=16&output=embed`;
  const open = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(content.address)}`;
  return (
    <SiteFrame>
      <main className="page">
        <section className="phead">
          <div className="wrap">
            <span className="eyebrow"><span className="dot" />Rohini showroom</span>
            <h1 className="h1 mixed">Come see MIRA.</h1>
            <p className="lead">{content.address}</p>
            <p className="lead"><a href={`tel:${content.phoneHref}`}>{content.phone}</a></p>
            <div className="cta-row">
              <a href="#book" className="btn btn-p">Book a test ride</a>
              <a href={open} className="btn btn-g" target="_blank" rel="noreferrer">Open in Google Maps</a>
            </div>
            <div className="contact-map-row">
              <div className="map-frame">
                <iframe title="MRIGA showroom on Google Maps" src={map} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
              <div className="contact-card">
                <div>
                  <b>Founders</b>
                  <p>{content.founder1}, {content.founder2}, and {content.founder3}.</p>
                </div>
                <div>
                  <b>Instagram</b>
                  <a className="ig-line" href={content.instagram} target="_blank" rel="noreferrer">
                    <span className="ig" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                      </svg>
                    </span>
                    @ridemriga
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
