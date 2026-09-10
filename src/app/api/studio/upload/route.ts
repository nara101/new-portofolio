import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";

export const runtime = "nodejs";

const KINDS: Record<string, { dir: string; allowed: string[] }> = {
  image: { dir: "public/images", allowed: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"] },
  pdf: { dir: "public/pdf", allowed: [".pdf"] },
};

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") || "image");
  const cfg = KINDS[kind];
  if (!cfg) return NextResponse.json({ error: "invalid kind" }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "file required" }, { status: 400 });

  const ext = path.extname(file.name).toLowerCase();
  if (!cfg.allowed.includes(ext)) {
    return NextResponse.json({ error: `extension ${ext} not allowed` }, { status: 400 });
  }

  const dir = path.join(process.cwd(), cfg.dir);
  await fs.mkdir(dir, { recursive: true });
  const base = safeName(path.basename(file.name, ext));
  const filename = `${base}-${Date.now()}${ext}`;
  const dest = path.join(dir, filename);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(dest, buf);

  const publicPath = `/${cfg.dir.replace(/^public\//, "")}/${filename}`;
  return NextResponse.json({ url: publicPath });
}
