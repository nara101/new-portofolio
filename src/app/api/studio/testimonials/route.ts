import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    db()
      .prepare("SELECT id, quote, name, role, sort_order FROM testimonials ORDER BY sort_order, id")
      .all()
  );
}

export async function POST(req: Request) {
  const b = await req.json();
  const max = (db().prepare("SELECT COALESCE(MAX(sort_order), -1) as m FROM testimonials").get() as { m: number }).m;
  const info = db()
    .prepare("INSERT INTO testimonials (quote, name, role, sort_order) VALUES (?, ?, ?, ?)")
    .run(String(b.quote || ""), String(b.name || ""), String(b.role || ""), max + 1);
  return NextResponse.json({ id: info.lastInsertRowid });
}

export async function PUT(req: Request) {
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  db()
    .prepare("UPDATE testimonials SET quote=?, name=?, role=?, sort_order=? WHERE id=?")
    .run(String(b.quote || ""), String(b.name || ""), String(b.role || ""), Number(b.sort_order ?? 0), Number(b.id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  db().prepare("DELETE FROM testimonials WHERE id=?").run(Number(id));
  return NextResponse.json({ ok: true });
}
