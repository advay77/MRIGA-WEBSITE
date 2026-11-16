"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/actions";
import { SEND_FAILED, sendWithTurnstile, Turnstile } from "@/components/turnstile";

export function AdminLoginForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [check, setCheck] = useState(0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setErr("");
    const result = await sendWithTurnstile(form, (data) => {
      data.set("desk", "admin");
      data.set("next", "/admin");
    }, signIn, () => setCheck((value) => value + 1));
    setBusy(false);
    if (!result?.ok) {
      setErr(result?.error || SEND_FAILED);
      return;
    }
    router.push(result.href);
    router.refresh();
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="fld">
        <label htmlFor="admin-id">Email</label>
        <input id="admin-id" name="id" className="plain-in" autoComplete="username" required />
      </div>
      <div className="fld">
        <label htmlFor="admin-pw">Password</label>
        <input id="admin-pw" name="pw" type="password" className="plain-in" autoComplete="current-password" required />
      </div>
      <Turnstile key={check} action="admin_login" />
      {err ? <p className="err" role="alert">{err}</p> : null}
      <button className="btn btn-d btn-block" type="submit" disabled={busy}>{busy ? "Checking…" : "Sign in"}</button>
    </form>
  );
}
