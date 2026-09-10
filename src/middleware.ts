import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "studio_session";

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET || "dev-only-secret-change-me-in-production-please-32chars";
  return new TextEncoder().encode(s);
}

async function isAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === "/studio/login";
  const isLoginApi = pathname === "/api/studio/auth/login";
  const isStudioPage = pathname.startsWith("/studio") && !isLoginPage;
  const isStudioApi =
    pathname.startsWith("/api/studio") && !isLoginApi;

  if (!isStudioPage && !isStudioApi) return NextResponse.next();

  const authed = await isAuthed(req);
  if (authed) {
    if (isLoginPage) {
      const url = req.nextUrl.clone();
      url.pathname = "/studio";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isStudioApi) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/studio/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/studio/:path*", "/api/studio/:path*"],
};
