import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountWhatsApp } from "@/components/account-whatsapp";
import { NameForm, PasswordForm, SignOutButton } from "@/components/account-forms";
import { SiteFrame } from "@/components/site-frame";
import { deviceLabel } from "@/lib/audit";
import { getSession } from "@/lib/auth";
import { initials } from "@/lib/initials";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "MRIGA — My account", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// What a customer sees for each follow-up status the desk sets (lib/leads.ts).
const RIDE_STATUS: Record<string, { label: string; tone: string; note: string }> = {
  NEW: { label: "Requested", tone: "new", note: "We will call you to fix a time." },
  CONTACTED: { label: "In touch", tone: "wait", note: "Our team has contacted you." },
  COMPLETED: { label: "Ride done", tone: "ok", note: "Thanks for riding MIRA." },
  CANCELLED: { label: "Cancelled", tone: "off", note: "Book again any time." },
};
const DEALER_STATUS: Record<string, { label: string; tone: string }> = {
  NEW: { label: "Received", tone: "new" },
  CONTACTED: { label: "In discussion", tone: "wait" },
  APPROVED: { label: "Approved", tone: "ok" },
  REJECTED: { label: "Not taken forward", tone: "off" },
};

function when(date: Date) {
  return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function day(date: Date) {
  return date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric" });
}

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");
  if (session.user.role === "ADMIN") redirect("/admin");
  const userId = session.user.id;

  const [user, rides, enquiries, logins] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, phone: true, role: true, createdAt: true, lastLoginAt: true, passwordHash: true, googleId: true },
    }),
    prisma.testRide.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, model: true, city: true, date: true, status: true, createdAt: true } }),
    prisma.dealerApplication.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, reference: true, model: true, location: true, status: true, createdAt: true } }),
    prisma.loginEvent.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 8, select: { id: true, createdAt: true, method: true, success: true, userAgent: true } }),
  ]);
  if (!user) redirect("/login");
  const retailer = user.role === "RETAILER";
  const first = user.name.split(/\s+/)[0];

  return (
    <SiteFrame>
      <main className="page acct">
        <section className="phead">
          <div className="wrap">
            <span className="eyebrow"><span className="dot" />{retailer ? "Retailer account" : "My account"}</span>
            <h1 className="h1 mixed">Hello, {first}.</h1>
            <p className="lead">Your details, bookings and sign-in history in one place.</p>
          </div>
        </section>

        <section className="sec acct-sec">
          <div className="wrap acct-grid">
            <article className="card acct-card acct-profile">
              <div className="acct-head">
                <span className="acct-avatar lg" aria-hidden="true">{initials(user.name)}</span>
                <div>
                  <h2>{user.name}</h2>
                  <p>{retailer ? "Retailer" : "Customer"} · member since {day(user.createdAt)}</p>
                </div>
              </div>
              <dl className="acct-dl">
                <dt>Email</dt><dd>{user.email || "—"}</dd>
                <dt>Mobile</dt><dd>{user.phone || "—"}</dd>
                <dt>Sign-in</dt><dd>{user.passwordHash ? "Password" : ""}{user.passwordHash && user.googleId ? " and " : ""}{user.googleId ? "Google" : ""}</dd>
                <dt>Last sign-in</dt><dd>{user.lastLoginAt ? when(user.lastLoginAt) : "—"}</dd>
              </dl>
              <div className="cta-row">
                <AccountWhatsApp name={user.name} />
                <SignOutButton />
              </div>
            </article>

            <article className="card acct-card">
              <div className="acct-card-h">
                <h2>Test rides</h2>
                <a href="#book" className="btn btn-p btn-sm">Book a test ride</a>
              </div>
              {rides.length === 0 ? (
                <p className="acct-empty">No test rides yet. Book one and it will appear here with its status. Rides booked while signed out are not linked to your account.</p>
              ) : (
                <ul className="acct-list">
                  {rides.map((ride) => {
                    const status = RIDE_STATUS[ride.status] ?? RIDE_STATUS.NEW;
                    return (
                      <li key={ride.id}>
                        <div>
                          <b>{ride.model}</b> · {ride.city}
                          <small>{ride.date ? `Preferred ${ride.date} · ` : ""}booked {when(ride.createdAt)}</small>
                          <small>{status.note}</small>
                        </div>
                        <span className={`acct-pill ${status.tone}`}>{status.label}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </article>

            <article className="card acct-card">
              <div className="acct-card-h"><h2>Orders</h2></div>
              <p className="acct-empty">No orders yet. MRIGA scooters are sold at the Rohini showroom: book a test ride or message us on WhatsApp to buy one.</p>
            </article>

            {retailer || enquiries.length > 0 ? (
              <article className="card acct-card">
                <div className="acct-card-h">
                  <h2>Dealer enquiries</h2>
                  <Link href="/dealers#apply" className="btn btn-g btn-sm">New enquiry</Link>
                </div>
                {enquiries.length === 0 ? (
                  <p className="acct-empty">No dealer enquiries from this account yet.</p>
                ) : (
                  <ul className="acct-list">
                    {enquiries.map((item) => {
                      const status = DEALER_STATUS[item.status] ?? DEALER_STATUS.NEW;
                      return (
                        <li key={item.id}>
                          <div>
                            <b>{item.model}</b> · {item.location}
                            <small>{item.reference} · sent {when(item.createdAt)}</small>
                          </div>
                          <span className={`acct-pill ${status.tone}`}>{status.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </article>
            ) : null}

            <article className="card acct-card">
              <div className="acct-card-h"><h2>Profile</h2></div>
              <NameForm name={user.name} />
            </article>

            {user.passwordHash ? (
              <article className="card acct-card">
                <div className="acct-card-h"><h2>Password</h2></div>
                <p className="acct-note">Changing it signs you out on every other device.</p>
                <PasswordForm />
              </article>
            ) : null}

            <article className="card acct-card acct-wide">
              <div className="acct-card-h"><h2>Recent sign-ins</h2></div>
              <p className="acct-note">If you do not recognise one, change your password and tell us on WhatsApp.</p>
              {logins.length === 0 ? <p className="acct-empty">No sign-ins recorded yet.</p> : (
                <ul className="acct-list">
                  {logins.map((login) => (
                    <li key={login.id}>
                      <div>
                        <b>{deviceLabel(login.userAgent)}</b>
                        <small>{when(login.createdAt)} · {login.method === "google" ? "Google" : login.method === "signup" ? "Account created" : "Password"}</small>
                      </div>
                      <span className={`acct-pill ${login.success ? "ok" : "off"}`}>{login.success ? "Signed in" : "Failed attempt"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
