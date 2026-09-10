"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend } from "./helpers";
import { Flash } from "./Flash";

type ClusterId = "languages" | "ai" | "web" | "tools" | "mobile" | "game";

interface Row {
  id: number; name: string; cluster: ClusterId; note: string; sort_order: number;
}

const CLUSTER_OPTIONS: { value: ClusterId; label: string }[] = [
  { value: "languages", label: "Languages" },
  { value: "ai", label: "AI & ML" },
  { value: "web", label: "Web" },
  { value: "tools", label: "Tools" },
  { value: "mobile", label: "Mobile" },
  { value: "game", label: "Game" },
];

export default function SkillsEditor() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { setRows(await apiGet<Row[]>("/api/studio/skills")); }
    catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add() {
    try { await apiSend("/api/studio/skills", "POST", { name: "New skill", cluster: "tools", note: "" }); setOk("Added."); await load(); }
    catch (e: any) { setErr(e.message); }
  }
  async function save(r: Row) {
    try { await apiSend("/api/studio/skills", "PUT", r); setOk("Saved."); }
    catch (e: any) { setErr(e.message); }
  }
  async function remove(id: number) {
    if (!confirm("Delete this skill?")) return;
    try { await apiSend(`/api/studio/skills?id=${id}`, "DELETE"); setOk("Deleted."); await load(); }
    catch (e: any) { setErr(e.message); }
  }
  function update(id: number, patch: Partial<Row>) {
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: 6 }}>Skills</h2>
      <p style={{ color: "var(--lagoon-2)", marginBottom: 20 }}>Grouped into 6 clusters: Languages, AI &amp; ML, Web, Tools, Mobile, Game. Toggle which clusters appear on the site in the &quot;Skill Clusters&quot; tab.</p>
      <Flash ok={ok} err={err} onClear={() => { setOk(null); setErr(null); }} />
      <button className="studio-btn" onClick={add} style={{ marginBottom: 16 }}>+ Add skill</button>

      {rows.map((r) => (
        <div key={r.id} className="studio-card" style={{ marginBottom: 12 }}>
          <div className="studio-row">
            <div><label>Name</label><input value={r.name} onChange={(e) => update(r.id, { name: e.target.value })} /></div>
            <div>
              <label>Cluster</label>
              <select value={r.cluster} onChange={(e) => update(r.id, { cluster: e.target.value as ClusterId })}>
                {CLUSTER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ height: 10 }} />
          <div><label>Note</label><input value={r.note} onChange={(e) => update(r.id, { note: e.target.value })} /></div>
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
