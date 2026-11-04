import { createShareSchema } from "@/lib/letter/schema";
import { letterLabel } from "@/lib/letter/document";
import type { LetterDocument } from "@/lib/letter/types";
import { createShare } from "@/lib/server/shares";
import { handleError, HttpError, json, rateLimit, readJson, requireUser, siteOrigin } from "@/lib/server/http";

/** POST /api/share — store an immutable snapshot owned by the signed-in user. */
export async function POST(req: Request) {
  try {
    rateLimit(req, "share", 30, 10 * 60_000);
    const user = await requireUser();
    const parsed = createShareSchema.safeParse(await readJson(req));
    if (!parsed.success) throw new HttpError(400, "This letter couldn't be shared — some of its details look invalid.");
    const { letter, expiresIn } = parsed.data;
    if (!letter.message.trim() && !letter.signature?.trim() && !letter.greeting?.trim())
      throw new HttpError(400, "Write something before sharing your letter.");

    const doc = letter as LetterDocument;
    const share = await createShare(doc, expiresIn, { userId: user.id, letterId: doc.id, label: letterLabel(doc) });
    return json({ ...share, url: `${siteOrigin(req)}/letter/${share.token}` }, 201);
  } catch (err) {
    return handleError(err, "create share");
  }
}
