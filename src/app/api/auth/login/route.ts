import { loginSchema } from "@/lib/auth-schema";
import { createSession, findUserByEmail, getDummyHash, verifyPassword } from "@/lib/server/auth";
import { handleError, HttpError, json, rateLimit, readJson } from "@/lib/server/http";

export async function POST(req: Request) {
  try {
    rateLimit(req, "login", 12, 10 * 60_000);
    const parsed = loginSchema.safeParse(await readJson(req));
    if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message ?? "Check your details.");
    const found = await findUserByEmail(parsed.data.email);
    // Always run a hash comparison so response time doesn't reveal whether the email exists.
    const ok = await verifyPassword(parsed.data.password, found?.passwordHash ?? (await getDummyHash()));
    if (!found || !ok) throw new HttpError(401, "That email and password don't match.");
    await createSession(found.user.id);
    return json({ user: found.user });
  } catch (err) {
    return handleError(err, "login");
  }
}
