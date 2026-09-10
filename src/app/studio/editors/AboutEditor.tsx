"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend } from "./helpers";
import { Flash } from "./Flash";

interface About { lede: string; body: string[]; }

export default function AboutEditor() {
  const [data, setData] = useState<About>({ lede: "", body: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiGet<About>("/api/studio/about")
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setErr(e.message); setLoading(false); });
  }, []);

  async function save() {
    setSaving(true); setOk(null); setErr(null);
    try {
      await apiSend("/api/studio/about", "PUT", data);
      setOk("About saved.");
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  }

  function updateParagraph(i: number, val: string) {
    const body = [...data.body];
    body[i] = val;
    setData({ ...data, body });
  }
  function addParagraph() { setData({ ...data, body: [...data.body, ""] }); }
  function removeParagraph(i: number) {
    setData({ ...data, body: data.body.filter((_, idx) => idx !== i) });
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: 6 }}>About</h2>
      <p style={{ color: "var(--lagoon-2)", marginBottom: 20 }}>Your intro paragraph and body text.</p>
      <Flash ok={ok} err={err} onClear={() => { setOk(null); setErr(null); }} />

      <div className="studio-card">
        <label>Lede (opening line)</label>
        <textarea value={data.lede} onChange={(e) => setData({ ...data, lede: e.target.value })} />

        <div style={{ marginTop: 18 }}>
          <label>Body paragraphs</label>
          {data.body.map((p, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <textarea value={p} onChange={(e) => updateParagraph(i, e.target.value)} />
              <button className="studio-btn-danger" onClick={() => removeParagraph(i)} style={{ marginTop: 6 }}>
                Remove
              </button>
            </div>
          ))}
          <button className="studio-btn studio-btn-ghost" onClick={addParagraph} style={{ fontSize: 13 }}>+ Add paragraph</button>
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
