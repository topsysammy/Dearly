import { tokenSchema } from "@/lib/letter/schema";
import { getSharedLetter } from "@/lib/server/shares";
import { handleError, json, rateLimit } from "@/lib/server/http";

/** GET /api/letter/[token] — the recipient's snapshot, if the link is still valid. */
export async function GET(req: Request, ctx: RouteContext<"/api/letter/[token]">) {
  try {
    rateLimit(req, "letter", 120, 60_000);
    const { token } = await ctx.params;
    if (!tokenSchema.safeParse(token).success) return json({ status: "invalid" }, 404);
    const result = await getSharedLetter(token);
    if (result.status === "missing") return json({ status: "invalid" }, 404);
    if (result.status !== "active") return json({ status: result.status }, 410);
    return json({ status: "active", letter: result.letter, sharedAt: result.createdAt });
  } catch (err) {
    return handleError(err, "get letter");
  }
}
