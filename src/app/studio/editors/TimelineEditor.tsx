"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend } from "./helpers";
import { Flash } from "./Flash";

interface Row {
  id: number;
  period: string;
  title: string;
  detail: string | null;
  kind: "education" | "experience" | "organization" | "other";
  sort_order: number;
}

export default function TimelineEditor() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { setRows(await apiGet<Row[]>("/api/studio/timeline")); }
    catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add() {
    try {
      await apiSend("/api/studio/timeline", "POST", {
        period: "New period", title: "New entry", kind: "education",
      });
      setOk("Added.");
      await load();
    } catch (e: any) { setErr(e.message); }
  }

  async function save(r: Row) {
    try { await apiSend("/api/studio/timeline", "PUT", r); setOk("Saved."); }
    catch (e: any) { setErr(e.message); }
  }

  async function remove(id: number) {
    if (!confirm("Delete this entry?")) return;
    try { await apiSend(`/api/studio/timeline?id=${id}`, "DELETE"); setOk("Deleted."); await load(); }
    catch (e: any) { setErr(e.message); }
  }

  function update(id: number, patch: Partial<Row>) {
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: 6 }}>Timeline</h2>
      <p style={{ color: "var(--lagoon-2)", marginBottom: 20 }}>Four kinds: Education, Work Experience, Organization & Volunteering, and Other — each renders as its own section on the site. Reorder with sort number (lower = first).</p>
      <Flash ok={ok} err={err} onClear={() => { setOk(null); setErr(null); }} />

      <button className="studio-btn" onClick={add} style={{ marginBottom: 16 }}>+ Add entry</button>

      {rows.map((r) => (
        <div key={r.id} className="studio-card" style={{ marginBottom: 12 }}>
          <div className="studio-row">
            <div><label>Period</label><input value={r.period} onChange={(e) => update(r.id, { period: e.target.value })} /></div>
            <div>
              <label>Kind</label>
              <select value={r.kind} onChange={(e) => update(r.id, { kind: e.target.value as any })}>
                <option value="education">Education</option>
                <option value="experience">Work Experience</option>
                <option value="organization">Organization & Volunteering</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div style={{ height: 10 }} />
          <div><label>Title</label><input value={r.title} onChange={(e) => update(r.id, { title: e.target.value })} /></div>
          <div style={{ height: 10 }} />
          <div className="studio-row">
            <div><label>Detail (optional)</label><input value={r.detail || ""} onChange={(e) => update(r.id, { detail: e.target.value })} /></div>
            <div><label>Sort order</label><input type="number" value={r.sort_order} onChange={(e) => update(r.id, { sort_order: Number(e.target.value) })} /></div>
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "space-between" }}>
            <button className="studio-btn" onClick={() => save(r)}>Save</button>
            <button className="studio-btn-danger" onClick={() => remove(r.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
