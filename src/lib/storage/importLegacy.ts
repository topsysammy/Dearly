"use client";

import { letterDocumentSchema } from "@/lib/letter/schema";
import { api, notifyChange, saveLetter } from "./local";
import { clearLegacy, readLegacy } from "./legacy";

/** One-time import of pre-account drafts and links from this browser. Returns how many letters moved. */
export async function importLegacyData(): Promise<number> {
  const { letters, shares } = await readLegacy();
  if (!letters.length && !shares.length) return 0;
  let moved = 0;
  for (const l of letters) {
    const parsed = letterDocumentSchema.safeParse(l);
    if (!parsed.success) continue;
    try {
      await saveLetter(l, { silent: true });
      moved++;
    } catch {
      return moved; // try again next time; keep the local copy
    }
  }
  for (const s of shares) {
    await api("/api/share/claim", { method: "POST", json: { token: s.token, revokeKey: s.revokeKey, letterId: s.letterId, label: s.label } }).catch(() => {});
  }
  await clearLegacy();
  notifyChange();
  return moved;
}
