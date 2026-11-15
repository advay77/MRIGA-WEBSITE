import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { saveMedia, saveSiteContent, signOutAdmin } from "@/lib/admin-actions";
import { ensureAdmin, getSession } from "@/lib/auth";
import { getSiteContent } from "@/lib/content";
import { prisma } from "@/lib/db";
import { CONTENT_FIELDS, CONTENT_GROUPS, MEDIA_SLOTS, PHOTO_GROUPS, type ContentKey } from "@/lib/site-copy";

export const metadata: Metadata = { title: "MRIGA — Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const SECTIONS = ["overview", "customers", "retailers", "rides", "applications", "website", "photos"] as const;
type Section = (typeof SECTIONS)[number];

const COPY: Record<Section, { kicker: string; title: string; note: string }> = {
  overview: { kicker: "Desk", title: "Overview", note: "Who has signed in, and which pages people open." },
  customers: { kicker: "People", title: "Customers", note: "Accounts created on the customer login." },
  retailers: { kicker: "People", title: "Retailers", note: "Accounts created on the retailer login. Separate from customers." },
  rides: { kicker: "Forms", title: "Test rides", note: "Reservations sent from the booking form." },
  applications: { kicker: "Forms", title: "Dealer applications", note: "Showroom applications, with any attached files." },
  website: { kicker: "Content", title: "Website text", note: "Each block saves on its own. Photos are in the next section." },
  photos: { kicker: "Content", title: "Photos", note: "Replace a photo in its group. The public site picks it up within a minute." },
};

const PATH_LABELS: Record<string, string> = {
  "/": "Home",
  "/about": "About Us",
  "/dealers": "Dealers",
  "/collection": "Explore",
  "/contact": "Contact",
  "/mira": "MIRA",
  "/riva": "RIVA",
  "/vira": "VIRA",
  "/login": "Customer login",
  "/retailer": "Retailer login",
};

const LONG_FIELDS = new Set(["address", "heroLead", "aboutLead", "lithiumDetail", "leadDetail"]);

function sectionOf(value: string | undefined): Section {
  return SECTIONS.includes(value as Section) ? (value as Section) : "overview";
}

async function loadActivity(section: Section, monthAgo: Date): Promise<ActivityRow[]> {
  if (section !== "overview" && section !== "customers" && section !== "retailers") return [];
  if (section === "overview") {
    const [members, retailers] = await Promise.all([
      prisma.pageView.groupBy({
        by: ["path", "kind"],
        where: { createdAt: { gte: monthAgo }, kind: { in: ["time", "click"] }, user: { role: "MEMBER" } },
        _sum: { seconds: true },
        _count: { id: true },
      }),
      prisma.pageView.groupBy({
        by: ["path", "kind"],
        where: { createdAt: { gte: monthAgo }, kind: { in: ["time", "click"] }, user: { role: "RETAILER" } },
        _sum: { seconds: true },
        _count: { id: true },
      }),
    ]);
    const asRows = (rows: typeof members, role: "MEMBER" | "RETAILER"): ActivityRow[] => rows.map((row) => ({
      userId: null,
      path: row.path,
      kind: row.kind,
      seconds: row._sum.seconds ?? 0,
      clicks: row.kind === "click" ? row._count.id : 0,
      user: { name: "", role, email: null, phone: null },
    }));
    return [...asRows(members, "MEMBER"), ...asRows(retailers, "RETAILER")];
  }
  const role = section === "customers" ? "MEMBER" : "RETAILER";
  const [timeRows, clickRows] = await Promise.all([
    prisma.pageView.groupBy({
      by: ["userId", "path"],
      where: { createdAt: { gte: monthAgo }, kind: "time", user: { role } },
      _sum: { seconds: true },
      orderBy: { _sum: { seconds: "desc" } },
      take: 200,
    }),
    prisma.pageView.groupBy({
      by: ["userId", "path"],
      where: { createdAt: { gte: monthAgo }, kind: "click", user: { role } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 200,
    }),
  ]);
  const ids = [...new Set([...timeRows, ...clickRows].flatMap((row) => (row.userId ? [row.userId] : [])))];
  const people = ids.length === 0 ? [] : await prisma.user.findMany({
    where: { id: { in: ids }, role },
    select: { id: true, name: true, role: true, email: true, phone: true },
  });
  const byId = new Map(people.map((person) => [person.id, person]));
  const rows: ActivityRow[] = [];
  for (const row of timeRows) {
    if (!row.userId) continue;
    const person = byId.get(row.userId);
    if (!person) continue;
    rows.push({ userId: row.userId, path: row.path, kind: "time", seconds: row._sum.seconds ?? 0, clicks: 0, user: person });
  }
  for (const row of clickRows) {
    if (!row.userId) continue;
    const person = byId.get(row.userId);
    if (!person) continue;
    rows.push({ userId: row.userId, path: row.path, kind: "click", seconds: 0, clicks: row._count.id, user: person });
  }
  return rows;
}

export default async function Page({ searchParams }: { searchParams: Promise<{ section?: string; saved?: string }> }) {
  await ensureAdmin();
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/admin/login");
  const params = await searchParams;
  const section = sectionOf(params.section);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const copy = COPY[section];

  const [customers, retailers, signIns, signInsWeek, people, rideCount, applicationCount, visits, recentSessions, rides, applications, content, activity] = await Promise.all([
    prisma.user.count({ where: { role: "MEMBER" } }),
    prisma.user.count({ where: { role: "RETAILER" } }),
    section === "overview" ? prisma.session.count({ where: { user: { role: { not: "ADMIN" } } } }) : Promise.resolve(0),
    section === "overview" ? prisma.session.count({ where: { createdAt: { gte: weekAgo }, user: { role: { not: "ADMIN" } } } }) : Promise.resolve(0),
    section === "overview" ? prisma.user.count({ where: { role: { not: "ADMIN" }, sessions: { some: {} } } }) : Promise.resolve(0),
    prisma.testRide.count(),
    prisma.dealerApplication.count(),
    section === "overview" ? prisma.pageView.groupBy({ by: ["path"], where: { kind: "view" }, _count: { path: true }, orderBy: { _count: { path: "desc" } } }) : Promise.resolve([]),
    section === "overview" ? prisma.session.findMany({
      where: { user: { role: { not: "ADMIN" } } },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, createdAt: true, user: { select: { name: true, role: true, email: true, phone: true } } },
    }) : Promise.resolve([]),
    section === "rides" ? prisma.testRide.findMany({ orderBy: { createdAt: "desc" }, take: 100 }) : Promise.resolve([]),
    section === "applications" ? prisma.dealerApplication.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { files: { select: { id: true, filename: true } } },
    }) : Promise.resolve([]),
    getSiteContent(),
    loadActivity(section, monthAgo),
  ]);
  const customerRows = section === "customers" ? await prisma.user.findMany({ where: { role: "MEMBER" }, orderBy: { createdAt: "desc" }, take: 100, include: { _count: { select: { sessions: true } } } }) : [];
  const retailerRows = section === "retailers" ? await prisma.user.findMany({ where: { role: "RETAILER" }, orderBy: { createdAt: "desc" }, take: 100, include: { _count: { select: { sessions: true } } } }) : [];
  const visitMax = visits[0]?._count.path || 1;
  const nav = [
    { label: "Desk", items: [{ id: "overview" as const, label: "Overview", count: undefined }] },
    { label: "People", items: [{ id: "customers" as const, label: "Customers", count: customers }, { id: "retailers" as const, label: "Retailers", count: retailers }] },
    { label: "Forms", items: [{ id: "rides" as const, label: "Test rides", count: rideCount }, { id: "applications" as const, label: "Dealer applications", count: applicationCount }] },
    { label: "Content", items: [{ id: "website" as const, label: "Website text", count: undefined }, { id: "photos" as const, label: "Photos", count: MEDIA_SLOTS.length }] },
  ];

  return (
    <div className="desk theme-heritage">
      <aside className="desk-side">
        <a className="desk-brand" href="/admin">
          <img src="/media/logo" alt="" />
          <span><b>MRIGA</b><small>Desk</small></span>
        </a>
        <nav aria-label="Desk">
          {nav.map((group) => (
            <div className="desk-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map((item) => (
                <a key={item.id} href={`/admin?section=${item.id}`} className={section === item.id ? "on" : undefined} aria-current={section === item.id ? "page" : undefined}>
                  {item.label}
                  {item.count !== undefined ? <em>{item.count}</em> : null}
                </a>
              ))}
            </div>
          ))}
        </nav>
        <div className="desk-foot">
          <a href="/">View website</a>
          <form action={signOutAdmin}><button type="submit">Sign out</button></form>
          <small>{session.user.email}</small>
        </div>
      </aside>
      <main className="desk-main">
        <header className="desk-head">
          <div>
            <span>{copy.kicker}</span>
            <h1>{copy.title}</h1>
            <p>{copy.note}</p>
          </div>
        </header>
        {params.saved === "text" ? <p className="desk-note">Saved. The public page uses this text on the next visit.</p> : null}
        {params.saved && params.saved !== "text" && params.saved !== "photo-error" ? <p className="desk-note">Photo replaced.</p> : null}
        {params.saved === "photo-error" ? <p className="desk-note bad">Use a JPG, PNG, or WEBP under 5MB.</p> : null}

        {section === "overview" ? (
          <>
            <div className="stat-grid">
              <article className="stat-card"><b>{customers}</b><span>Customers</span></article>
              <article className="stat-card"><b>{retailers}</b><span>Retailers</span></article>
              <article className="stat-card"><b>{people}</b><span>Customers and retailers who signed in</span></article>
              <article className="stat-card"><b>{signInsWeek}</b><span>Their sign-ins this week · {signIns} total</span></article>
            </div>
            <section className="desk-panel">
              <h2>Pages people open</h2>
              <p>One count per browser session, so a refresh does not inflate the number.</p>
              {visits.length === 0 ? <p className="desk-empty">No visits yet. Open the public site, then come back.</p> : (
                <div className="visit-list">
                  {visits.map((row) => (
                    <div key={row.path} className="bar-l">
                      <span>{PATH_LABELS[row.path] || row.path}</span>
                      <div className="track"><div className="fill" style={{ width: `${Math.max(8, (row._count.path / visitMax) * 100)}%` }} /></div>
                      <span>{row._count.path}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="desk-panel">
              <h2>Recent sign-ins</h2>
              <p>Customers and retailers only.</p>
              <UserTable rows={recentSessions.map((item) => ({ id: item.id, when: item.createdAt, name: item.user.name, role: item.user.role, contact: item.user.email || item.user.phone || "—" }))} />
            </section>
            <section className="desk-panel">
              <h2>Where customers spend time</h2>
              <SectionTotals rows={activity} role="MEMBER" />
            </section>
            <section className="desk-panel">
              <h2>Where retailers spend time</h2>
              <SectionTotals rows={activity} role="RETAILER" />
            </section>
          </>
        ) : null}

        {section === "customers" ? (
          <section className="desk-panel">
            <h2>{customers} customer {customers === 1 ? "account" : "accounts"}</h2>
            <AccountTable rows={customerRows} empty="No customer accounts yet." />
            <h3 className="desk-sub">Time and clicks</h3>
            <ActivityTable rows={activity} role="MEMBER" />
          </section>
        ) : null}

        {section === "retailers" ? (
          <section className="desk-panel">
            <h2>{retailers} retailer {retailers === 1 ? "account" : "accounts"}</h2>
            <AccountTable rows={retailerRows} empty="No retailer accounts yet. They sign up on the login page." />
            <h3 className="desk-sub">Time and clicks</h3>
            <ActivityTable rows={activity} role="RETAILER" />
          </section>
        ) : null}

        {section === "rides" ? (
          <section className="desk-panel">
            <h2>{rideCount} test {rideCount === 1 ? "ride" : "rides"}</h2>
            {rides.length === 0 ? <p className="desk-empty">No reservations yet.</p> : (
              <div className="desk-table">
                <table className="admin-table">
                  <thead><tr><th>When</th><th>Name</th><th>Phone</th><th>City</th><th>Model</th><th>Date</th></tr></thead>
                  <tbody>
                    {rides.map((ride) => (
                      <tr key={ride.id}>
                        <td>{ride.createdAt.toLocaleString("en-IN")}</td>
                        <td>{ride.name}</td>
                        <td>{ride.phone}</td>
                        <td>{ride.city}</td>
                        <td>{ride.model}</td>
                        <td>{ride.date || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}

        {section === "applications" ? (
          <section className="desk-panel">
            <h2>{applicationCount} dealer {applicationCount === 1 ? "application" : "applications"}</h2>
            {applications.length === 0 ? <p className="desk-empty">No applications yet.</p> : (
              <div className="desk-table">
                <table className="admin-table">
                  <thead><tr><th>Reference</th><th>Signatory</th><th>Business</th><th>Showroom</th><th>Models</th><th>Files</th></tr></thead>
                  <tbody>
                    {applications.map((item) => (
                      <tr key={item.id}>
                        <td>{item.reference}<br />{item.createdAt.toLocaleString("en-IN")}</td>
                        <td>{item.name}<br />{item.email}<br />{item.mobile}</td>
                        <td>{item.entity}<br />{item.constitution}<br />{item.gst}</td>
                        <td>{item.city}<br />{item.area}</td>
                        <td>{item.models}<br />{item.liquidity}</td>
                        <td>{item.files.length === 0 ? "—" : item.files.map((file) => <a key={file.id} href={`/admin/files/${file.id}`}>{file.filename}</a>)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}

        {section === "website" ? (
          <div className="desk-stack">
            {CONTENT_GROUPS.map((group) => (
              <section className="desk-panel" key={group.id}>
                <h2>{group.title}</h2>
                <p>{group.note}</p>
                <form className="form" action={saveSiteContent}>
                  <div className="field-grid">
                    {group.keys.map((key) => {
                      const field = CONTENT_FIELDS.find((item) => item.key === key);
                      if (!field) return null;
                      const long = LONG_FIELDS.has(field.key);
                      return (
                        <div className={long ? "fld wide" : "fld"} key={field.key}>
                          <label htmlFor={field.key}>{field.label}</label>
                          {long ? (
                            <textarea id={field.key} name={field.key} className="plain-in" rows={4} defaultValue={content[field.key as ContentKey]} />
                          ) : (
                            <input id={field.key} name={field.key} className="plain-in" defaultValue={content[field.key as ContentKey]} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button className="btn btn-p" type="submit">Save {group.title}</button>
                </form>
              </section>
            ))}
          </div>
        ) : null}

        {section === "photos" ? (
          <div className="desk-stack">
            {PHOTO_GROUPS.map((group) => (
              <section className="desk-panel" key={group.id}>
                <h2>{group.title}</h2>
                <p>{group.note}</p>
                <div className="photo-grid">
                  {MEDIA_SLOTS.filter((slot) => slot.group === group.id).map((slot) => (
                    <form key={slot.id} className="photo-card" action={saveMedia}>
                      <img src={`/media/${slot.id}?v=${params.saved === slot.id ? "new" : "1"}`} alt="" />
                      <b>{slot.label}</b>
                      <input type="hidden" name="slot" value={slot.id} />
                      <input name="file" type="file" accept="image/jpeg,image/png,image/webp" required />
                      <button className="btn btn-g btn-sm" type="submit">Replace</button>
                    </form>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}

type ActivityRow = {
  userId: string | null;
  path: string;
  kind: string;
  seconds: number;
  clicks: number;
  user: { name: string; role: string; email: string | null; phone: string | null } | null;
};

function clock(seconds: number) {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  if (minutes < 1) return `${rest}s`;
  return `${minutes}m ${rest}s`;
}

function SectionTotals({ rows, role }: { rows: ActivityRow[]; role: "MEMBER" | "RETAILER" }) {
  const totals = new Map<string, { seconds: number; clicks: number }>();
  for (const row of rows) {
    if (row.user?.role !== role) continue;
    const spot = totals.get(row.path) ?? { seconds: 0, clicks: 0 };
    if (row.kind === "time") spot.seconds += row.seconds;
    if (row.kind === "click") spot.clicks += row.clicks;
    totals.set(row.path, spot);
  }
  const list = [...totals.entries()].sort((a, b) => b[1].seconds - a[1].seconds || b[1].clicks - a[1].clicks);
  if (list.length === 0) return <p className="desk-empty">No time recorded yet. It starts after a customer or retailer signs in and moves around the site.</p>;
  return (
    <div className="desk-table">
      <table className="admin-table">
        <thead><tr><th>Section</th><th>Time spent</th><th>Clicks</th></tr></thead>
        <tbody>
          {list.map(([path, spot]) => (
            <tr key={path}><td>{PATH_LABELS[path] || path}</td><td>{clock(spot.seconds)}</td><td>{spot.clicks}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActivityTable({ rows, role }: { rows: ActivityRow[]; role: "MEMBER" | "RETAILER" }) {
  const people = new Map<string, { name: string; contact: string; seconds: number; clicks: number; paths: Map<string, { seconds: number; clicks: number }> }>();
  for (const row of rows) {
    if (!row.userId || row.user?.role !== role) continue;
    const person = people.get(row.userId) ?? { name: row.user.name, contact: row.user.email || row.user.phone || "—", seconds: 0, clicks: 0, paths: new Map() };
    const spot = person.paths.get(row.path) ?? { seconds: 0, clicks: 0 };
    if (row.kind === "time") {
      person.seconds += row.seconds;
      spot.seconds += row.seconds;
    }
    if (row.kind === "click") {
      person.clicks += row.clicks;
      spot.clicks += row.clicks;
    }
    person.paths.set(row.path, spot);
    people.set(row.userId, person);
  }
  const list = [...people.values()].sort((a, b) => b.seconds - a.seconds || b.clicks - a.clicks);
  if (list.length === 0) return <p className="desk-empty">Nothing recorded for this group yet.</p>;
  return (
    <div className="desk-table">
      <table className="admin-table">
        <thead><tr><th>Name</th><th>Time on site</th><th>Most time</th><th>Clicks</th><th>Sections opened</th></tr></thead>
        <tbody>
          {list.map((person) => {
            const ranked = [...person.paths.entries()].sort((a, b) => b[1].seconds - a[1].seconds || b[1].clicks - a[1].clicks);
            const top = ranked[0];
            return (
              <tr key={person.contact + person.name}>
                <td>{person.name}<br />{person.contact}</td>
                <td>{clock(person.seconds)}</td>
                <td>{top ? `${PATH_LABELS[top[0]] || top[0]} · ${clock(top[1].seconds)}` : "—"}</td>
                <td>{person.clicks}</td>
                <td>{ranked.map(([path, spot]) => `${PATH_LABELS[path] || path} (${spot.clicks})`).join(", ")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function UserTable({ rows }: { rows: { id: string; when: Date; name: string; role: string; contact: string }[] }) {
  if (rows.length === 0) return <p className="desk-empty">No sign-ins yet.</p>;
  return (
    <div className="desk-table">
      <table className="admin-table">
        <thead><tr><th>When</th><th>Name</th><th>Role</th><th>Contact</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.when.toLocaleString("en-IN")}</td>
              <td>{row.name}</td>
              <td>{row.role === "MEMBER" ? "Customer" : row.role === "RETAILER" ? "Retailer" : "Admin"}</td>
              <td>{row.contact}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccountTable({ rows, empty }: { rows: { id: string; createdAt: Date; name: string; email: string | null; phone: string | null; _count: { sessions: number } }[]; empty: string }) {
  if (rows.length === 0) return <p className="desk-empty">{empty}</p>;
  return (
    <div className="desk-table">
      <table className="admin-table">
        <thead><tr><th>Joined</th><th>Name</th><th>Email</th><th>Phone</th><th>Sign-ins</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.createdAt.toLocaleString("en-IN")}</td>
              <td>{row.name}</td>
              <td>{row.email || "—"}</td>
              <td>{row.phone || "—"}</td>
              <td>{row._count.sessions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
