"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend } from "./helpers";
import { Flash } from "./Flash";

interface Row { id: number; label: string; value: string; detail: string; sort_order: number; }

export default function AchievementsEditor() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { setRows(await apiGet<Row[]>("/api/studio/achievements")); }
    catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add() {
    try { await apiSend("/api/studio/achievements", "POST", { label: "", value: "", detail: "" }); setOk("Added."); await load(); }
    catch (e: any) { setErr(e.message); }
  }
  async function save(r: Row) { try { await apiSend("/api/studio/achievements", "PUT", r); setOk("Saved."); } catch (e: any) { setErr(e.message); } }
  async function remove(id: number) {
    if (!confirm("Delete?")) return;
    try { await apiSend(`/api/studio/achievements?id=${id}`, "DELETE"); setOk("Deleted."); await load(); }
    catch (e: any) { setErr(e.message); }
  }
  function update(id: number, patch: Partial<Row>) {
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: 6 }}>Achievements</h2>
      <p style={{ color: "var(--lagoon-2)", marginBottom: 20 }}>Number-plus-label metrics. Only add ones you can defend.</p>
      <Flash ok={ok} err={err} onClear={() => { setOk(null); setErr(null); }} />
      <button className="studio-btn" onClick={add} style={{ marginBottom: 16 }}>+ Add achievement</button>

      {rows.map((r) => (
        <div key={r.id} className="studio-card" style={{ marginBottom: 12 }}>
          <div className="studio-row">
            <div><label>Value (number)</label><input value={r.value} onChange={(e) => update(r.id, { value: e.target.value })} /></div>
            <div><label>Label</label><input value={r.label} onChange={(e) => update(r.id, { label: e.target.value })} /></div>
          </div>
          <div style={{ height: 10 }} />
          <div><label>Detail</label><input value={r.detail} onChange={(e) => update(r.id, { detail: e.target.value })} /></div>
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
