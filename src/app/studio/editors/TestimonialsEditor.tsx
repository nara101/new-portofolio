"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend } from "./helpers";
import { Flash } from "./Flash";

interface Row { id: number; quote: string; name: string; role: string; sort_order: number; }

export default function TestimonialsEditor() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { setRows(await apiGet<Row[]>("/api/studio/testimonials")); }
    catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add() {
    try { await apiSend("/api/studio/testimonials", "POST", { quote: "", name: "", role: "" }); setOk("Added."); await load(); }
    catch (e: any) { setErr(e.message); }
  }
  async function save(r: Row) { try { await apiSend("/api/studio/testimonials", "PUT", r); setOk("Saved."); } catch (e: any) { setErr(e.message); } }
  async function remove(id: number) {
    if (!confirm("Delete?")) return;
    try { await apiSend(`/api/studio/testimonials?id=${id}`, "DELETE"); setOk("Deleted."); await load(); }
    catch (e: any) { setErr(e.message); }
  }
  function update(id: number, patch: Partial<Row>) {
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: 6 }}>Testimonials</h2>
      <p style={{ color: "var(--lagoon-2)", marginBottom: 20 }}>Quotes from people you have worked with. Section hides on the site when this list is empty.</p>
      <Flash ok={ok} err={err} onClear={() => { setOk(null); setErr(null); }} />
      <button className="studio-btn" onClick={add} style={{ marginBottom: 16 }}>+ Add testimonial</button>

      {rows.map((r) => (
        <div key={r.id} className="studio-card" style={{ marginBottom: 12 }}>
          <div><label>Quote</label><textarea value={r.quote} onChange={(e) => update(r.id, { quote: e.target.value })} /></div>
          <div style={{ height: 10 }} />
          <div className="studio-row">
            <div><label>Name</label><input value={r.name} onChange={(e) => update(r.id, { name: e.target.value })} /></div>
            <div><label>Role / Company</label><input value={r.role} onChange={(e) => update(r.id, { role: e.target.value })} /></div>
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
