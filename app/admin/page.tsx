import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { saveMedia, saveSiteContent, signOutAdmin, updateLead } from "@/lib/admin-actions";
import { deviceLabel } from "@/lib/audit";
import { ensureAdmin, getSession } from "@/lib/auth";
import { getSiteContent } from "@/lib/content";
import { isStatus, NOTE_MAX, statusesFor, statusInfo, type LeadKind } from "@/lib/leads";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { CONTENT_FIELDS, CONTENT_GROUPS, MEDIA_SLOTS, PHOTO_GROUPS, type ContentKey } from "@/lib/site-copy";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/uploads";
import { whatsappLink } from "@/lib/whatsapp";
import "./admin.css";
import { PhotoPicker, SubmitButton } from "@/components/admin-controls";
import { ModelsPanel } from "./models-panel";

export const metadata: Metadata = { title: "MRIGA — Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const SECTIONS = ["overview", "logins", "customers", "retailers", "rides", "applications", "models", "website", "photos"] as const;
type Section = (typeof SECTIONS)[number];

const COPY: Record<Section, { kicker: string; title: string; note: string }> = {
  overview: { kicker: "Desk", title: "Overview", note: "Who has signed in, and which pages people open." },
  logins: { kicker: "People", title: "Login history", note: "Every sign-in and sign-up by customers, retailers, and the desk, with failed attempts. Kept for a year." },
  customers: { kicker: "People", title: "Customers", note: "Accounts created on the customer login." },
  retailers: { kicker: "People", title: "Retailers", note: "Accounts created on the retailer login. Separate from customers." },
  rides: { kicker: "Forms", title: "Test rides", note: "Reservations sent from the booking form." },
  applications: { kicker: "Forms", title: "Dealer enquiries", note: "People who want to sell MRIGA: name, location, phone, and the model they want." },
  models: { kicker: "Content", title: "Models", note: "Photos, text, highlights and specifications for MIRA, RIVA and VIRA. Every save shows on the site and in the PDF catalogue at once." },
  website: { kicker: "Content", title: "Website text", note: "Showroom details and page introductions. Each block saves on its own. Model text and prices are in Models." },
  photos: { kicker: "Content", title: "Photos", note: "Logo and founder portraits. Model photos are in Models." },
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
  "/account": "My account",
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

const PAGE_SIZE = 50;
const DAY_MS = 24 * 60 * 60 * 1000;

type Params = { section?: string; saved?: string; page?: string; q?: string; who?: string; status?: string; sort?: string; block?: string; slot?: string; t?: string; lead?: string; updated?: string; model?: string; field?: string };

function pageOf(value: string | undefined) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 && page < 100000 ? page : 1;
}

function queryOf(value: string | undefined) {
  return typeof value === "string" ? value.trim().slice(0, 80) : "";
}

function since(days: number) {
  return new Date(Date.now() - days * DAY_MS);
}

function when(date: Date) {
  return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}

// "5 min ago" for recent rows, a short date for older ones. The full time is in the tooltip.
function relative(date: Date, now = Date.now()) {
  const seconds = Math.round((now - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const sameYear = new Date(now).getFullYear() === date.getFullYear();
  return date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) });
}

function Ago({ date }: { date: Date }) {
  return <time dateTime={date.toISOString()} title={when(date)}>{relative(date)}</time>;
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="desk-empty">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 13h4l2 3h4l2-3h4" /><path d="M5.5 6.5 4 13v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5l-1.5-6.5A2 2 0 0 0 16.6 5H7.4a2 2 0 0 0-1.9 1.5z" /></svg>
      <p>{children}</p>
    </div>
  );
}

// Search filters. Emails are stored lower-case and phones as digits, so normalise the query to match.
function userSearch(role: "MEMBER" | "RETAILER", q: string): Prisma.UserWhereInput {
  if (!q) return { role };
  const digits = q.replace(/\D/g, "");
  return {
    role,
    OR: [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q.toLowerCase() } },
      ...(digits.length >= 3 ? [{ phone: { contains: digits } }] : []),
    ],
  };
}

function rideSearch(q: string, lead: string | null): Prisma.TestRideWhereInput {
  const status = lead ? { status: lead } : {};
  if (!q) return status;
  const digits = q.replace(/\D/g, "");
  return { ...status, OR: [{ name: { contains: q, mode: "insensitive" } }, { city: { contains: q, mode: "insensitive" } }, ...(digits.length >= 3 ? [{ phone: { contains: digits } }] : [])] };
}

