import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "./db";

const COOKIE_NAME = "studio_session";
const ALG = "HS256";

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET || "dev-only-secret-change-me-in-production-please-32chars";
  return new TextEncoder().encode(s);
}

export interface SessionPayload {
  sub: number;
  email: string;
}

export async function createSession(userId: number, email: string): Promise<string> {
  const jwt = await new SignJWT({ email })
    .setProtectedHeader({ alg: ALG })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
  return jwt;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return { sub: Number(payload.sub), email: String(payload.email) };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(token: string) {
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

export function verifyPassword(email: string, password: string): { id: number; email: string } | null {
  const row = db()
    .prepare("SELECT id, email, password_hash FROM users WHERE email = ?")
    .get(email) as { id: number; email: string; password_hash: string } | undefined;
  if (!row) return null;
  if (!bcrypt.compareSync(password, row.password_hash)) return null;
  return { id: row.id, email: row.email };
}

export function updatePassword(userId: number, newPassword: string): void {
  const hash = bcrypt.hashSync(newPassword, 10);
  db().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, userId);
}

export function updateEmail(userId: number, newEmail: string): void {
  db().prepare("UPDATE users SET email = ? WHERE id = ?").run(newEmail, userId);
}

export const SESSION_COOKIE = COOKIE_NAME;
