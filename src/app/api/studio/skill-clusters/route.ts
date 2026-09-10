import { NextResponse } from "next/server";
import { dbAll, dbBatch } from "@/lib/db";
import type { InValue } from "@libsql/client";

export const runtime = "nodejs";

const VALID = new Set(["languages", "ai", "web", "tools", "mobile", "game"]);

export async function GET() {
  return NextResponse.json(
    await dbAll(
      "SELECT id, label, visible, sort_order FROM skill_clusters ORDER BY sort_order, id"
    )
  );
}

export async function PUT(req: Request) {
  const body = await req.json();
  const rows = Array.isArray(body?.clusters) ? body.clusters : [];
  const stmts: Array<{ sql: string; args: InValue[] }> = [];
  for (const r of rows) {
    if (!VALID.has(String(r?.id))) continue;
    const label = String(r?.label ?? "").slice(0, 40) || String(r?.id);
    const visible = r?.visible ? 1 : 0;
    const order = Number.isFinite(Number(r?.sort_order)) ? Number(r?.sort_order) : 0;
    stmts.push({
      sql: "UPDATE skill_clusters SET label=?, visible=?, sort_order=? WHERE id=?",
      args: [label, visible, order, String(r.id)],
    });
  }
  if (stmts.length > 0) await dbBatch(stmts);
  return NextResponse.json({ ok: true });
}
