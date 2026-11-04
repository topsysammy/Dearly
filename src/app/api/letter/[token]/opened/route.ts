import { tokenSchema } from "@/lib/letter/schema";
import { markOpened } from "@/lib/server/shares";
import { handleError, json, rateLimit } from "@/lib/server/http";

/** POST /api/letter/[token]/opened — counts an envelope opening (no content, no personal data). */
export async function POST(req: Request, ctx: RouteContext<"/api/letter/[token]/opened">) {
  try {
    rateLimit(req, "opened", 30, 60_000);
    const { token } = await ctx.params;
    if (!tokenSchema.safeParse(token).success) return json({ ok: false }, 404);
    await markOpened(token);
    return json({ ok: true });
  } catch (err) {
    return handleError(err, "mark opened");
  }
}
