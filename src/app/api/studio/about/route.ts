import { NextResponse } from "next/server";
import { dbRun } from "@/lib/db";
import { getAbout } from "@/lib/content";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(await getAbout());
}

export async function PUT(req: Request) {
  const b = await req.json();
  const body = Array.isArray(b.body) ? b.body.map(String) : [];
  await dbRun("UPDATE about SET lede=?, body_json=? WHERE id=1", [
    String(b.lede || ""),
    JSON.stringify(body),
  ]);
  return NextResponse.json(await getAbout());
}
