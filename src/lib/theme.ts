import type { Theme } from "./content";

interface RGB { r: number; g: number; b: number; }

function fromHex(hex: string): RGB {
  const m = hex.replace("#", "");
  return {
    r: parseInt(m.slice(0, 2), 16),
    g: parseInt(m.slice(2, 4), 16),
    b: parseInt(m.slice(4, 6), 16),
  };
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return {
    r: Math.round(a.r * (1 - t) + b.r * t),
    g: Math.round(a.g * (1 - t) + b.g * t),
    b: Math.round(a.b * (1 - t) + b.b * t),
  };
}

function triplet(c: RGB): string {
  return `${c.r} ${c.g} ${c.b}`;
}

const WHITE: RGB = { r: 255, g: 255, b: 255 };
const BLACK: RGB = { r: 0, g: 0, b: 0 };

/** Derives a 10-shade scale centered on the anchor (light 50 → dark 900). */
function accentScale(anchor: RGB): Record<string, RGB> {
  return {
    "50":  mix(anchor, WHITE, 0.92),
    "100": mix(anchor, WHITE, 0.80),
    "200": mix(anchor, WHITE, 0.62),
    "300": mix(anchor, WHITE, 0.36),
    "400": anchor,
    "500": mix(anchor, BLACK, 0.12),
    "600": mix(anchor, BLACK, 0.28),
    "700": mix(anchor, BLACK, 0.44),
    "800": mix(anchor, BLACK, 0.60),
    "900": mix(anchor, BLACK, 0.75),
  };
}

/** Derives an "ink" scale — dark anchor at 900, light at 50 (like Tailwind's slate/gray). */
function inkScale(anchor: RGB): Record<string, RGB> {
  return {
    "50":  mix(anchor, WHITE, 0.90),
    "100": mix(anchor, WHITE, 0.78),
    "200": mix(anchor, WHITE, 0.62),
    "300": mix(anchor, WHITE, 0.44),
    "400": mix(anchor, WHITE, 0.24),
    "500": mix(anchor, WHITE, 0.10),
    "600": anchor,
    "700": mix(anchor, BLACK, 0.20),
    "800": mix(anchor, BLACK, 0.40),
    "900": mix(anchor, BLACK, 0.55),
    "950": mix(anchor, BLACK, 0.70),
  };
}

/**
 * Some scales are used as PRIMARY TEXT on cream, so scale entry 50 must be the
 * DARKEST (matching the current inverted lavender scale the codebase uses).
 */
function invertedInkScale(anchor: RGB): Record<string, RGB> {
  return {
    "50":  anchor,
    "100": mix(anchor, WHITE, 0.14),
    "200": mix(anchor, WHITE, 0.28),
    "300": mix(anchor, WHITE, 0.44),
    "400": mix(anchor, WHITE, 0.58),
    "500": mix(anchor, WHITE, 0.70),
    "600": mix(anchor, WHITE, 0.78),
    "700": mix(anchor, WHITE, 0.85),
    "800": mix(anchor, WHITE, 0.92),
    "900": mix(anchor, WHITE, 0.96),
  };
}

/**
 * Cream: bg anchor sits at 200 (the actual body colour), lighter tints above,
 * warmer/deeper tints below.
 */
function creamScale(anchor: RGB): Record<string, RGB> {
  return {
    "50":  mix(anchor, WHITE, 0.55),
    "100": mix(anchor, WHITE, 0.25),
    "200": anchor,
    "300": mix(anchor, BLACK, 0.08),
    "400": mix(anchor, BLACK, 0.20),
  };
}

/** All CSS variables the site needs, computed from a Theme record. */
export function themeCssVars(theme: Theme): Record<string, string> {
  const bg = fromHex(theme.colorBg);
  const text = fromHex(theme.colorText);
  const ink = fromHex(theme.colorInkDark);
  const accent = fromHex(theme.colorAccent);
  const soft = fromHex(theme.colorAccentSoft);
  const nature = fromHex(theme.colorAccentNature);
  const sky = fromHex(theme.colorAccentSky);

  const vars: Record<string, string> = {};
  const emit = (prefix: string, scale: Record<string, RGB>) => {
    for (const [k, v] of Object.entries(scale)) {
      vars[`--tw-${prefix}-${k}`] = triplet(v);
    }
  };

  emit("cream", creamScale(bg));
  emit("lagoon", invertedInkScale(text));
  emit("lavender", invertedInkScale(text));   // legacy alias — used as text
  emit("navy", inkScale(ink));                 // dark accents / button text bg
  emit("rosewood", accentScale(accent));
  emit("violet", accentScale(accent));         // legacy alias
  emit("blush", accentScale(soft));
  emit("pink", accentScale(soft));             // legacy alias
  emit("plum", accentScale(soft));             // legacy alias
  emit("sage", accentScale(nature));
  emit("sky", accentScale(sky));
  emit("cornflower", accentScale(sky));        // legacy alias

  vars["--bg-deep"] = triplet(bg);
  vars["--fg"] = triplet(text);
  vars["--fg-muted"] = triplet(fromHex(theme.colorTextMuted));
  vars["--edge"] = triplet(text);

  vars["--theme-accent"] = triplet(accent);
  vars["--theme-accent-soft"] = triplet(soft);
  vars["--theme-accent-nature"] = triplet(nature);
  vars["--theme-accent-sky"] = triplet(sky);

  return vars;
}

/** Serialised to inject into a <style> tag. */
export function themeStyleString(theme: Theme): string {
  const vars = themeCssVars(theme);
  const bodyDecl = Object.entries(vars)
    .map(([k, v]) => `${k}:${v};`)
    .join("");

  const fontDisplay = escapeFont(theme.fontDisplay);
  const fontBody = escapeFont(theme.fontBody);
  const fontMono = escapeFont(theme.fontMono);

  return `:root{${bodyDecl}--font-display:"${fontDisplay}",ui-sans-serif,system-ui,sans-serif;--font-body:"${fontBody}",ui-sans-serif,system-ui,sans-serif;--font-mono:"${fontMono}",ui-monospace,monospace;}`;
}

function escapeFont(s: string): string {
  return String(s).replace(/["\\]/g, "");
}

/**
 * The Google Fonts CSS href covering all three families the user picked, or null
 * if none of them are Google-provided.
 */
export function googleFontsHref(theme: Theme): string {
  const families = [
    `${theme.fontDisplay.replace(/ /g, "+")}:wght@400;500;600;700;800`,
    `${theme.fontBody.replace(/ /g, "+")}:wght@400;500;600;700`,
    `${theme.fontMono.replace(/ /g, "+")}:wght@400;500`,
  ];
  return `https://fonts.googleapis.com/css2?${families
    .map((f) => `family=${f}`)
    .join("&")}&display=swap`;
}
