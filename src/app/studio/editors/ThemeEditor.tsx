"use client";

import { useEffect, useState } from "react";
import { apiGet, apiSend } from "./helpers";
import { Flash } from "./Flash";

interface Theme {
  colorBg: string;
  colorText: string;
  colorTextMuted: string;
  colorAccent: string;
  colorAccentSoft: string;
  colorAccentNature: string;
  colorAccentSky: string;
  colorInkDark: string;
  fontDisplay: string;
  fontBody: string;
  fontMono: string;
}

const DEFAULT: Theme = {
  colorBg: "#FFF7E6",
  colorText: "#2D3A47",
  colorTextMuted: "#4A5B6D",
  colorAccent: "#B46A72",
  colorAccentSoft: "#F7C8D3",
  colorAccentNature: "#A8B58A",
  colorAccentSky: "#A9B7C6",
  colorInkDark: "#141B22",
  fontDisplay: "Plus Jakarta Sans",
  fontBody: "Inter",
  fontMono: "JetBrains Mono",
};

const PRESETS: { name: string; theme: Partial<Theme> }[] = [
  {
    name: "Vanilla Cream (default)",
    theme: {
      colorBg: "#FFF7E6", colorText: "#2D3A47", colorTextMuted: "#4A5B6D",
      colorAccent: "#B46A72", colorAccentSoft: "#F7C8D3",
      colorAccentNature: "#A8B58A", colorAccentSky: "#A9B7C6",
      colorInkDark: "#141B22",
    },
  },
  {
    name: "Midnight Studio",
    theme: {
      colorBg: "#0F1420", colorText: "#EDEEF2", colorTextMuted: "#A0A7B8",
      colorAccent: "#7D89D8", colorAccentSoft: "#F5B3C4",
      colorAccentNature: "#8ABF9A", colorAccentSky: "#BFAEDC",
      colorInkDark: "#050710",
    },
  },
  {
    name: "Warm Sand",
    theme: {
      colorBg: "#FBF3E4", colorText: "#3A2F1A", colorTextMuted: "#6B5C3F",
      colorAccent: "#C97B4A", colorAccentSoft: "#F5D4A5",
      colorAccentNature: "#B8B078", colorAccentSky: "#D2C29A",
      colorInkDark: "#1F1808",
    },
  },
  {
    name: "Sea Salt",
    theme: {
      colorBg: "#F0F7F5", colorText: "#1E3A38", colorTextMuted: "#4A6866",
      colorAccent: "#3E8378", colorAccentSoft: "#BEE3DC",
      colorAccentNature: "#A8CFB5", colorAccentSky: "#9BC1CF",
      colorInkDark: "#0A1F1D",
    },
  },
  {
    name: "Rose Noir",
    theme: {
      colorBg: "#FFF0F3", colorText: "#3A1420", colorTextMuted: "#6E3348",
      colorAccent: "#9E2A48", colorAccentSoft: "#F5C4CE",
      colorAccentNature: "#C08A9C", colorAccentSky: "#D5B3B9",
      colorInkDark: "#1F0810",
    },
  },
];

const FONT_OPTIONS = [
  "Plus Jakarta Sans", "Inter", "Poppins", "Manrope", "Nunito",
  "Playfair Display", "Merriweather", "Lora", "Cormorant Garamond",
  "Space Grotesk", "DM Sans", "Work Sans", "Outfit", "Sora",
  "JetBrains Mono", "Fira Code", "IBM Plex Mono", "Space Mono",
  "Bricolage Grotesque", "Instrument Serif",
];

function ColorField({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  help?: string;
}) {
  return (
    <div>
      <label>{label}</label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 50, height: 42, padding: 2, cursor: "pointer" }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#RRGGBB"
          style={{ fontFamily: "monospace" }}
        />
      </div>
      {help && <p style={{ fontSize: 11, color: "var(--lagoon-2)", marginTop: 4 }}>{help}</p>}
    </div>
  );
}

function FontField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label>{label}</label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select value={FONT_OPTIONS.includes(value) ? value : ""} onChange={(e) => e.target.value && onChange(e.target.value)}>
          <option value="">— pick a preset —</option>
          {FONT_OPTIONS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or type a Google Font name"
        style={{ marginTop: 6 }}
      />
      <p style={{ fontSize: 11, color: "var(--lagoon-2)", marginTop: 4 }}>
        Preview: <span style={{ fontFamily: `'${value}', sans-serif`, fontSize: 15 }}>The quick brown fox</span>
      </p>
    </div>
  );
}

