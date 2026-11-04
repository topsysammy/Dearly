import { z } from "zod";
import { revokeKeySchema, tokenSchema } from "@/lib/letter/schema";
import { claimShare } from "@/lib/server/shares";
import { handleError, HttpError, json, rateLimit, readJson, requireUser } from "@/lib/server/http";

/** POST /api/share/claim — move a link made on this device before sign-in into the account. */
export async function POST(req: Request) {
  try {
    rateLimit(req, "claim", 60, 10 * 60_000);
    const user = await requireUser();
    const parsed = z
      .object({ token: tokenSchema, revokeKey: revokeKeySchema, letterId: z.string().min(1).max(64), label: z.string().max(200) })
      .safeParse(await readJson(req));
    if (!parsed.success) throw new HttpError(400, "Invalid request.");
    const { token, revokeKey, letterId, label } = parsed.data;
    return json({ claimed: await claimShare(token, revokeKey, user.id, letterId, label) });
  } catch (err) {
    return handleError(err, "claim share");
  }
}
