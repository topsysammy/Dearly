import { signupSchema } from "@/lib/auth-schema";
import { createSession, createUser } from "@/lib/server/auth";
import { handleError, HttpError, json, rateLimit, readJson } from "@/lib/server/http";

export async function POST(req: Request) {
  try {
    rateLimit(req, "signup", 10, 60 * 60_000);
    const parsed = signupSchema.safeParse(await readJson(req));
    if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message ?? "Check your details.");
    const { name, email, password } = parsed.data;
    const user = await createUser(email, name, password);
    if (!user) throw new HttpError(409, "An account with that email already exists. Try signing in.");
    await createSession(user.id);
    return json({ user }, 201);
  } catch (err) {
    return handleError(err, "signup");
  }
}
