import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteFrame } from "@/components/site-frame";
import { ensureAdmin, getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { signOut } from "@/lib/actions";

export const metadata: Metadata = {
  title: "MRIGA — Atelier Desk",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function Page() {
  await ensureAdmin();
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/login?next=/admin");
  const [rides, applications] = await Promise.all([
    prisma.testRide.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.dealerApplication.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { files: true } }),
  ]);

  return (
    <SiteFrame>
      <main className="page">
        <section className="phead">
          <div className="wrap">
            <span className="eyebrow"><span className="dot" />Private · Not indexed</span>
            <h1 className="h1">Atelier Desk</h1>
            <p className="lead">Test-ride reservations and dealer applications stored for this atelier. Signed in as {session.user.email}.</p>
            <form action={signOut}>
              <button className="btn btn-g btn-sm" type="submit">Sign out</button>
            </form>
          </div>
        </section>
        <section className="sec">
          <div className="wrap">
            <h2 className="h2">Test rides</h2>
            {rides.length === 0 ? <p className="sub">No reservations yet.</p> : (
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr><th>When</th><th>Name</th><th>Phone</th><th>City</th><th>Model</th><th>Date</th></tr>
                  </thead>
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
          </div>
        </section>
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <h2 className="h2">Dealer applications</h2>
            {applications.length === 0 ? <p className="sub">No applications yet.</p> : (
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr><th>Reference</th><th>Signatory</th><th>Entity</th><th>City</th><th>Models</th><th>Files</th></tr>
                  </thead>
                  <tbody>
                    {applications.map((item) => (
                      <tr key={item.id}>
                        <td>{item.reference}<br />{item.createdAt.toLocaleString("en-IN")}</td>
                        <td>{item.name}<br />{item.email}<br />{item.mobile}</td>
                        <td>{item.entity}<br />{item.constitution}<br />{item.gst}</td>
                        <td>{item.city}<br />{item.area}</td>
                        <td>{item.models}<br />{item.liquidity}</td>
                        <td>
                          {item.files.length === 0 ? "—" : item.files.map((file) => (
                            <a key={file.id} href={`/admin/files/${file.id}`}>{file.filename}</a>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