export default function ThemeEditor() {
  const [data, setData] = useState<Theme>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Theme>("/api/studio/theme")
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setErr(e.message); setLoading(false); });
  }, []);

  function on<K extends keyof Theme>(k: K, v: Theme[K]) {
    setData((d) => ({ ...d, [k]: v }));
  }

  function applyPreset(patch: Partial<Theme>) {
    setData((d) => ({ ...d, ...patch }));
  }

  async function save() {
    setSaving(true); setOk(null); setErr(null);
    try {
      await apiSend("/api/studio/theme", "PUT", data);
      setOk("Theme saved. Reload the page to see the new colours and fonts everywhere.");
      // Force a refresh so the studio itself re-renders with the new theme
      setTimeout(() => window.location.reload(), 900);
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: 6 }}>Theme</h2>
      <p style={{ color: "var(--lagoon-2)", marginBottom: 20 }}>
        Change the site&apos;s colours and fonts. Applies to both the public site and this dashboard.
      </p>
      <Flash ok={ok} err={err} onClear={() => { setOk(null); setErr(null); }} />

      <div className="studio-card" style={{ marginBottom: 20 }}>
        <label>Quick presets</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p.theme)}
              className="studio-btn studio-btn-ghost"
              style={{ fontSize: 12, padding: "6px 12px", textTransform: "none", letterSpacing: 0 }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="studio-card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, marginBottom: 14 }}>Colours</h3>
        <div className="studio-row">
          <ColorField label="Background" value={data.colorBg} onChange={(v) => on("colorBg", v)} help="Page background (e.g. cream)" />
          <ColorField label="Text" value={data.colorText} onChange={(v) => on("colorText", v)} help="Primary body text" />
        </div>
        <div style={{ height: 12 }} />
        <div className="studio-row">
          <ColorField label="Text muted" value={data.colorTextMuted} onChange={(v) => on("colorTextMuted", v)} help="Secondary text / captions" />
          <ColorField label="Ink dark" value={data.colorInkDark} onChange={(v) => on("colorInkDark", v)} help="Darkest surface (deep shadows, dark chips)" />
        </div>
        <div style={{ height: 12 }} />
        <div className="studio-row">
          <ColorField label="Accent — primary" value={data.colorAccent} onChange={(v) => on("colorAccent", v)} help="Main highlight (buttons, focus)" />
          <ColorField label="Accent — soft" value={data.colorAccentSoft} onChange={(v) => on("colorAccentSoft", v)} help="Soft pink / blush tint" />
        </div>
        <div style={{ height: 12 }} />
        <div className="studio-row">
          <ColorField label="Accent — nature" value={data.colorAccentNature} onChange={(v) => on("colorAccentNature", v)} help="Green / earth tint" />
          <ColorField label="Accent — sky" value={data.colorAccentSky} onChange={(v) => on("colorAccentSky", v)} help="Blue-grey tint" />
        </div>

        <div style={{ marginTop: 16, padding: 14, border: "1px dashed var(--border-strong)", borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: "var(--lagoon-2)", marginBottom: 8 }}>Live preview</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[
              ["Bg", data.colorBg], ["Text", data.colorText], ["Muted", data.colorTextMuted],
              ["Accent", data.colorAccent], ["Soft", data.colorAccentSoft],
              ["Nature", data.colorAccentNature], ["Sky", data.colorAccentSky],
              ["Ink", data.colorInkDark],
            ].map(([name, color]) => (
              <div key={name} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 10px", borderRadius: 8, background: "rgba(0,0,0,0.03)",
              }}>
                <span style={{ width: 18, height: 18, borderRadius: 4, background: color, border: "1px solid rgba(0,0,0,0.15)" }} />
                <span style={{ fontSize: 12 }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="studio-card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, marginBottom: 14 }}>Fonts</h3>
        <p style={{ fontSize: 12, color: "var(--lagoon-2)", marginBottom: 14 }}>
          Any <a href="https://fonts.google.com" target="_blank" rel="noreferrer" style={{ color: "var(--rosewood)", textDecoration: "underline" }}>Google Font</a> name works. Use exactly as spelled on Google Fonts.
        </p>
        <div style={{ display: "grid", gap: 16 }}>
          <FontField label="Display font (headings)" value={data.fontDisplay} onChange={(v) => on("fontDisplay", v)} />
          <FontField label="Body font (paragraphs, UI)" value={data.fontBody} onChange={(v) => on("fontBody", v)} />
          <FontField label="Mono font (code, tags)" value={data.fontMono} onChange={(v) => on("fontMono", v)} />
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button className="studio-btn" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save theme"}
        </button>
      </div>
    </div>
  );
}
