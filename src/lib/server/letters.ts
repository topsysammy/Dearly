import "server-only";
import type { LetterDocument } from "@/lib/letter/types";
import { getDb } from "./db";

/** Account-backed drafts. Every query is scoped by user_id. */

export async function listLetters(userId: string): Promise<LetterDocument[]> {
  const db = await getDb();
  const { rows } = await db.query<{ document: LetterDocument }>(
    `SELECT document FROM letters WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 500`,
    [userId],
  );
  return rows.map((r) => r.document);
}

export async function getLetter(userId: string, id: string): Promise<LetterDocument | null> {
  const db = await getDb();
  const { rows } = await db.query<{ document: LetterDocument }>(`SELECT document FROM letters WHERE id = $1 AND user_id = $2`, [id, userId]);
  return rows[0]?.document ?? null;
}

/** Insert or update. Returns false if the id belongs to someone else. */
export async function upsertLetter(userId: string, doc: LetterDocument): Promise<boolean> {
  const db = await getDb();
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO letters (id, user_id, document, created_at, updated_at)
     VALUES ($1, $2, $3::jsonb, $4, $5)
     ON CONFLICT (id) DO UPDATE SET document = EXCLUDED.document, updated_at = EXCLUDED.updated_at
       WHERE letters.user_id = EXCLUDED.user_id
     RETURNING id`,
    [doc.id, userId, JSON.stringify(doc), doc.createdAt, doc.updatedAt],
  );
  return rows.length > 0;
}

export async function deleteLetter(userId: string, id: string) {
  const db = await getDb();
  await db.query(`DELETE FROM letters WHERE id = $1 AND user_id = $2`, [id, userId]);
}
