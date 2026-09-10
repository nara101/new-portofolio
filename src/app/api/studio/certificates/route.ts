import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    db()
      .prepare(
        "SELECT id, title, issuer, file, year, sort_order FROM certificates ORDER BY sort_order, id"
      )
      .all()
  );
}

export async function POST(req: Request) {
  const b = await req.json();
  const max = (db().prepare("SELECT COALESCE(MAX(sort_order), -1) as m FROM certificates").get() as { m: number }).m;
  const info = db()
    .prepare(
      "INSERT INTO certificates (title, issuer, file, year, sort_order) VALUES (?, ?, ?, ?, ?)"
    )
    .run(
      String(b.title || ""),
      String(b.issuer || ""),
      String(b.file || ""),
      b.year ? String(b.year) : null,
      max + 1
    );
  return NextResponse.json({ id: info.lastInsertRowid });
}

export async function PUT(req: Request) {
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  db()
    .prepare(
      "UPDATE certificates SET title=?, issuer=?, file=?, year=?, sort_order=? WHERE id=?"
    )
    .run(
      String(b.title || ""),
      String(b.issuer || ""),
      String(b.file || ""),
      b.year ? String(b.year) : null,
      Number(b.sort_order ?? 0),
      Number(b.id)
    );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  db().prepare("DELETE FROM certificates WHERE id=?").run(Number(id));
  return NextResponse.json({ ok: true });
}
