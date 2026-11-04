import { listLetters } from "@/lib/server/letters";
import { handleError, json, requireUser } from "@/lib/server/http";

export async function GET() {
  try {
    const user = await requireUser();
    return json({ letters: await listLetters(user.id) });
  } catch (err) {
    return handleError(err, "list letters");
  }
}
