"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/actions";

export function AdminLoginForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    data.set("desk", "admin");
    data.set("next", "/admin");
    setBusy(true);
    setErr("");
    const result = await signIn(data);
    setBusy(false);
    if (!result.ok) {
      setErr(result.error);
      return;
    }
    router.push(result.href);
    router.refresh();
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="fld">
        <label htmlFor="admin-id">Email</label>
        <input id="admin-id" name="id" className="plain-in" autoComplete="username" required />
      </div>
      <div className="fld">
        <label htmlFor="admin-pw">Password</label>
        <input id="admin-pw" name="pw" type="password" className="plain-in" autoComplete="current-password" required />
      </div>
      {err ? <p className="err" role="alert">{err}</p> : null}
      <button className="btn btn-d btn-block" type="submit" disabled={busy}>{busy ? "Checking…" : "Sign in"}</button>
    </form>
  );
}
