import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

function toStack(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

export async function GET() {
  const rows = db()
    .prepare(
      `SELECT id, slug, name, tagline, description, live_url, repo_url, stack_json,
              screenshot, challenge, solution, sort_order
         FROM projects ORDER BY sort_order, id`
    )
    .all() as any[];
  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      tagline: r.tagline,
      description: r.description,
      liveUrl: r.live_url,
      repoUrl: r.repo_url,
      stack: JSON.parse(r.stack_json),
      screenshot: r.screenshot,
      challenge: r.challenge,
      solution: r.solution,
      sort_order: r.sort_order,
    }))
  );
}

export async function POST(req: Request) {
  const b = await req.json();
  const max = (db().prepare("SELECT COALESCE(MAX(sort_order), -1) as m FROM projects").get() as { m: number }).m;
  const info = db()
    .prepare(
      `INSERT INTO projects (slug, name, tagline, description, live_url, repo_url, stack_json,
                             screenshot, challenge, solution, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
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
      max + 1
    );
  return NextResponse.json({ id: info.lastInsertRowid });
}

export async function PUT(req: Request) {
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  db()
    .prepare(
      `UPDATE projects SET slug=?, name=?, tagline=?, description=?, live_url=?, repo_url=?,
                          stack_json=?, screenshot=?, challenge=?, solution=?, sort_order=?
        WHERE id=?`
    )
    .run(
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
      Number(b.id)
    );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  db().prepare("DELETE FROM projects WHERE id=?").run(Number(id));
  return NextResponse.json({ ok: true });
}
