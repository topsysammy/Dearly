"use client";

import type { LetterDocument } from "@/lib/letter/types";

/**
 * Before accounts existed, drafts and share capabilities lived in IndexedDB ("dearly").
 * This module only reads them once so they can be imported into the account, then clears them.
 */

type LegacyShare = { token: string; revokeKey: string; letterId: string; label: string };

function open(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const req = indexedDB.open("dearly");
    req.onupgradeneeded = () => {
      // The database didn't exist — abort creating an empty one.
      req.transaction?.abort();
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
    req.onblocked = () => resolve(null);
  });
}

function getAll<T>(db: IDBDatabase, store: string): Promise<T[]> {
  if (!db.objectStoreNames.contains(store)) return Promise.resolve([]);
  return new Promise((resolve) => {
    const req = db.transaction(store, "readonly").objectStore(store).getAll();
    req.onsuccess = () => resolve((req.result as T[]) ?? []);
    req.onerror = () => resolve([]);
  });
}

export async function readLegacy(): Promise<{ letters: LetterDocument[]; shares: LegacyShare[] }> {
  const db = await open();
  if (!db) return { letters: [], shares: [] };
  const [letters, shares] = await Promise.all([getAll<LetterDocument>(db, "letters"), getAll<LegacyShare>(db, "shares")]);
  db.close();
  return { letters, shares };
}

export function clearLegacy(): Promise<void> {
  if (typeof indexedDB === "undefined") return Promise.resolve();
  return new Promise((resolve) => {
    const req = indexedDB.deleteDatabase("dearly");
    req.onsuccess = req.onerror = req.onblocked = () => resolve();
  });
}
