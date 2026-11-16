"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword, updateName } from "@/lib/account-actions";
import { signOut } from "@/lib/actions";
import { announceAuthChange } from "@/components/account-chip";

function Status({ state }: { state: { ok: boolean; message?: string; error?: string } | null }) {
  if (!state) return null;
  return state.ok
    ? <p className="acct-ok" role="status">{state.message}</p>
    : <p className="err" role="alert">{state.error}</p>;
}

export function NameForm({ name }: { name: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(async (previous: Awaited<ReturnType<typeof updateName>> | null, form: FormData) => {
    const result = await updateName(previous, form);
    if (result.ok) {
      announceAuthChange();
      router.refresh();
    }
    return result;
  }, null);
  return (
    <form className="acct-form" action={action}>
      <div className="fld">
        <label htmlFor="acct-name">Full name</label>
        <input id="acct-name" name="name" className="plain-in" defaultValue={name} autoComplete="name" maxLength={80} required />
      </div>
      <Status state={state} />
      <button className="btn btn-g btn-sm" type="submit" disabled={pending}>{pending ? "Saving…" : "Save name"}</button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);
  const [show, setShow] = useState(false);
  const type = show ? "text" : "password";
  return (
    <form className="acct-form" action={action} key={state?.ok ? "done" : "form"}>
      <div className="fld">
        <label htmlFor="acct-current">Current password</label>
        <input id="acct-current" name="current" type={type} className="plain-in" autoComplete="current-password" required />
      </div>
      <div className="fld">
        <label htmlFor="acct-next">New password</label>
        <input id="acct-next" name="next" type={type} className="plain-in" autoComplete="new-password" minLength={10} required />
        <small className="acct-hint">10+ characters, with a letter and a number.</small>
      </div>
      <div className="fld">
        <label htmlFor="acct-confirm">Repeat new password</label>
        <input id="acct-confirm" name="confirm" type={type} className="plain-in" autoComplete="new-password" required />
      </div>
      <label className="check" style={{ fontSize: 13 }}>
        <input type="checkbox" checked={show} onChange={(event) => setShow(event.target.checked)} /> Show passwords
      </label>
      <Status state={state} />
      <button className="btn btn-g btn-sm" type="submit" disabled={pending}>{pending ? "Changing…" : "Change password"}</button>
    </form>
  );
}

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="btn btn-g"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await signOut();
        announceAuthChange();
        router.push("/login");
        router.refresh();
      }}
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
