import type { Metadata } from "next";
import { SiteFrame } from "@/components/site-frame";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = { title: "MRIGA — Contact us" };

const ICON = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export default async function Page() {
  const content = await getSiteContent();
  const map = `https://maps.google.com/maps?q=${encodeURIComponent(content.address)}&z=16&output=embed`;
  const open = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(content.address)}`;
  const handle = content.instagram.replace(/^https:\/\/(www\.)?instagram\.com\//, "").replace(/\/.*$/, "");
  return (
    <SiteFrame>
      <main className="page">
        <section className="phead center">
          <div className="wrap">
            <span className="eyebrow"><span className="dot" />Rohini showroom</span>
            <h1 className="h1 mixed">Contact us.</h1>
            <p className="lead">Visit the showroom, call us, or message us on Instagram. We are happy to help.</p>
            <div className="cta-row">
              <a href="#book" className="btn btn-p">Book a test ride</a>
              <a href={open} className="btn btn-g" target="_blank" rel="noreferrer">Open in Google Maps</a>
            </div>
          </div>
        </section>
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap contact-grid">
            <div className="map-frame">
              <iframe title="MRIGA showroom on Google Maps" src={map} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
            <div className="contact-card">
              <div className="contact-item">
                <span className="contact-ic"><svg {...ICON}><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg></span>
                <div><b>Address</b><p>{content.address}</p></div>
              </div>
              <div className="contact-item">
                <span className="contact-ic"><svg {...ICON}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg></span>
                <div><b>Phone</b><p><a href={`tel:${content.phoneHref}`}>{content.phone}</a></p></div>
              </div>
              <div className="contact-item">
                <span className="contact-ic ig-ic"><svg {...ICON}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg></span>
                <div><b>Instagram</b><p><a href={content.instagram} target="_blank" rel="noreferrer">@{handle || "ridemriga"}</a></p></div>
              </div>
              {content.email ? (
                <div className="contact-item">
                  <span className="contact-ic"><svg {...ICON}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg></span>
                  <div><b>Email</b><p><a href={`mailto:${content.email}`}>{content.email}</a></p></div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
