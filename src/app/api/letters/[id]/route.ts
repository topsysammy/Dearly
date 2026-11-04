import { z } from "zod";
import { letterDocumentSchema } from "@/lib/letter/schema";
import type { LetterDocument } from "@/lib/letter/types";
import { deleteLetter, getLetter, upsertLetter } from "@/lib/server/letters";
import { assertSameOrigin, handleError, HttpError, json, rateLimit, readJson, requireUser } from "@/lib/server/http";

const idSchema = z.string().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/);

export async function GET(_req: Request, ctx: RouteContext<"/api/letters/[id]">) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    if (!idSchema.safeParse(id).success) throw new HttpError(404, "Letter not found.");
    const letter = await getLetter(user.id, id);
    if (!letter) throw new HttpError(404, "Letter not found.");
    return json({ letter });
  } catch (err) {
    return handleError(err, "get letter");
  }
}

export async function PUT(req: Request, ctx: RouteContext<"/api/letters/[id]">) {
  try {
    rateLimit(req, "save", 600, 10 * 60_000);
    const user = await requireUser();
    const { id } = await ctx.params;
    const parsed = letterDocumentSchema.safeParse(await readJson(req));
    if (!parsed.success || parsed.data.id !== id || !idSchema.safeParse(id).success)
      throw new HttpError(400, "This draft couldn't be saved — some details look invalid.");
    if (!(await upsertLetter(user.id, parsed.data as LetterDocument))) throw new HttpError(403, "You can't edit this letter.");
    return json({ ok: true });
  } catch (err) {
    return handleError(err, "save letter");
  }
}

export async function DELETE(req: Request, ctx: RouteContext<"/api/letters/[id]">) {
  try {
    assertSameOrigin(req);
    const user = await requireUser();
    const { id } = await ctx.params;
    await deleteLetter(user.id, id);
    return json({ ok: true });
  } catch (err) {
    return handleError(err, "delete letter");
  }
}
