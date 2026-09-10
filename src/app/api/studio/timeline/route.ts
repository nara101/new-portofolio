import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const KINDS = ["education", "experience", "organization", "other"] as const;
function kind(v: unknown): string {
  return (KINDS as readonly string[]).includes(String(v)) ? String(v) : "education";
}

export async function GET() {
  return NextResponse.json(
    db()
      .prepare(
        "SELECT id, period, title, detail, kind, sort_order FROM timeline ORDER BY sort_order, id"
      )
      .all()
  );
}

export async function POST(req: Request) {
  const b = await req.json();
  const max = (db().prepare("SELECT COALESCE(MAX(sort_order), -1) as m FROM timeline").get() as { m: number }).m;
  const info = db()
    .prepare(
      "INSERT INTO timeline (period, title, detail, kind, sort_order) VALUES (?, ?, ?, ?, ?)"
    )
    .run(
      String(b.period || ""),
      String(b.title || ""),
      b.detail ? String(b.detail) : null,
      kind(b.kind),
      max + 1
    );
  return NextResponse.json({ id: info.lastInsertRowid });
}

export async function PUT(req: Request) {
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  db()
    .prepare(
      "UPDATE timeline SET period=?, title=?, detail=?, kind=?, sort_order=? WHERE id=?"
    )
    .run(
      String(b.period || ""),
      String(b.title || ""),
      b.detail ? String(b.detail) : null,
      kind(b.kind),
      Number(b.sort_order ?? 0),
      Number(b.id)
    );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  db().prepare("DELETE FROM timeline WHERE id=?").run(Number(id));
  return NextResponse.json({ ok: true });
}
