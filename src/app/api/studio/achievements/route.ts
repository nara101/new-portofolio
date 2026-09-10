import { NextResponse } from "next/server";
import { dbAll, dbGet, dbRun } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    await dbAll(
      "SELECT id, label, value, detail, sort_order FROM achievements ORDER BY sort_order, id"
    )
  );
}

export async function POST(req: Request) {
  const b = await req.json();
  const max = await dbGet<{ m: number }>(
    "SELECT COALESCE(MAX(sort_order), -1) as m FROM achievements"
  );
  const info = await dbRun(
    "INSERT INTO achievements (label, value, detail, sort_order) VALUES (?, ?, ?, ?)",
    [String(b.label || ""), String(b.value || ""), String(b.detail || ""), (max?.m ?? -1) + 1]
  );
  return NextResponse.json({ id: Number(info.lastInsertRowid) });
}

export async function PUT(req: Request) {
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await dbRun(
    "UPDATE achievements SET label=?, value=?, detail=?, sort_order=? WHERE id=?",
    [String(b.label || ""), String(b.value || ""), String(b.detail || ""), Number(b.sort_order ?? 0), Number(b.id)]
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await dbRun("DELETE FROM achievements WHERE id=?", [Number(id)]);
  return NextResponse.json({ ok: true });
}
