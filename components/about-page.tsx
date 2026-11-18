import { getSiteContent } from "@/lib/content";

export async function AboutPage() {
  const content = await getSiteContent();
  const founders = [
    { name: content.founder1, slot: "founder-pankaj", portrait: true },
    { name: content.founder2, slot: "founder-ashish", portrait: true },
    { name: content.founder3, slot: "founder-jiten", portrait: true },
  ];
  return (
    <main className="page">
      <section className="sec">
        <div className="wrap team">
          <div className="kicker center">The people behind MRIGA</div>
          <h2 className="h2">Founders</h2>
          <div className="founder-row">
            {founders.map((person) => (
              <article key={person.slot} className="founder-card">
                <div className={person.portrait ? "founder-photo portrait" : "founder-photo"}>
                  <img src={`/media/${person.slot}`} alt={person.name} />
                </div>
                <span className="founder-label">Founder</span>
                <h3>{person.name}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="cta light">
        <div className="wrap cta-in">
          <span className="eyebrow">Rohini showroom · open now</span>
          <h2>Feel the ride before you decide.</h2>
          <p>Book a free test ride at our Rohini showroom, or call us on <a href={`tel:${content.phoneHref}`}>{content.phone}</a>.</p>
          <div className="cta-row">
            <a href="#book" className="btn btn-p">Book a test ride</a>
            <a href="/contact" className="btn btn-g">Contact</a>
          </div>
        </div>
      </section>
    </main>
  );
}
