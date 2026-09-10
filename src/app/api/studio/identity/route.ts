import { NextResponse } from "next/server";
import { dbRun } from "@/lib/db";
import { getIdentity } from "@/lib/content";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(await getIdentity());
}

export async function PUT(req: Request) {
  const b = await req.json();
  await dbRun(
    `UPDATE identity
       SET name=?, role=?, location=?, email=?, linkedin=?, github=?, github_user=?, cv=?, portrait=?
     WHERE id=1`,
    [
      String(b.name || ""),
      String(b.role || ""),
      String(b.location || ""),
      String(b.email || ""),
      String(b.linkedin || ""),
      String(b.github || ""),
      String(b.githubUser || ""),
      String(b.cv || ""),
      String(b.portrait || ""),
    ]
  );
  return NextResponse.json(await getIdentity());
}
