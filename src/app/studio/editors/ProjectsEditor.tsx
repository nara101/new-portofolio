"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend, uploadFile } from "./helpers";
import { Flash } from "./Flash";

interface Row {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  liveUrl: string | null;
  repoUrl: string | null;
  stack: string[];
  screenshot: string | null;
  challenge: string | null;
  solution: string | null;
  sort_order: number;
}

export default function ProjectsEditor() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { setRows(await apiGet<Row[]>("/api/studio/projects")); }
    catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add() {
    try {
      await apiSend("/api/studio/projects", "POST", {
        slug: `project-${Date.now()}`,
        name: "New project",
        tagline: "Short one-line summary.",
        description: "Longer description of the project.",
        stack: [],
      });
      setOk("Added.");
      await load();
    } catch (e: any) { setErr(e.message); }
  }
  async function save(r: Row) {
    try { await apiSend("/api/studio/projects", "PUT", r); setOk("Saved."); }
    catch (e: any) { setErr(e.message); }
  }
  async function remove(id: number) {
    if (!confirm("Delete this project?")) return;
    try { await apiSend(`/api/studio/projects?id=${id}`, "DELETE"); setOk("Deleted."); await load(); }
    catch (e: any) { setErr(e.message); }
  }
  function update(id: number, patch: Partial<Row>) {
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  async function uploadShot(id: number, f: File) {
    try { const url = await uploadFile(f, "image"); update(id, { screenshot: url }); setOk("Uploaded."); }
    catch (e: any) { setErr(e.message); }
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: 6 }}>Projects</h2>
      <p style={{ color: "var(--lagoon-2)", marginBottom: 20 }}>Stack: comma-separated (e.g. React, Tailwind, Next).</p>
      <Flash ok={ok} err={err} onClear={() => { setOk(null); setErr(null); }} />
      <button className="studio-btn" onClick={add} style={{ marginBottom: 16 }}>+ Add project</button>

      {rows.map((r) => (
        <div key={r.id} className="studio-card" style={{ marginBottom: 12 }}>
          <div className="studio-row">
            <div><label>Name</label><input value={r.name} onChange={(e) => update(r.id, { name: e.target.value })} /></div>
            <div><label>Slug (url-friendly id)</label><input value={r.slug} onChange={(e) => update(r.id, { slug: e.target.value })} /></div>
          </div>
          <div style={{ height: 10 }} />
          <div><label>Tagline</label><input value={r.tagline} onChange={(e) => update(r.id, { tagline: e.target.value })} /></div>
          <div style={{ height: 10 }} />
          <div><label>Description</label><textarea value={r.description} onChange={(e) => update(r.id, { description: e.target.value })} /></div>
          <div style={{ height: 10 }} />
          <div className="studio-row">
            <div><label>Live URL</label><input value={r.liveUrl || ""} onChange={(e) => update(r.id, { liveUrl: e.target.value })} /></div>
            <div><label>Repo URL</label><input value={r.repoUrl || ""} onChange={(e) => update(r.id, { repoUrl: e.target.value })} /></div>
          </div>
          <div style={{ height: 10 }} />
          <div><label>Stack (comma-separated)</label><input value={r.stack.join(", ")} onChange={(e) => update(r.id, { stack: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></div>
          <div style={{ height: 10 }} />
          <div>
            <label>Screenshot (optional)</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input value={r.screenshot || ""} onChange={(e) => update(r.id, { screenshot: e.target.value })} placeholder="/images/…" />
              <label className="studio-btn studio-btn-ghost" style={{ margin: 0, textTransform: "none", letterSpacing: 0, fontSize: 13 }}>
                Upload
                <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadShot(r.id, e.target.files[0])} />
              </label>
            </div>
            {r.screenshot && <img src={r.screenshot} alt="" style={{ marginTop: 8, maxHeight: 100, borderRadius: 8 }} />}
          </div>
          <div style={{ height: 10 }} />
          <div className="studio-row">
            <div><label>Challenge (optional)</label><textarea value={r.challenge || ""} onChange={(e) => update(r.id, { challenge: e.target.value })} /></div>
            <div><label>Solution (optional)</label><textarea value={r.solution || ""} onChange={(e) => update(r.id, { solution: e.target.value })} /></div>
          </div>
          <div style={{ height: 10 }} />
          <div><label>Sort order</label><input type="number" value={r.sort_order} onChange={(e) => update(r.id, { sort_order: Number(e.target.value) })} /></div>
          <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "space-between" }}>
            <button className="studio-btn" onClick={() => save(r)}>Save</button>
            <button className="studio-btn-danger" onClick={() => remove(r.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
