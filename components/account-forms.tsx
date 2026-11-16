"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword, updateProfile } from "@/lib/account-actions";
import { signOut } from "@/lib/actions";
import { announceAuthChange } from "@/components/account-chip";

function Status({ state }: { state: { ok: boolean; message?: string; error?: string } | null }) {
  if (!state) return null;
  return state.ok
    ? <p className="acct-ok" role="status">{state.message}</p>
    : <p className="err" role="alert">{state.error}</p>;
}

type Profile = { name: string; email: string | null; phone: string | null; city: string | null; preferredModel: string | null; updatesOptIn: boolean; hasPassword: boolean };

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [email, setEmail] = useState(profile.email ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const identityChanged = email.trim().toLowerCase() !== (profile.email ?? "") || phone.replace(/\D/g, "").slice(-10) !== (profile.phone ?? "").slice(-10);
  const [state, action, pending] = useActionState(async (previous: Awaited<ReturnType<typeof updateProfile>> | null, form: FormData) => {
    const result = await updateProfile(previous, form);
    if (result.ok) {
      announceAuthChange();
      router.refresh();
    }
    return result;
  }, null);
  return (
    // React resets a form to its default values after its action runs. Keying it on the saved
    // profile rebuilds it with the new values, so a second save never sends stale blanks.
    <form className="acct-form" action={action} key={[profile.name, profile.city, profile.preferredModel, profile.updatesOptIn].join("|")}>
      <div className="acct-fields">
        <div className="fld">
          <label htmlFor="acct-name">Full name</label>
          <input id="acct-name" name="name" className="plain-in" defaultValue={profile.name} autoComplete="name" maxLength={80} required />
        </div>
        <div className="fld">
          <label htmlFor="acct-city">City</label>
          <input id="acct-city" name="city" className="plain-in" defaultValue={profile.city ?? ""} autoComplete="address-level2" maxLength={80} placeholder="e.g. Rohini, New Delhi" />
        </div>
        <div className="fld">
          <label htmlFor="acct-email">Email</label>
          <input id="acct-email" name="email" type="email" className="plain-in" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" maxLength={120} placeholder="name@example.com" />
        </div>
        <div className="fld">
          <label htmlFor="acct-phone">Mobile</label>
          <input id="acct-phone" name="phone" className="plain-in" value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" autoComplete="tel" maxLength={24} placeholder="+91 98765 43210" />
        </div>
        <div className="fld">
          <label htmlFor="acct-model">Model you like</label>
          <select id="acct-model" name="preferredModel" className="plain-in" defaultValue={profile.preferredModel ?? ""}>
            <option value="">Not decided</option>
            <option value="MIRA">MIRA (on sale)</option>
            <option value="RIVA">RIVA (coming soon)</option>
            <option value="VIRA">VIRA (coming soon)</option>
          </select>
        </div>
        <label className="check acct-check">
          <input type="checkbox" name="updatesOptIn" defaultChecked={profile.updatesOptIn} /> Send me offers and launch news on WhatsApp
        </label>
      </div>
      {identityChanged && profile.hasPassword ? (
        <div className="fld acct-confirm">
          <label htmlFor="acct-confirm-pw">Current password (needed to change email or mobile)</label>
          <input id="acct-confirm-pw" name="current" type="password" className="plain-in" autoComplete="current-password" required />
        </div>
      ) : null}
      <Status state={state} />
      <button className="btn btn-p btn-sm" type="submit" disabled={pending}>{pending ? "Saving…" : "Save profile"}</button>
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
