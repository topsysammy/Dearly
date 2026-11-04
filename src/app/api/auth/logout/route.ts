import { destroySession } from "@/lib/server/auth";
import { assertSameOrigin, handleError, json } from "@/lib/server/http";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    await destroySession();
    return json({ ok: true });
  } catch (err) {
    return handleError(err, "logout");
  }
}
