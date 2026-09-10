#!/usr/bin/env node
/**
 * Blocks production builds that still contain filler copy.
 *
 * Placeholder content on a portfolio is not a cosmetic problem: an invented
 * testimonial or an unearned metric is a claim a recruiter can check, and one
 * that is very hard to walk back. Filler is fine while building; shipping it is
 * not. This runs as part of `npm run build`.
 *
 * Escape hatch: `npm run build:allow-placeholders` skips this deliberately.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SCAN_DIR = join(ROOT, "src");

const MARKERS = [/\[PLACEHOLDER/i, /\bplaceholder</, /\bLorem ipsum\b/i, /\[00\]/, /\[YEAR\]/];

const IGNORE_FILES = new Set(["types.ts"]);

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(entry) ? [full] : [];
  });
}

const hits = [];

for (const file of walk(SCAN_DIR)) {
  const base = file.split(/[\\/]/).pop() ?? "";
  if (IGNORE_FILES.has(base)) continue;

  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    if (MARKERS.some((m) => m.test(line))) {
      hits.push({ file: relative(ROOT, file), line: i + 1, text: line.trim().slice(0, 96) });
    }
  });
}

if (hits.length === 0) {
  console.log("✓ No placeholder content found.");
  process.exit(0);
}

const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const OFF = "\x1b[0m";

console.error(`\n${RED}✗ Build blocked: ${hits.length} placeholder(s) still present.${OFF}\n`);
for (const h of hits) {
  console.error(`  ${h.file}:${h.line}`);
  console.error(`  ${DIM}${h.text}${OFF}\n`);
}
console.error("Replace the copy, then flip placeholder(...) to real(...) in src/content/site.ts.");
console.error(`${DIM}To build anyway (not for production): npm run build:allow-placeholders${OFF}\n`);
process.exit(1);
