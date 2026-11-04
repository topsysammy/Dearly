"use client";

import { letterLabel } from "@/lib/letter/document";
import type { ExpiryOption } from "@/lib/letter/schema";
import type { LetterDocument, LocalShare, ShareStatus } from "@/lib/letter/types";
import { api, ApiError, notifyChange } from "@/lib/storage/local";

export { ApiError as ShareError };

/** Upload an immutable snapshot owned by the signed-in account. */
export async function createShareLink(doc: LetterDocument, expiresIn: ExpiryOption): Promise<LocalShare> {
  const r = await api<{ token: string; revokeKey: string; url: string; createdAt: string; expiresAt: string | null }>("/api/share", {
    method: "POST",
    json: { letter: doc, expiresIn },
  });
  notifyChange();
  return {
    token: r.token,
    revokeKey: r.revokeKey,
    url: r.url,
    letterId: doc.id,
    label: letterLabel(doc),
    createdAt: r.createdAt,
    expiresAt: r.expiresAt,
    revokedAt: null,
    lastKnownStatus: "active",
    firstOpenedAt: null,
    openCount: 0,
  };
}

export async function revokeShareLink(share: LocalShare): Promise<void> {
  await api("/api/share/revoke", { method: "POST", json: { token: share.token } });
  notifyChange();
}

export function effectiveStatus(s: LocalShare): ShareStatus {
  if (s.revokedAt || s.lastKnownStatus === "revoked") return "revoked";
  if (s.expiresAt && new Date(s.expiresAt).getTime() <= Date.now()) return "expired";
  return s.lastKnownStatus ?? "active";
}

export const shareMessage = (doc?: Pick<LetterDocument, "recipient">) =>
  doc?.recipient?.trim() ? `${doc.recipient.trim()}, I wrote you a letter 💌` : "I wrote you a letter 💌";

export function shareTargets(url: string, text: string) {
  const full = `${text} ${url}`;
  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(full)}`,
    sms: `sms:?&body=${encodeURIComponent(full)}`,
    email: `mailto:?subject=${encodeURIComponent("A letter for you")}&body=${encodeURIComponent(`${text}\n\nOpen it here: ${url}`)}`,
  };
}
