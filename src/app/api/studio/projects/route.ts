import { NextResponse } from "next/server";
import { dbAll, dbGet, dbRun } from "@/lib/db";

export const runtime = "nodejs";

function toStack(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

export async function GET() {
  const rows = await dbAll<Record<string, unknown>>(
    `SELECT id, slug, name, tagline, description, live_url, repo_url, stack_json,
            screenshot, challenge, solution, sort_order
       FROM projects ORDER BY sort_order, id`
  );
  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      tagline: r.tagline,
      description: r.description,
      liveUrl: r.live_url,
      repoUrl: r.repo_url,
      stack: JSON.parse(r.stack_json as string),
      screenshot: r.screenshot,
      challenge: r.challenge,
      solution: r.solution,
      sort_order: r.sort_order,
    }))
  );
}

export async function POST(req: Request) {
  const b = await req.json();
  const max = await dbGet<{ m: number }>(
    "SELECT COALESCE(MAX(sort_order), -1) as m FROM projects"
  );
  const info = await dbRun(
    `INSERT INTO projects (slug, name, tagline, description, live_url, repo_url, stack_json,
                           screenshot, challenge, solution, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      String(b.slug || `project-${Date.now()}`),
      String(b.name || ""),
      String(b.tagline || ""),
      String(b.description || ""),
      b.liveUrl ? String(b.liveUrl) : null,
      b.repoUrl ? String(b.repoUrl) : null,
      JSON.stringify(toStack(b.stack)),
      b.screenshot ? String(b.screenshot) : null,
      b.challenge ? String(b.challenge) : null,
      b.solution ? String(b.solution) : null,
      (max?.m ?? -1) + 1,
    ]
  );
  return NextResponse.json({ id: Number(info.lastInsertRowid) });
}

export async function PUT(req: Request) {
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await dbRun(
    `UPDATE projects SET slug=?, name=?, tagline=?, description=?, live_url=?, repo_url=?,
                        stack_json=?, screenshot=?, challenge=?, solution=?, sort_order=?
      WHERE id=?`,
    [
      String(b.slug || ""),
      String(b.name || ""),
      String(b.tagline || ""),
      String(b.description || ""),
      b.liveUrl ? String(b.liveUrl) : null,
      b.repoUrl ? String(b.repoUrl) : null,
      JSON.stringify(toStack(b.stack)),
      b.screenshot ? String(b.screenshot) : null,
      b.challenge ? String(b.challenge) : null,
      b.solution ? String(b.solution) : null,
      Number(b.sort_order ?? 0),
      Number(b.id),
    ]
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await dbRun("DELETE FROM projects WHERE id=?", [Number(id)]);
  return NextResponse.json({ ok: true });
}
