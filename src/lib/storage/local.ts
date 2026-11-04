"use client";

import type { LetterDocument, LocalShare } from "@/lib/letter/types";

/**
 * Account-backed storage for drafts and share links.
 * (The module keeps its original name so components didn't need to change how they load data.)
 */

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
  }
}

export async function api<T>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { ...(init?.json !== undefined ? { "Content-Type": "application/json" } : {}), ...init?.headers },
      body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
      cache: "no-store",
    });
  } catch {
    throw new ApiError("You seem to be offline. Check your connection and try again.", 0, "network");
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && typeof window !== "undefined" && !url.startsWith("/api/auth/")) {
    window.location.assign("/login");
  }
  if (!res.ok) throw new ApiError(data.error ?? "Something went wrong. Please try again.", res.status, data.code);
  return data as T;
}

/* Change notifications within the tab (and across tabs). */
const listeners = new Set<() => void>();
let channel: BroadcastChannel | null = null;
function notify() {
  listeners.forEach((l) => l());
  try {
    channel ??= new BroadcastChannel("dearly-sync");
    channel.postMessage("changed");
  } catch {}
}
export function onLocalChange(fn: () => void): () => void {
  listeners.add(fn);
  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel("dearly-sync");
    bc.onmessage = () => fn();
  } catch {}
  return () => {
    listeners.delete(fn);
    bc?.close();
  };
}
export const notifyChange = notify;

/* Letters */

export async function listLetters(): Promise<LetterDocument[]> {
  return (await api<{ letters: LetterDocument[] }>("/api/letters")).letters;
}

export async function getLetter(id: string): Promise<LetterDocument | undefined> {
  try {
    return (await api<{ letter: LetterDocument }>(`/api/letters/${encodeURIComponent(id)}`)).letter;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return undefined;
    throw e;
  }
}

export async function saveLetter(doc: LetterDocument, opts: { silent?: boolean } = {}): Promise<void> {
  await api(`/api/letters/${encodeURIComponent(doc.id)}`, { method: "PUT", json: doc, keepalive: JSON.stringify(doc).length < 60000 });
  if (!opts.silent) notify();
}

export async function deleteLetter(id: string): Promise<void> {
  await api(`/api/letters/${encodeURIComponent(id)}`, { method: "DELETE" });
  notify();
}

/* Share links */

type ServerShare = Omit<LocalShare, "revokeKey" | "lastKnownStatus"> & { status: LocalShare["lastKnownStatus"]; openCount: number };

const toLocal = (s: ServerShare): LocalShare => ({ ...s, lastKnownStatus: s.status });

export async function listShares(): Promise<LocalShare[]> {
  return (await api<{ shares: ServerShare[] }>("/api/shares")).shares.map(toLocal);
}

export async function listSharesForLetter(letterId: string): Promise<LocalShare[]> {
  return (await api<{ shares: ServerShare[] }>(`/api/shares?letterId=${encodeURIComponent(letterId)}`)).shares.map(toLocal);
}
