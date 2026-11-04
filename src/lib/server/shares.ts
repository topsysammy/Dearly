import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { ExpiryOption } from "@/lib/letter/schema";
import type { LetterDocument, ShareStatus } from "@/lib/letter/types";
import { getDb } from "./db";

/** Public viewing token: 192 bits of entropy, URL-safe, 32 chars. */
export const newToken = () => randomBytes(24).toString("base64url");
/** Sender-only revocation capability: 256 bits, 43 chars. Never derivable from the token. */
export const newRevokeKey = () => randomBytes(32).toString("base64url");
export const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

function safeEqualHex(a: string, b: string) {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

const EXPIRY_MS: Record<ExpiryOption, number | null> = {
  never: null,
  "1d": 86_400_000,
  "7d": 7 * 86_400_000,
  "30d": 30 * 86_400_000,
  "90d": 90 * 86_400_000,
};

type Row = {
  user_id: string | null;
  letter_document: LetterDocument;
  revoke_key_hash: string;
  created_at: string | Date;
  expires_at: string | Date | null;
  revoked_at: string | Date | null;
  open_count: number;
  first_opened_at: string | Date | null;
};

const iso = (v: string | Date | null) => (v == null ? null : new Date(v).toISOString());

function statusOf(row: Row | undefined): ShareStatus {
  if (!row) return "missing";
  if (row.revoked_at) return "revoked";
  if (row.expires_at && new Date(row.expires_at).getTime() <= Date.now()) return "expired";
  return "active";
}

/** Strip anything the recipient does not need — the snapshot is public to link holders. */
function toSnapshot(doc: LetterDocument): LetterDocument {
  return {
    ...doc,
    id: randomBytes(9).toString("base64url"),
    templateId: undefined,
    title: undefined,
  };
}

export async function createShare(
  letter: LetterDocument,
  expiresIn: ExpiryOption,
  owner?: { userId: string; letterId: string; label: string },
) {
  const db = await getDb();
  const token = newToken();
  const revokeKey = newRevokeKey();
  const ms = EXPIRY_MS[expiresIn];
  const expiresAt = ms ? new Date(Date.now() + ms).toISOString() : null;
  const createdAt = new Date().toISOString();
  await db.query(
    `INSERT INTO shared_letters (token_hash, revoke_key_hash, letter_document, created_at, expires_at, user_id, letter_id, label, owner_token)
     VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $8, $9)`,
    [
      sha256(token),
      sha256(revokeKey),
      JSON.stringify(toSnapshot(letter)),
      createdAt,
      expiresAt,
      owner?.userId ?? null,
      owner?.letterId ?? null,
      owner?.label.slice(0, 120) ?? null,
      owner ? token : null,
    ],
  );
  return { token, revokeKey, createdAt, expiresAt };
}

async function findRow(token: string): Promise<Row | undefined> {
  const db = await getDb();
  const { rows } = await db.query<Row>(
    `SELECT user_id, letter_document, revoke_key_hash, created_at, expires_at, revoked_at, open_count, first_opened_at
       FROM shared_letters WHERE token_hash = $1 LIMIT 1`,
    [sha256(token)],
  );
  return rows[0];
}

export async function getSharedLetter(token: string) {
  const row = await findRow(token);
  const status = statusOf(row);
  if (status !== "active" || !row) return { status } as const;
  return { status, letter: row.letter_document, createdAt: iso(row.created_at) } as const;
}

export async function markOpened(token: string) {
  const db = await getDb();
  await db.query(
    `UPDATE shared_letters
        SET open_count = open_count + 1, first_opened_at = COALESCE(first_opened_at, now())
      WHERE token_hash = $1 AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > now())`,
    [sha256(token)],
  );
}

export async function revokeShare(
  token: string,
  auth: { revokeKey?: string; userId?: string },
): Promise<"revoked" | "not_found" | "forbidden"> {
  const row = await findRow(token);
  if (!row) return "not_found";
  const byKey = !!auth.revokeKey && safeEqualHex(row.revoke_key_hash, sha256(auth.revokeKey));
  const byOwner = !!auth.userId && row.user_id === auth.userId;
  if (!byKey && !byOwner) return "forbidden";
  if (row.revoked_at) return "revoked";
  const db = await getDb();
  await db.query(`UPDATE shared_letters SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL`, [sha256(token)]);
  return "revoked";
}

export type OwnedShare = {
  token: string;
  url: string;
  letterId: string;
  label: string;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  status: ShareStatus;
  openCount: number;
  firstOpenedAt: string | null;
};

/** Every link the signed-in user has created, with live status. */
export async function listOwnedShares(userId: string, origin: string, letterId?: string): Promise<OwnedShare[]> {
  const db = await getDb();
  const { rows } = await db.query<Row & { owner_token: string; letter_id: string; label: string | null }>(
    `SELECT user_id, owner_token, letter_id, label, letter_document, revoke_key_hash, created_at, expires_at, revoked_at, open_count, first_opened_at
       FROM shared_letters
      WHERE user_id = $1 AND owner_token IS NOT NULL AND ($2::text IS NULL OR letter_id = $2)
      ORDER BY created_at DESC LIMIT 200`,
    [userId, letterId ?? null],
  );
  return rows.map((r) => ({
    token: r.owner_token,
    url: `${origin}/letter/${r.owner_token}`,
    letterId: r.letter_id ?? "",
    label: r.label ?? "A letter",
    createdAt: iso(r.created_at)!,
    expiresAt: iso(r.expires_at),
    revokedAt: iso(r.revoked_at),
    status: statusOf(r),
    openCount: r.open_count,
    firstOpenedAt: iso(r.first_opened_at),
  }));
}

/** Attach a link created before sign-in (proved by its revoke key) to the account. */
export async function claimShare(token: string, revokeKey: string, userId: string, letterId: string, label: string) {
  const row = await findRow(token);
  if (!row || !safeEqualHex(row.revoke_key_hash, sha256(revokeKey))) return false;
  if (row.user_id && row.user_id !== userId) return false;
  const db = await getDb();
  await db.query(
    `UPDATE shared_letters SET user_id = $2, owner_token = $3, letter_id = $4, label = COALESCE(label, $5) WHERE token_hash = $1`,
    [sha256(token), userId, token, letterId, label.slice(0, 120)],
  );
  return true;
}

export async function revokeAllForUser(userId: string) {
  const db = await getDb();
  await db.query(`UPDATE shared_letters SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`, [userId]);
}
