import { NextResponse } from "next/server";
import { getCurrentUser, updateEmail, updatePassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (typeof body.email === "string" && body.email.trim()) {
    updateEmail(user.sub, body.email.trim().toLowerCase());
  }
  if (typeof body.password === "string" && body.password.length >= 6) {
    updatePassword(user.sub, body.password);
  }
  return NextResponse.json({ ok: true });
}
