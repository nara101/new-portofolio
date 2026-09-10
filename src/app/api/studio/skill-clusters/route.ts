import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const VALID = new Set(["languages", "ai", "web", "tools", "mobile", "game"]);

export async function GET() {
  return NextResponse.json(
    db()
      .prepare(
        "SELECT id, label, visible, sort_order FROM skill_clusters ORDER BY sort_order, id"
      )
      .all()
  );
}

// Bulk update of cluster metadata. Sent as { clusters: [{id,label,visible,sort_order}, ...] }.
// Rows are matched by id; unknown ids are ignored so the endpoint can't be used
// to add arbitrary rows outside the fixed 6-cluster set.
export async function PUT(req: Request) {
  const body = await req.json();
  const rows = Array.isArray(body?.clusters) ? body.clusters : [];
  const stmt = db().prepare(
    "UPDATE skill_clusters SET label=?, visible=?, sort_order=? WHERE id=?"
  );
  const tx = db().transaction((list: any[]) => {
    for (const r of list) {
      if (!VALID.has(String(r?.id))) continue;
      const label = String(r?.label ?? "").slice(0, 40) || String(r?.id);
      const visible = r?.visible ? 1 : 0;
      const order = Number.isFinite(Number(r?.sort_order)) ? Number(r?.sort_order) : 0;
      stmt.run(label, visible, order, String(r.id));
    }
  });
  tx(rows);
  return NextResponse.json({ ok: true });
}
