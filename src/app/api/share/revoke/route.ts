import { z } from "zod";
import { revokeKeySchema, tokenSchema } from "@/lib/letter/schema";
import { getCurrentUser } from "@/lib/server/auth";
import { revokeShare } from "@/lib/server/shares";
import { handleError, HttpError, json, rateLimit, readJson } from "@/lib/server/http";

/** POST /api/share/revoke — allowed for the owning account, or with the link's revoke key. */
export async function POST(req: Request) {
  try {
    rateLimit(req, "revoke", 60, 10 * 60_000);
    const parsed = z.object({ token: tokenSchema, revokeKey: revokeKeySchema.optional() }).safeParse(await readJson(req));
    if (!parsed.success) throw new HttpError(400, "Invalid revocation request.");
    const user = await getCurrentUser();
    const result = await revokeShare(parsed.data.token, { revokeKey: parsed.data.revokeKey, userId: user?.id });
    if (result === "not_found") return json({ error: "That link doesn't exist." }, 404);
    if (result === "forbidden") return json({ error: "You aren't allowed to manage that link." }, 403);
    return json({ status: "revoked" });
  } catch (err) {
    return handleError(err, "revoke share");
  }
}
