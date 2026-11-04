import "server-only";
import { getCurrentUser, type User } from "./auth";
import { SharingNotConfiguredError } from "./db";

export type PageAuth = { state: "ok"; user: User } | { state: "anon" } | { state: "unconfigured" };

/** Resolve the signed-in user for a server component without throwing. */
export async function getPageAuth(): Promise<PageAuth> {
  try {
    const user = await getCurrentUser();
    return user ? { state: "ok", user } : { state: "anon" };
  } catch (err) {
    if (err instanceof SharingNotConfiguredError) return { state: "unconfigured" };
    throw err;
  }
}
