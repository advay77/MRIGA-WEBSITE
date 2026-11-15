import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { ensureAdmin, getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "MRIGA — Desk", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  await ensureAdmin();
  const session = await getSession();
  if (session?.user.role === "ADMIN") redirect("/admin");
  return (
    <main className="gate theme-heritage">
      <section className="gate-card">
        <img src="/media/logo" alt="" />
        <span>Private</span>
        <h1>Desk</h1>
        <p>Email and password for this desk only.</p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
