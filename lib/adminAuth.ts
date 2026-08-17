import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "admin_session";

// The session cookie value is a signed token (not the raw password) so it
// can't be guessed or replayed without knowing ADMIN_PASSWORD + this secret.
function getSecret(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("ADMIN_PASSWORD is not set in .env.local");
  }
  return secret;
}

function makeToken(): string {
  const secret = getSecret();
  return crypto.createHash("sha256").update(secret).digest("hex");
}

export async function checkPassword(password: string): Promise<boolean> {
  const secret = getSecret();
  // Constant-time compare to avoid leaking timing info.
  const a = Buffer.from(password);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function createSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, makeToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  const cookie = store.get(COOKIE_NAME)?.value;
  if (!cookie) return false;
  try {
    return cookie === makeToken();
  } catch {
    return false;
  }
}
