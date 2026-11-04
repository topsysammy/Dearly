import "server-only";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { getDb } from "./db";
import { sha256 } from "./shares";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;

export const SESSION_COOKIE = "dearly_session";
const SESSION_DAYS = 30;

export type User = { id: string; email: string; name: string; createdAt: string };

/* ── Passwords (scrypt, no extra dependency) ── */

const N = 16384,
  R = 8,
  P = 1,
  KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password.normalize("NFKC"), salt, KEYLEN, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, n, r, p, salt, hash] = stored.split("$");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = await scrypt(password.normalize("NFKC"), Buffer.from(salt, "base64url"), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: 64 * 1024 * 1024,
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** A real hash to compare against when the email doesn't exist, so timing doesn't reveal accounts. */
let dummyHash: Promise<string> | null = null;
export const getDummyHash = () => (dummyHash ??= hashPassword(randomBytes(12).toString("hex")));

/* ── Sessions ── */

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const db = await getDb();
  await db.query(`INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)`, [sha256(token), userId, expires.toISOString()]);
  // Opportunistic cleanup of expired sessions.
  db.query(`DELETE FROM sessions WHERE expires_at < now()`).catch(() => {});
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db.query(`DELETE FROM sessions WHERE token_hash = $1`, [sha256(token)]);
  }
  jar.delete(SESSION_COOKIE);
}

type UserRow = { id: string; email: string; name: string; created_at: string | Date };
const toUser = (r: UserRow): User => ({ id: r.id, email: r.email, name: r.name, createdAt: new Date(r.created_at).toISOString() });

/** The signed-in user for this request, or null. */
export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const db = await getDb();
  const { rows } = await db.query<UserRow>(
    `SELECT u.id, u.email, u.name, u.created_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > now() LIMIT 1`,
    [sha256(token)],
  );
  return rows[0] ? toUser(rows[0]) : null;
}

export async function findUserByEmail(email: string) {
  const db = await getDb();
  const { rows } = await db.query<UserRow & { password_hash: string }>(
    `SELECT id, email, name, created_at, password_hash FROM users WHERE email = $1 LIMIT 1`,
    [email],
  );
  return rows[0] ? { user: toUser(rows[0]), passwordHash: rows[0].password_hash } : null;
}

export async function createUser(email: string, name: string, password: string): Promise<User | null> {
  const db = await getDb();
  const { rows } = await db.query<UserRow>(
    `INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3)
     ON CONFLICT (email) DO NOTHING RETURNING id, email, name, created_at`,
    [email, name, await hashPassword(password)],
  );
  return rows[0] ? toUser(rows[0]) : null;
}
