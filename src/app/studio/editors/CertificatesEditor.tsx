"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend, uploadFile } from "./helpers";
import { Flash } from "./Flash";

interface Row {
  id: number; title: string; issuer: string; file: string; year: string | null; sort_order: number;
}

export default function CertificatesEditor() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { setRows(await apiGet<Row[]>("/api/studio/certificates")); }
    catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add() {
    try { await apiSend("/api/studio/certificates", "POST", { title: "New certificate", issuer: "Issuer", file: "/pdf/…" }); setOk("Added."); await load(); }
    catch (e: any) { setErr(e.message); }
  }
  async function save(r: Row) {
    try { await apiSend("/api/studio/certificates", "PUT", r); setOk("Saved."); }
    catch (e: any) { setErr(e.message); }
  }
  async function remove(id: number) {
    if (!confirm("Delete this certificate?")) return;
    try { await apiSend(`/api/studio/certificates?id=${id}`, "DELETE"); setOk("Deleted."); await load(); }
    catch (e: any) { setErr(e.message); }
  }
  function update(id: number, patch: Partial<Row>) {
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  async function uploadFor(id: number, f: File) {
    try { const url = await uploadFile(f, "pdf"); update(id, { file: url }); setOk("Uploaded."); }
    catch (e: any) { setErr(e.message); }
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: 6 }}>Certificates</h2>
      <p style={{ color: "var(--lagoon-2)", marginBottom: 20 }}>Upload the PDF or link to an existing one.</p>
      <Flash ok={ok} err={err} onClear={() => { setOk(null); setErr(null); }} />
      <button className="studio-btn" onClick={add} style={{ marginBottom: 16 }}>+ Add certificate</button>

      {rows.map((r) => (
        <div key={r.id} className="studio-card" style={{ marginBottom: 12 }}>
          <div><label>Title</label><input value={r.title} onChange={(e) => update(r.id, { title: e.target.value })} /></div>
          <div style={{ height: 10 }} />
          <div className="studio-row">
            <div><label>Issuer</label><input value={r.issuer} onChange={(e) => update(r.id, { issuer: e.target.value })} /></div>
            <div><label>Year (optional)</label><input value={r.year || ""} onChange={(e) => update(r.id, { year: e.target.value })} /></div>
          </div>
          <div style={{ height: 10 }} />
          <div>
            <label>PDF file</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input value={r.file} onChange={(e) => update(r.id, { file: e.target.value })} placeholder="/pdf/…" />
              <label className="studio-btn studio-btn-ghost" style={{ margin: 0, textTransform: "none", letterSpacing: 0, fontSize: 13 }}>
                Upload
                <input type="file" accept="application/pdf" hidden onChange={(e) => e.target.files?.[0] && uploadFor(r.id, e.target.files[0])} />
              </label>
            </div>
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
