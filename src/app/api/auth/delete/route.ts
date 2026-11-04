import { z } from "zod";
import { destroySession, findUserByEmail, verifyPassword } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { revokeAllForUser } from "@/lib/server/shares";
import { handleError, HttpError, json, rateLimit, readJson, requireUser } from "@/lib/server/http";

/** Permanently delete the account: revokes every link, then removes letters and sessions. */
export async function POST(req: Request) {
  try {
    rateLimit(req, "delete-account", 5, 10 * 60_000);
    const user = await requireUser();
    const parsed = z.object({ password: z.string().min(1).max(200) }).safeParse(await readJson(req));
    if (!parsed.success) throw new HttpError(400, "Enter your password to confirm.");
    const found = await findUserByEmail(user.email);
    if (!found || !(await verifyPassword(parsed.data.password, found.passwordHash))) throw new HttpError(401, "That password isn't right.");
    await revokeAllForUser(user.id);
    await destroySession();
    const db = await getDb();
    await db.query(`DELETE FROM users WHERE id = $1`, [user.id]);
    return json({ ok: true });
  } catch (err) {
    return handleError(err, "delete account");
  }
}
