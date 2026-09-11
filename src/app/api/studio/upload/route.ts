import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

export const runtime = "nodejs";

const utapi = new UTApi();

const ALLOWED: Record<string, string[]> = {
  image: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"],
  pdf: [".pdf"],
};

function ext(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") || "image");
  const allowed = ALLOWED[kind];
  if (!allowed) return NextResponse.json({ error: "invalid kind" }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "file required" }, { status: 400 });

  const fileExt = ext(file.name);
  if (!allowed.includes(fileExt)) {
    return NextResponse.json({ error: `extension ${fileExt} not allowed` }, { status: 400 });
  }

  try {
    const response = await utapi.uploadFiles(file);
    if (response.error) {
      console.error("[upload] Uploadthing error:", response.error);
      return NextResponse.json({ error: response.error.message }, { status: 500 });
    }

    const url = (response.data as any).ufsUrl ?? (response.data as any).url;
    return NextResponse.json({ url });
  } catch (e: any) {
    console.error("[upload] Exception:", e);
    return NextResponse.json({ error: e.message || "upload failed" }, { status: 500 });
  }
}
