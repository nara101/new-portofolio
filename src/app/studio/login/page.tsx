"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/studio/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErr(data.error || "Login failed.");
        setLoading(false);
        return;
      }
      const from = sp.get("from") || "/studio";
      router.push(from);
      router.refresh();
    } catch {
      setErr("Network error. Try again.");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24 }}>
      <form onSubmit={submit} className="studio-card" style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ marginBottom: 24 }}>
          <div className="studio-tag">Studio</div>
          <h1 style={{ fontSize: 26, marginTop: 10 }}>Sign in</h1>
          <p style={{ fontSize: 14, color: "var(--lagoon-2)", marginTop: 6 }}>
            Only the site owner can sign in here.
          </p>
        </div>

        {err && <div className="studio-flash err">{err}</div>}

        <div style={{ marginBottom: 14 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            autoFocus
          />
        </div>

        <div style={{ marginBottom: 22 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="studio-btn" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
