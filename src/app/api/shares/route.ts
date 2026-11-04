import { listOwnedShares } from "@/lib/server/shares";
import { handleError, json, requireUser, siteOrigin } from "@/lib/server/http";

/** GET /api/shares[?letterId=] — the signed-in user's links with live status. */
export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const letterId = new URL(req.url).searchParams.get("letterId")?.slice(0, 64) || undefined;
    return json({ shares: await listOwnedShares(user.id, siteOrigin(req), letterId) });
  } catch (err) {
    return handleError(err, "list shares");
  }
}
