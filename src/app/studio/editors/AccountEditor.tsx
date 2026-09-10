"use client";

import { useState } from "react";
import { apiSend } from "./helpers";
import { Flash } from "./Flash";

export default function AccountEditor() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setErr(null); setOk(null);
    if (password && password.length < 6) return setErr("Password must be at least 6 characters.");
    if (password && password !== confirm) return setErr("Passwords do not match.");
    if (!email && !password) return setErr("Nothing to change.");
    setSaving(true);
    try {
      await apiSend("/api/studio/auth/account", "PUT", { email: email || undefined, password: password || undefined });
      setOk("Account updated.");
      setEmail(""); setPassword(""); setConfirm("");
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: 6 }}>Account</h2>
      <p style={{ color: "var(--lagoon-2)", marginBottom: 20 }}>Change the login email or password. Leave blank to keep the current value.</p>
      <Flash ok={ok} err={err} onClear={() => { setOk(null); setErr(null); }} />

      <div className="studio-card">
        <div><label>New email (optional)</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
        <div style={{ height: 12 }} />
        <div><label>New password (optional, min 6 chars)</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <div style={{ height: 12 }} />
        <div><label>Confirm new password</label><input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
        <div style={{ marginTop: 20 }}>
          <button className="studio-btn" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
        </div>
      </div>
    </div>
  );
}
