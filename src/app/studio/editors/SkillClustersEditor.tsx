"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend } from "./helpers";
import { Flash } from "./Flash";

interface Row {
  id: "languages" | "ai" | "web" | "tools" | "mobile" | "game";
  label: string;
  visible: 0 | 1 | boolean;
  sort_order: number;
}

export default function SkillClustersEditor() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setRows(await apiGet<Row[]>("/api/studio/skill-clusters"));
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  function update(id: Row["id"], patch: Partial<Row>) {
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function saveAll() {
    try {
      await apiSend("/api/studio/skill-clusters", "PUT", {
        clusters: rows.map((r) => ({
          id: r.id,
          label: r.label,
          visible: !!r.visible,
          sort_order: r.sort_order,
        })),
      });
      setOk("Saved.");
    } catch (e: any) {
      setErr(e.message);
    }
  }

  if (loading) return <p>Loading…</p>;

  const visibleCount = rows.filter((r) => !!r.visible).length;

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: 6 }}>Skill Clusters</h2>
      <p style={{ color: "var(--lagoon-2)", marginBottom: 20 }}>
        Choose which clusters appear on the site&apos;s constellation. Turn
        clusters OFF when applying for a specific role (e.g. hide Game & Mobile
        when applying as a Web Developer). Also rename the visible label here.
      </p>
      <Flash ok={ok} err={err} onClear={() => { setOk(null); setErr(null); }} />

      <div style={{ marginBottom: 16, color: "var(--lagoon-2)", fontSize: 13 }}>
        {visibleCount} of {rows.length} clusters visible on the site.
      </div>

      {rows.map((r) => (
        <div key={r.id} className="studio-card" style={{ marginBottom: 12 }}>
          <div className="studio-row" style={{ alignItems: "center" }}>
            <div>
              <label>Cluster</label>
              <input value={r.id} disabled />
            </div>
            <div>
              <label>Display label</label>
              <input
                value={r.label}
                onChange={(e) => update(r.id, { label: e.target.value })}
              />
            </div>
          </div>
          <div style={{ height: 10 }} />
          <div className="studio-row" style={{ alignItems: "center" }}>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={!!r.visible}
                  onChange={(e) => update(r.id, { visible: e.target.checked })}
                />
                Visible on site
              </label>
            </div>
            <div>
              <label>Sort order</label>
              <input
                type="number"
                value={r.sort_order}
                onChange={(e) =>
                  update(r.id, { sort_order: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </div>
      ))}

      <button className="studio-btn" onClick={saveAll} style={{ marginTop: 8 }}>
        Save all
      </button>
    </div>
  );
}
