import "server-only";
import { SharingNotConfiguredError } from "./db";

export const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export const MAX_BODY_BYTES = 96 * 1024;

/**
 * CSRF defence for cookie-authenticated writes: require JSON (which cross-site forms can't send
 * without a CORS preflight) and, when the browser sends an Origin, require it to match this host.
 */
export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (origin) {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    try {
      if (new URL(origin).host !== host) throw new HttpError(403, "Cross-site request blocked.");
    } catch (e) {
      if (e instanceof HttpError) throw e;
      throw new HttpError(403, "Cross-site request blocked.");
    }
  }
}

export async function readJson(req: Request): Promise<unknown> {
  assertSameOrigin(req);
  if (!(req.headers.get("content-type") ?? "").includes("application/json"))
    throw new HttpError(415, "Expected a JSON request.");
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > MAX_BODY_BYTES) throw new HttpError(413, "This letter is too large to share.");
  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) throw new HttpError(413, "This letter is too large to share.");
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "Invalid JSON body.");
  }
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Uniform error mapping. Never logs letter contents or tokens. */
export function handleError(err: unknown, where: string) {
  if (err instanceof HttpError) return json({ error: err.message }, err.status);
  if (err instanceof SharingNotConfiguredError)
    return json({ error: "Link sharing isn't set up on this server yet.", code: "not_configured" }, 503);
  console.error(`[dearly] ${where} failed:`, err instanceof Error ? err.name + ": " + err.message.slice(0, 200) : "unknown");
  return json({ error: "Something went wrong on our side. Please try again." }, 500);
}

/** The signed-in user, or a 401. */
export async function requireUser() {
  const { getCurrentUser } = await import("./auth");
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "Please sign in again.");
  return user;
}

/** Best-effort per-instance rate limit (use your platform's limiter for hard guarantees). */
const buckets = new Map<string, { n: number; reset: number }>();
export function rateLimit(req: Request, key: string, limit: number, windowMs: number) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  const id = `${key}:${ip}`;
  const now = Date.now();
  const b = buckets.get(id);
  if (!b || b.reset < now) {
    buckets.set(id, { n: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return;
  }
  if (++b.n > limit) throw new HttpError(429, "Too many requests — please wait a moment and try again.");
}

export const siteOrigin = (req: Request) => process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || new URL(req.url).origin;
