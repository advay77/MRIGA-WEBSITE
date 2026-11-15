import { getSiteContent } from "@/lib/content";

export async function AboutPage() {
  const content = await getSiteContent();
  const founders = [
    { name: content.founder1, slot: "founder-pankaj", portrait: true },
    { name: content.founder2, slot: "founder-ashish", portrait: false },
    { name: content.founder3, slot: "founder-jiten", portrait: false },
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
          <span className="eyebrow">Rohini showroom</span>
          <h2>Come and see the scooter.</h2>
          <p>{content.phone}</p>
          <div className="cta-row">
            <a href="#book" className="btn btn-p">Book a test ride</a>
            <a href="/contact" className="btn btn-g">Contact</a>
          </div>
        </div>
      </section>
    </main>
  );
}