function applicationSearch(q: string, lead: string | null): Prisma.DealerApplicationWhereInput {
  const status = lead ? { status: lead } : {};
  if (!q) return status;
  const digits = q.replace(/\D/g, "");
  return {
    ...status,
    OR: [
      { reference: { contains: q.toUpperCase() } },
      { name: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
      { model: { contains: q.toUpperCase() } },
      ...(digits.length >= 3 ? [{ phone: { contains: digits } }] : []),
    ],
  };
}

const LOGIN_ROLES = ["all", "MEMBER", "RETAILER", "ADMIN"] as const;
type LoginRole = (typeof LOGIN_ROLES)[number];

function loginSearch(role: LoginRole, failed: boolean, q: string): Prisma.LoginEventWhereInput {
  const where: Prisma.LoginEventWhereInput = {};
  if (role !== "all") where.role = role;
  if (failed) where.success = false;
  if (q) {
    const digits = q.replace(/\D/g, "");
    where.OR = [
      { identifier: { contains: q.toLowerCase() } },
      ...(digits.length >= 3 ? [{ identifier: { contains: digits } }] : []),
      { user: { name: { contains: q, mode: "insensitive" } } },
      { ip: { contains: q, mode: "insensitive" } },
    ];
  }
  return where;
}

const ACCOUNT_SORTS = [
  { id: "new", label: "Newest" },
  { id: "active", label: "Recently active" },
  { id: "name", label: "Name A–Z" },
] as const;
type AccountSort = (typeof ACCOUNT_SORTS)[number]["id"];
const ACCOUNT_ORDER: Record<AccountSort, Prisma.UserOrderByWithRelationInput[]> = {
  new: [{ createdAt: "desc" }],
  active: [{ lastLoginAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
  name: [{ name: "asc" }, { createdAt: "desc" }],
};

// Field limits match what saveSiteContent stores, so nothing is silently cut off.
function fieldMax(key: string) {
  return key === "phoneHref" || key === "whatsapp" ? 16 : 600;
}
const FIELD_HINTS: Record<string, string> = {
  phoneHref: "Digits and + only, e.g. +917303042004. Used for the tap-to-call link.",
  instagram: "Must start with https://www.instagram.com/",
  whatsapp: "Country code + number, digits only, e.g. 917303042004. Used by every WhatsApp button on the site.",
};

const accountSelect = { id: true, createdAt: true, lastLoginAt: true, name: true, email: true, phone: true, _count: { select: { logins: { where: { success: true } } } } } as const;
const loginSelect = { id: true, createdAt: true, role: true, method: true, success: true, identifier: true, ip: true, userAgent: true, user: { select: { name: true } } } as const;

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  await ensureAdmin();
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/admin/login");
  const params = await searchParams;
  const section = sectionOf(params.section);
  const page = pageOf(params.page);
  const q = queryOf(params.q);
  const skip = (page - 1) * PAGE_SIZE;
  const dayAgo = since(1);
  const weekAgo = since(7);
  const monthAgo = since(30);
  const copy = COPY[section];
  const people = section === "customers" ? "MEMBER" : section === "retailers" ? "RETAILER" : null;
  const loginRole: LoginRole = LOGIN_ROLES.includes(params.who as LoginRole) ? (params.who as LoginRole) : "all";
  const failedOnly = params.status === "failed";
  const leadKind: LeadKind | null = section === "rides" ? "ride" : section === "applications" ? "dealer" : null;
  const lead = leadKind && isStatus(leadKind, params.lead) ? params.lead : null;
  // Where a lead form sends the admin back to after saving: the same list, filter, and page.
  const listUrl = `/admin?${new URLSearchParams({ section, ...(q ? { q } : {}), ...(lead ? { lead } : {}), ...(page > 1 ? { page: String(page) } : {}) })}`;
  const accountSort: AccountSort = ACCOUNT_SORTS.some((option) => option.id === params.sort) ? (params.sort as AccountSort) : "new";
  const sortFilter: Record<string, string> = accountSort !== "new" ? { sort: accountSort } : {};

  const [customers, retailers, newCustomers, newRetailers, rideGroups, applicationGroups, overview, logins, accounts, rides, applications, content, activity] = await Promise.all([
    prisma.user.count({ where: { role: "MEMBER" } }),
    prisma.user.count({ where: { role: "RETAILER" } }),
    prisma.user.count({ where: { role: "MEMBER", createdAt: { gte: dayAgo } } }),
    prisma.user.count({ where: { role: "RETAILER", createdAt: { gte: dayAgo } } }),
    prisma.testRide.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.dealerApplication.groupBy({ by: ["status"], _count: { _all: true } }),
    section === "overview"
      ? Promise.all([
          prisma.user.count({ where: { role: { not: "ADMIN" }, sessions: { some: {} } } }),
          prisma.loginEvent.count({ where: { success: true, createdAt: { gte: dayAgo }, role: { not: "ADMIN" } } }),
          prisma.loginEvent.count({ where: { success: true, createdAt: { gte: weekAgo }, role: { not: "ADMIN" } } }),
          prisma.loginEvent.count({ where: { success: false, createdAt: { gte: dayAgo } } }),
          prisma.pageView.groupBy({
            by: ["path"],
            where: { kind: "view", createdAt: { gte: monthAgo } },
            _count: { path: true },
            orderBy: { _count: { path: "desc" } },
            take: 20,
          }),
          prisma.loginEvent.findMany({ orderBy: { createdAt: "desc" }, take: 12, select: loginSelect }),
        ]).then(([signedIn, loginsToday, loginsWeek, failedToday, visits, recent]) => ({ signedIn, loginsToday, loginsWeek, failedToday, visits, recent }))
      : null,
    section === "logins"
      ? prisma.$transaction([
          prisma.loginEvent.count({ where: loginSearch(loginRole, failedOnly, q) }),
          prisma.loginEvent.findMany({ where: loginSearch(loginRole, failedOnly, q), orderBy: { createdAt: "desc" }, skip, take: PAGE_SIZE, select: loginSelect }),
        ])
      : null,
    people
      ? prisma.$transaction([
          prisma.user.count({ where: userSearch(people, q) }),
          prisma.user.findMany({ where: userSearch(people, q), orderBy: ACCOUNT_ORDER[accountSort], skip, take: PAGE_SIZE, select: accountSelect }),
        ])
      : null,
    section === "rides"
      ? prisma.$transaction([
          prisma.testRide.count({ where: rideSearch(q, lead) }),
          prisma.testRide.findMany({
            where: rideSearch(q, lead),
            orderBy: { createdAt: "desc" },
            skip,
            take: PAGE_SIZE,
            include: { user: { select: { name: true, email: true, phone: true, role: true } } },
          }),
        ])
      : null,
    section === "applications"
      ? prisma.$transaction([
          prisma.dealerApplication.count({ where: applicationSearch(q, lead) }),
          prisma.dealerApplication.findMany({
            where: applicationSearch(q, lead),
            orderBy: { createdAt: "desc" },
            skip,
            take: PAGE_SIZE,
            include: { user: { select: { name: true, role: true } } },
          }),
        ])
      : null,
    section === "website" ? getSiteContent() : null,
    loadActivity(section, monthAgo),
  ]);
  const rideByStatus = countByStatus(rideGroups);
  const applicationByStatus = countByStatus(applicationGroups);
  const rideCount = rideByStatus.all;
  const applicationCount = applicationByStatus.all;
  const newLeads = (rideByStatus.NEW ?? 0) + (applicationByStatus.NEW ?? 0);
  const visits = overview?.visits ?? [];
  const visitMax = visits[0]?._count.path || 1;
  const nav = [
    { label: "Desk", items: [{ id: "overview" as const, label: "Overview", count: undefined }] },
    { label: "People", items: [{ id: "logins" as const, label: "Login history", count: undefined }, { id: "customers" as const, label: "Customers", count: customers, fresh: newCustomers, freshLabel: "joined in the last 24 hours" }, { id: "retailers" as const, label: "Retailers", count: retailers, fresh: newRetailers, freshLabel: "joined in the last 24 hours" }] },
    { label: "Forms", items: [{ id: "rides" as const, label: "Test rides", count: rideCount, fresh: rideByStatus.NEW ?? 0, freshLabel: "new, not contacted yet" }, { id: "applications" as const, label: "Dealer enquiries", count: applicationCount, fresh: applicationByStatus.NEW ?? 0, freshLabel: "new, not contacted yet" }] },
    { label: "Content", items: [{ id: "models" as const, label: "Models", count: 3 }, { id: "website" as const, label: "Website text", count: undefined }, { id: "photos" as const, label: "Photos", count: MEDIA_SLOTS.filter((slot) => PHOTO_GROUPS.some((group) => group.id === slot.group)).length }] },
  ];
  const matching = q ? ` matching "${q}"` : "";
  const loginFilters = { ...(loginRole !== "all" ? { who: loginRole } : {}), ...(failedOnly ? { status: "failed" } : {}) };

  return (
    <div className="desk theme-heritage">
      <aside className="desk-side">
        <Link className="desk-brand" href="/admin">
          <img src="/media/logo" alt="" />
          <span><b>MRIGA</b><small>Desk</small></span>
        </Link>
        {/* Phone/tablet: the checkbox opens and closes the menu with CSS only, no script. */}
        <input type="checkbox" id="desk-menu" className="desk-menu-toggle" aria-label="Show menu" />
        <label htmlFor="desk-menu" className="desk-menu-btn" aria-hidden="true">
          <span>{copy.title}</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </label>
        <nav aria-label="Desk">
          {nav.map((group) => (
            <div className="desk-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map((item) => (
                <Link key={item.id} href={`/admin?section=${item.id}`} className={section === item.id ? "on" : undefined} aria-current={section === item.id ? "page" : undefined}>
                  {item.label}
                  {"fresh" in item && (item.fresh ?? 0) > 0
                    ? <em className="hot" title={`${item.fresh} ${item.freshLabel} · ${item.count} total`}><span className="sr-only">{item.fresh} {item.freshLabel}, </span>{item.fresh} new</em>
                    : item.count !== undefined ? <em>{item.count}</em> : null}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="desk-foot">
          <div className="desk-me">
            <span>Signed in as</span>
            <b>{session.user.email}</b>
          </div>
          <Link href="/" target="_blank" rel="noopener">View website ↗</Link>
          <form action={signOutAdmin}><SubmitButton className="desk-signout" pending="Signing out…">Sign out</SubmitButton></form>
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
        {overview ? (
          <div className="desk-stack">
            <div className="stat-grid six">
              <article className="stat-card"><b>{customers}</b><span>Customers</span></article>
              <article className="stat-card"><b>{retailers}</b><span>Retailers</span></article>
              <article className="stat-card"><b>{overview.loginsToday}</b><span>Customer and retailer logins, last 24 hours · {overview.loginsWeek} this week</span></article>
              <article className="stat-card"><b>{overview.signedIn}</b><span>Customers and retailers signed in now</span></article>
              <article className="stat-card"><b>{overview.failedToday}</b><span>Failed login attempts, last 24 hours</span></article>
              <article className={newLeads > 0 ? "stat-card hot" : "stat-card"}><b>{newLeads}</b><span>New leads waiting for a call · {rideCount} rides, {applicationCount} dealer in total</span></article>
            </div>
            <section className="desk-panel">
              <h2>Latest logins</h2>
              <p>Customers, retailers, and the desk. <Link href="/admin?section=logins">See the full history</Link>.</p>
              <LoginTable rows={overview.recent} empty="No logins yet." />
            </section>
            <section className="desk-panel">
              <h2>Pages people open</h2>
              <p>Last 30 days. One count per page per browser session, so a refresh does not inflate the number.</p>
              {visits.length === 0 ? <Empty>No visits yet. Open the public site, then come back.</Empty> : (
                <ol className="desk-bars">
                  {visits.map((row) => (
                    <li key={row.path}>
                      <span>{PATH_LABELS[row.path] || row.path}</span>
                      <div className="desk-bar-track" aria-hidden="true"><div style={{ width: `${Math.max(4, (row._count.path / visitMax) * 100)}%` }} /></div>
                      <b>{row._count.path.toLocaleString("en-IN")}</b>
                    </li>
                  ))}
                </ol>
              )}
            </section>
            <section className="desk-panel">
              <h2>Where customers spend time</h2>
              <SectionTotals rows={activity} role="MEMBER" />
            </section>
            <section className="desk-panel">
              <h2>Where retailers spend time</h2>
              <SectionTotals rows={activity} role="RETAILER" />
            </section>
          </div>
        ) : null}

        {logins ? (
          <section className="desk-panel">
            <h2>{logins[0]} {failedOnly ? "failed " : ""}{logins[0] === 1 ? "login" : "logins"}{matching}</h2>
            <div className="desk-chips">
              {LOGIN_ROLES.map((role) => (
                <Link key={role} className={loginRole === role ? "on" : undefined} href={`/admin?${new URLSearchParams({ section: "logins", ...(role !== "all" ? { who: role } : {}), ...(failedOnly ? { status: "failed" } : {}) })}`}>
                  {role === "all" ? "Everyone" : ROLE_LABEL[role]}
                </Link>
              ))}
              <Link className={failedOnly ? "on" : undefined} href={`/admin?${new URLSearchParams({ section: "logins", ...(loginRole !== "all" ? { who: loginRole } : {}), ...(failedOnly ? {} : { status: "failed" }) })}`}>
                Failed only
              </Link>
            </div>
            <SearchBar section={section} q={q} placeholder="Email, phone, name, or IP" extra={loginFilters} />
            <LoginTable rows={logins[1]} empty={q || failedOnly || loginRole !== "all" ? "No logins match these filters." : "No logins yet."} />
            <Pager section={section} q={q} page={page} total={logins[0]} extra={loginFilters} />
          </section>
        ) : null}

        {people && accounts ? (
          <section className="desk-panel">
            <h2>{accounts[0]} {people === "MEMBER" ? "customer" : "retailer"} {accounts[0] === 1 ? "account" : "accounts"}{matching}</h2>
            <div className="desk-chips" aria-label="Sort">
              {ACCOUNT_SORTS.map((option) => (
                <Link key={option.id} className={accountSort === option.id ? "on" : undefined} aria-current={accountSort === option.id ? "true" : undefined} href={`/admin?${new URLSearchParams({ section, ...(q ? { q } : {}), ...(option.id !== "new" ? { sort: option.id } : {}) })}`}>
                  {option.label}
                </Link>
              ))}
            </div>
            <SearchBar section={section} q={q} placeholder="Name, email, or phone" extra={sortFilter} />
            <AccountTable freshSince={dayAgo} rows={accounts[1]} empty={q ? "No accounts match that search." : people === "MEMBER" ? "No customer accounts yet." : "No retailer accounts yet. They sign up on the login page."} />
            <Pager section={section} q={q} page={page} total={accounts[0]} extra={sortFilter} />
            <h3 className="desk-sub">Time and clicks · last 30 days</h3>
            <ActivityTable rows={activity} role={people} />
          </section>
        ) : null}

        {rides ? (
          <section className="desk-panel">
            <h2>{rides[0]} test {rides[0] === 1 ? "ride" : "rides"}{matching}</h2>
            <StatusChips kind="ride" section={section} q={q} active={lead} counts={rideByStatus} />
            <SearchBar section={section} q={q} placeholder="Name, phone, or city" extra={lead ? { lead } : {}} />
            {rides[1].length === 0 ? <Empty>{q ? "No reservations match that search." : "No reservations yet. They appear here as soon as someone books from the site."}</Empty> : (
              <div className="desk-table">
                <table className="admin-table cards">
                  <thead><tr><th>Received</th><th>Name</th><th>Phone</th><th>City</th><th>Model</th><th>Preferred date</th><th>Account</th><th>Follow-up</th></tr></thead>
                  <tbody>
                    {rides[1].map((ride) => (
                      <tr key={ride.id} id={`lead-${ride.id}`} className={[ride.status === "NEW" ? "is-new" : "", params.updated === ride.id ? "just-saved" : ""].join(" ").trim() || undefined}>
                        <td data-label="Received"><Ago date={ride.createdAt} />{ride.status === "NEW" ? <><br /><StatusPill kind="ride" status="NEW" /></> : null}</td>
                        <td data-label="Name"><b>{ride.name}</b></td>
                        <td data-label="Phone"><PhoneLinks phone={ride.phone} message={`Hi ${ride.name.split(" ")[0]}, this is MRIGA about your ${ride.model} test ride.`} /></td>
                        <td data-label="City">{ride.city}</td>
                        <td data-label="Model">{ride.model}</td>
                        <td data-label="Preferred date">{ride.date || "—"}</td>
                        <td data-label="Account">{ride.user ? <>{ride.user.name}<br /><small>{ROLE_LABEL[ride.user.role] ?? ride.user.role} · {ride.user.email || ride.user.phone}</small></> : "Guest"}</td>
                        <td data-label="Follow-up"><LeadForm kind="ride" id={ride.id} status={ride.status} note={ride.adminNote} statusAt={ride.statusAt} back={listUrl} saved={params.updated === ride.id} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pager section={section} q={q} page={page} total={rides[0]} />
          </section>
        ) : null}

        {applications ? (
          <section className="desk-panel">
            <h2>{applications[0]} dealer {applications[0] === 1 ? "enquiry" : "enquiries"}{matching}</h2>
            <StatusChips kind="dealer" section={section} q={q} active={lead} counts={applicationByStatus} />
            <SearchBar section={section} q={q} placeholder="Reference, name, location, phone, or model" extra={lead ? { lead } : {}} />
            {applications[1].length === 0 ? <Empty>{q ? "No enquiries match that search." : "No dealer enquiries yet. They appear here when someone sends the form on the Dealers page."}</Empty> : (
              <div className="desk-table">
                <table className="admin-table cards">
                  <thead><tr><th>Received</th><th>Name</th><th>Phone</th><th>Location</th><th>Model</th><th>Account</th><th>Follow-up</th></tr></thead>
                  <tbody>
                    {applications[1].map((item) => (
                      <tr key={item.id} id={`lead-${item.id}`} className={[item.status === "NEW" ? "is-new" : "", params.updated === item.id ? "just-saved" : ""].join(" ").trim() || undefined}>
                        <td data-label="Received"><Ago date={item.createdAt} /><br /><small>{item.reference}</small>{item.status === "NEW" ? <><br /><StatusPill kind="dealer" status="NEW" /></> : null}</td>
                        <td data-label="Name"><b>{item.name}</b></td>
                        <td data-label="Phone"><PhoneLinks phone={item.phone} message={`Hi ${item.name.split(" ")[0]}, this is MRIGA about your dealer enquiry ${item.reference}.`} /></td>
                        <td data-label="Location">{item.location}</td>
                        <td data-label="Model">{item.model}</td>
                        <td data-label="Account">{item.user ? <>{item.user.name}<br /><small>{ROLE_LABEL[item.user.role] ?? item.user.role}</small></> : "Guest"}</td>
                        <td data-label="Follow-up"><LeadForm kind="dealer" id={item.id} status={item.status} note={item.adminNote} statusAt={item.statusAt} back={listUrl} saved={params.updated === item.id} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pager section={section} q={q} page={page} total={applications[0]} />
          </section>
        ) : null}

        {content ? (
          <div className="desk-stack">
            {CONTENT_GROUPS.filter((group) => group.id !== "mira").map((group) => (
              <section className="desk-panel" key={group.id} id={`block-${group.id}`}>
                <h2>{group.title}</h2>
                <p>{group.note}</p>
                {params.saved === "text" && params.block === group.id ? <p className="desk-note" role="status">Saved. The public site shows this text now.</p> : null}
                <form className="form" action={saveSiteContent}>
                  <input type="hidden" name="block" value={group.id} />
                  <div className="field-grid">
                    {group.keys.map((key) => {
                      const field = CONTENT_FIELDS.find((item) => item.key === key);
                      if (!field) return null;
                      const long = LONG_FIELDS.has(field.key);
                      const max = fieldMax(field.key);
                      return (
                        <div className={long ? "fld wide" : "fld"} key={field.key}>
                          <label htmlFor={field.key}>{field.label}</label>
                          {long ? (
                            <textarea id={field.key} name={field.key} className="plain-in" rows={4} maxLength={max} defaultValue={content[field.key as ContentKey]} aria-describedby={`${field.key}-hint`} />
                          ) : (
                            <input id={field.key} name={field.key} className="plain-in" maxLength={max} defaultValue={content[field.key as ContentKey]} aria-describedby={`${field.key}-hint`} />
                          )}
                          <small className="fld-hint" id={`${field.key}-hint`}>{FIELD_HINTS[field.key] ?? `Up to ${max} characters.`}</small>
                        </div>
                      );
                    })}
                  </div>
                  <SubmitButton className="btn btn-p" pending="Saving…">Save {group.title}</SubmitButton>
                </form>
              </section>
            ))}
          </div>
        ) : null}

        {section === "models" ? <ModelsPanel query={params} /> : null}

        {section === "photos" ? (
          <div className="desk-stack">
            {PHOTO_GROUPS.map((group) => (
              <section className="desk-panel" key={group.id}>
                <h2>{group.title}</h2>
                <p>{group.note}</p>
                <div className="photo-grid">
                  {MEDIA_SLOTS.filter((slot) => slot.group === group.id).map((slot) => (
                    <form key={slot.id} id={`photo-${slot.id}`} className="photo-card" action={saveMedia}>
                      <b>{slot.label}</b>
                      <input type="hidden" name="slot" value={slot.id} />
                      <PhotoPicker
                        current={`/media/${slot.id}?v=${params.saved === slot.id && params.t ? params.t : "1"}`}
                        maxBytes={MAX_UPLOAD_BYTES}
                        maxLabel={MAX_UPLOAD_LABEL}
                      />
                      {params.saved === slot.id ? <p className="desk-note" role="status">Photo replaced.</p> : null}
                      {params.saved === "photo-error" && params.slot === slot.id ? <p className="desk-note bad" role="alert">Use a JPG, PNG, or WEBP under {MAX_UPLOAD_LABEL}.</p> : null}
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
  if (list.length === 0) return <Empty>No time recorded yet. It starts after a customer or retailer signs in and moves around the site.</Empty>;
  return (
    <div className="desk-table">
      <table className="admin-table cards">
        <thead><tr><th>Section</th><th>Time spent</th><th>Clicks</th></tr></thead>
        <tbody>
          {list.map(([path, spot]) => (
            <tr key={path}><td data-label="Section"><b>{PATH_LABELS[path] || path}</b></td><td data-label="Time spent">{clock(spot.seconds)}</td><td data-label="Clicks">{spot.clicks}</td></tr>
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
  if (list.length === 0) return <Empty>Nothing recorded for this group yet.</Empty>;
  return (
    <div className="desk-table">
      <table className="admin-table cards">
        <thead><tr><th>Name</th><th>Time on site</th><th>Most time</th><th>Clicks</th><th>Sections opened</th></tr></thead>
        <tbody>
          {list.map((person) => {
            const ranked = [...person.paths.entries()].sort((a, b) => b[1].seconds - a[1].seconds || b[1].clicks - a[1].clicks);
            const top = ranked[0];
            return (
              <tr key={person.contact + person.name}>
                <td data-label="Name"><b>{person.name}</b><br /><small>{person.contact}</small></td>
                <td data-label="Time on site">{clock(person.seconds)}</td>
                <td data-label="Most time">{top ? `${PATH_LABELS[top[0]] || top[0]} · ${clock(top[1].seconds)}` : "—"}</td>
                <td data-label="Clicks">{person.clicks}</td>
                <td data-label="Sections opened">{ranked.map(([path, spot]) => `${PATH_LABELS[path] || path} (${spot.clicks})`).join(", ")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const ROLE_LABEL: Record<string, string> = { MEMBER: "Customer", RETAILER: "Retailer", ADMIN: "Desk" };
const METHOD_LABEL: Record<string, string> = { password: "Password", google: "Google", signup: "New account" };

type LoginRow = {
  id: string;
  createdAt: Date;
  role: string;
  method: string;
  success: boolean;
  identifier: string;
  ip: string | null;
  userAgent: string | null;
  user: { name: string } | null;
};

function LoginTable({ rows, empty }: { rows: LoginRow[]; empty: string }) {
  if (rows.length === 0) return <Empty>{empty}</Empty>;
  return (
    <div className="desk-table">
      <table className="admin-table cards">
        <thead><tr><th>When</th><th>Who</th><th>Type</th><th>How</th><th>Result</th><th>IP</th><th>Device</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td data-label="When"><Ago date={row.createdAt} /></td>
              <td data-label="Who"><b>{row.user?.name ?? "—"}</b><br /><small>{row.identifier}</small></td>
              <td data-label="Type">{ROLE_LABEL[row.role] ?? row.role}</td>
              <td data-label="How">{METHOD_LABEL[row.method] ?? row.method}</td>
              <td data-label="Result"><span className={row.success ? "desk-pill ok" : "desk-pill bad"}>{row.success ? "Signed in" : "Failed"}</span></td>
              <td data-label="IP">{row.ip ?? "—"}</td>
              <td data-label="Device">{deviceLabel(row.userAgent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccountTable({ rows, empty, freshSince }: { freshSince: Date; rows: { id: string; createdAt: Date; lastLoginAt: Date | null; name: string; email: string | null; phone: string | null; _count: { logins: number } }[]; empty: string }) {
  if (rows.length === 0) return <Empty>{empty}</Empty>;
  return (
    <div className="desk-table">
      <table className="admin-table cards">
        <thead><tr><th>Joined</th><th>Name</th><th>Email</th><th>Phone</th><th>Last login</th><th>Logins</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td data-label="Joined"><Ago date={row.createdAt} />{row.createdAt >= freshSince ? <><br /><span className="desk-pill new">New</span></> : null}</td>
              <td data-label="Name"><b>{row.name}</b></td>
              <td data-label="Email">{row.email || "—"}</td>
              <td data-label="Phone">{row.phone || "—"}</td>
              <td data-label="Last login">{row.lastLoginAt ? <Ago date={row.lastLoginAt} /> : "Never"}</td>
              <td data-label="Logins">{row._count.logins}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SearchBar({ section, q, placeholder, extra = {} }: { section: Section; q: string; placeholder: string; extra?: Record<string, string> }) {
  const clear = `/admin?${new URLSearchParams({ section, ...extra })}`;
  return (
    <form className="desk-tools" action="/admin" method="get" role="search">
      <input type="hidden" name="section" value={section} />
      {Object.entries(extra).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
      <input className="plain-in" type="search" name="q" defaultValue={q} placeholder={placeholder} maxLength={80} aria-label="Search" />
      <button className="btn btn-g btn-sm" type="submit">Search</button>
      {q ? <Link className="btn btn-g btn-sm" href={clear}>Clear</Link> : null}
    </form>
  );
}

function Pager({ section, q, page, total, extra = {} }: { section: Section; q: string; page: number; total: number; extra?: Record<string, string> }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pages <= 1) return null;
  const href = (target: number) => `/admin?${new URLSearchParams({ section, ...extra, ...(q ? { q } : {}), page: String(target) })}`;
  return (
    <nav className="desk-pager" aria-label="Pages">
      <span>Page {Math.min(page, pages)} of {pages}</span>
      <div>
        {page > 1 ? <Link href={href(page - 1)}>Previous</Link> : <span className="off">Previous</span>}
        {page < pages ? <Link href={href(page + 1)}>Next</Link> : <span className="off">Next</span>}
      </div>
    </nav>
  );
}

function countByStatus(groups: { status: string; _count: { _all: number } }[]) {
  const counts: Record<string, number> & { all: number } = { all: 0 };
  for (const group of groups) {
    counts[group.status] = group._count._all;
    counts.all += group._count._all;
  }
  return counts;
}

function StatusPill({ kind, status }: { kind: LeadKind; status: string }) {
  const info = statusInfo(kind, status);
  return <span className={`desk-pill ${info.tone}`}>{info.label}</span>;
}

function StatusChips({ kind, section, q, active, counts }: { kind: LeadKind; section: Section; q: string; active: string | null; counts: Record<string, number> & { all: number } }) {
  const href = (status: string | null) => `/admin?${new URLSearchParams({ section, ...(q ? { q } : {}), ...(status ? { lead: status } : {}) })}`;
  return (
    <div className="desk-chips" aria-label="Filter by follow-up">
      <Link className={active ? undefined : "on"} aria-current={active ? undefined : "true"} href={href(null)}>All <span>{counts.all}</span></Link>
      {statusesFor(kind).map((status) => (
        <Link key={status.id} className={active === status.id ? "on" : undefined} aria-current={active === status.id ? "true" : undefined} href={href(status.id)}>
          {status.label} <span>{counts[status.id] ?? 0}</span>
        </Link>
      ))}
    </div>
  );
}

function LeadForm({ kind, id, status, note, statusAt, back, saved }: { kind: LeadKind; id: string; status: string; note: string | null; statusAt: Date | null; back: string; saved: boolean }) {
  return (
    <form className="lead-form" action={updateLead}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="back" value={back} />
      <label className="sr-only" htmlFor={`status-${id}`}>Follow-up status</label>
      <select id={`status-${id}`} name="status" className="plain-in" defaultValue={status}>
        {statusesFor(kind).map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
      </select>
      <label className="sr-only" htmlFor={`note-${id}`}>Note</label>
      <textarea id={`note-${id}`} name="note" className="plain-in" rows={2} maxLength={NOTE_MAX} defaultValue={note ?? ""} placeholder="Note, e.g. call back Monday" />
      <div className="lead-form-foot">
        <SubmitButton className="btn btn-g btn-sm" pending="Saving…">Save</SubmitButton>
        {saved ? <span className="lead-saved" role="status">Saved</span> : statusAt ? <small>Updated <Ago date={statusAt} /></small> : null}
      </div>
    </form>
  );
}

// Call and WhatsApp links for a lead's number, so the desk can reply straight from the list.
function PhoneLinks({ phone, message }: { phone: string; message: string }) {
  const chat = whatsappLink(phone, message);
  return (
    <span className="phone-links">
      <a href={`tel:${phone}`}>{phone}</a>
      {chat ? <a className="wa-link" href={chat} target="_blank" rel="noopener">WhatsApp</a> : null}
    </span>
  );
}
