"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend, uploadFile } from "./helpers";
import { Flash } from "./Flash";

interface Identity {
  name: string;
  role: string;
  location: string;
  email: string;
  linkedin: string;
  github: string;
  githubUser: string;
  cv: string;
  portrait: string;
}

const EMPTY: Identity = {
  name: "", role: "", location: "", email: "",
  linkedin: "", github: "", githubUser: "", cv: "", portrait: "",
};

export default function IdentityEditor() {
  const [data, setData] = useState<Identity>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Identity>("/api/studio/identity")
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setErr(String(e.message)); setLoading(false); });
  }, []);

  function on<K extends keyof Identity>(k: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setData({ ...data, [k]: e.target.value });
  }

  async function save() {
    setSaving(true); setOk(null); setErr(null);
    try {
      await apiSend("/api/studio/identity", "PUT", data);
      setOk("Identity saved.");
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  }

  async function uploadTo(field: "cv" | "portrait", file: File, kind: "image" | "pdf") {
    setErr(null);
    try {
      const url = await uploadFile(file, kind);
      setData((d) => ({ ...d, [field]: url }));
      setOk(`${field} uploaded.`);
    } catch (e: any) { setErr(e.message); }
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: 6 }}>Identity</h2>
      <p style={{ color: "var(--lagoon-2)", marginBottom: 20 }}>Your name, role, and contact links.</p>

      <Flash ok={ok} err={err} onClear={() => { setOk(null); setErr(null); }} />

      <div className="studio-card">
        <div className="studio-row">
          <div><label>Name</label><input value={data.name} onChange={on("name")} /></div>
          <div><label>Role</label><input value={data.role} onChange={on("role")} /></div>
        </div>
        <div style={{ height: 12 }} />
        <div className="studio-row">
          <div><label>Location</label><input value={data.location} onChange={on("location")} /></div>
          <div><label>Email</label><input value={data.email} onChange={on("email")} /></div>
        </div>
        <div style={{ height: 12 }} />
        <div><label>LinkedIn URL</label><input value={data.linkedin} onChange={on("linkedin")} /></div>
        <div style={{ height: 12 }} />
        <div className="studio-row">
          <div><label>GitHub URL</label><input value={data.github} onChange={on("github")} /></div>
          <div><label>GitHub username</label><input value={data.githubUser} onChange={on("githubUser")} /></div>
        </div>

        <div style={{ height: 20, borderTop: "1px solid var(--border)", margin: "20px 0" }} />

        <div>
          <label>Portrait image</label>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input value={data.portrait} onChange={on("portrait")} placeholder="/images/…" />
            <label className="studio-btn studio-btn-ghost" style={{ margin: 0, textTransform: "none", letterSpacing: 0, fontSize: 13 }}>
              Upload
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => e.target.files?.[0] && uploadTo("portrait", e.target.files[0], "image")}
              />
            </label>
          </div>
          {data.portrait && <img src={data.portrait} alt="" style={{ marginTop: 10, maxHeight: 120, borderRadius: 10 }} />}
        </div>

        <div style={{ height: 12 }} />

        <div>
          <label>CV (PDF)</label>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input value={data.cv} onChange={on("cv")} placeholder="/pdf/…" />
            <label className="studio-btn studio-btn-ghost" style={{ margin: 0, textTransform: "none", letterSpacing: 0, fontSize: 13 }}>
              Upload
              <input
                type="file"
                accept="application/pdf"
                hidden
                onChange={(e) => e.target.files?.[0] && uploadTo("cv", e.target.files[0], "pdf")}
              />
            </label>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <button className="studio-btn" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
