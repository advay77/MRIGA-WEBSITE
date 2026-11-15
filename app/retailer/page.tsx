import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteFrame } from "@/components/site-frame";
import { getSession } from "@/lib/auth";
import { signOut } from "@/lib/actions";

export const metadata: Metadata = { title: "MRIGA — Retailer" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getSession();
  if (!session || session.user.role !== "RETAILER") redirect("/login");
  return (
    <SiteFrame>
      <main className="page">
        <section className="phead">
          <div className="wrap">
            <span className="eyebrow"><span className="dot" />Retailer</span>
            <h1 className="h1 mixed">Welcome, {session.user.name.split(" ")[0]}.</h1>
            <p className="lead">This is your retailer account.</p>
            <form action={signOut}>
              <button className="btn btn-g" type="submit">Sign out</button>
            </form>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
