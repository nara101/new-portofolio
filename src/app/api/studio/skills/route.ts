import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const CLUSTERS = ["languages", "ai", "web", "tools", "mobile", "game"] as const;
function cluster(v: unknown): string {
  return CLUSTERS.includes(v as any) ? (v as string) : "tools";
}

export async function GET() {
  return NextResponse.json(
    db()
      .prepare(
        "SELECT id, name, cluster, note, sort_order FROM skills ORDER BY sort_order, id"
      )
      .all()
  );
}

export async function POST(req: Request) {
  const b = await req.json();
  const max = (db().prepare("SELECT COALESCE(MAX(sort_order), -1) as m FROM skills").get() as { m: number }).m;
  const info = db()
    .prepare("INSERT INTO skills (name, cluster, note, sort_order) VALUES (?, ?, ?, ?)")
    .run(String(b.name || ""), cluster(b.cluster), String(b.note || ""), max + 1);
  return NextResponse.json({ id: info.lastInsertRowid });
}

export async function PUT(req: Request) {
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  db()
    .prepare("UPDATE skills SET name=?, cluster=?, note=?, sort_order=? WHERE id=?")
    .run(String(b.name || ""), cluster(b.cluster), String(b.note || ""), Number(b.sort_order ?? 0), Number(b.id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  db().prepare("DELETE FROM skills WHERE id=?").run(Number(id));
  return NextResponse.json({ ok: true });
}
