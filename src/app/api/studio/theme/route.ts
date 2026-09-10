import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { dbRun } from "@/lib/db";
import { getTheme } from "@/lib/content";

export const runtime = "nodejs";

function hex(v: unknown, fallback: string): string {
  const s = String(v || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(s) ? s : fallback;
}

function font(v: unknown, fallback: string): string {
  const s = String(v || "").trim();
  return /^[A-Za-z0-9 +\-]{1,64}$/.test(s) ? s : fallback;
}

export async function GET() {
  return NextResponse.json(await getTheme());
}

export async function PUT(req: Request) {
  const b = await req.json();
  const cur = await getTheme();
  await dbRun(
    `UPDATE theme
        SET color_bg=?, color_text=?, color_text_muted=?, color_accent=?,
            color_accent_soft=?, color_accent_nature=?, color_accent_sky=?,
            color_ink_dark=?, font_display=?, font_body=?, font_mono=?
      WHERE id=1`,
    [
      hex(b.colorBg, cur.colorBg),
      hex(b.colorText, cur.colorText),
      hex(b.colorTextMuted, cur.colorTextMuted),
      hex(b.colorAccent, cur.colorAccent),
      hex(b.colorAccentSoft, cur.colorAccentSoft),
      hex(b.colorAccentNature, cur.colorAccentNature),
      hex(b.colorAccentSky, cur.colorAccentSky),
      hex(b.colorInkDark, cur.colorInkDark),
      font(b.fontDisplay, cur.fontDisplay),
      font(b.fontBody, cur.fontBody),
      font(b.fontMono, cur.fontMono),
    ]
  );
  revalidatePath("/", "layout");
  revalidatePath("/studio", "layout");
  return NextResponse.json(await getTheme());
}
