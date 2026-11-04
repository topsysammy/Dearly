import { getCurrentUser } from "@/lib/server/auth";
import { handleError, json } from "@/lib/server/http";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return user ? json({ user }) : json({ user: null }, 401);
  } catch (err) {
    return handleError(err, "me");
  }
}

/** PATCH /api/auth/me — update display name. */
export async function PATCH(req: Request) {
  try {
    const { z } = await import("zod");
    const { requireUser, readJson, HttpError } = await import("@/lib/server/http");
    const { getDb } = await import("@/lib/server/db");
    const user = await requireUser();
    const parsed = z.object({ name: z.string().trim().min(1).max(60) }).safeParse(await readJson(req));
    if (!parsed.success) throw new HttpError(400, "Names need 1–60 characters.");
    const db = await getDb();
    await db.query(`UPDATE users SET name = $1 WHERE id = $2`, [parsed.data.name, user.id]);
    return json({ user: { ...user, name: parsed.data.name } });
  } catch (err) {
    return handleError(err, "update profile");
  }
}
