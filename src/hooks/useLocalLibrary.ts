"use client";

import { useCallback, useEffect, useState } from "react";
import type { LetterDocument, LocalShare } from "@/lib/letter/types";
import { listLetters, listShares, onLocalChange } from "@/lib/storage/local";

/** Live view of everything saved on this device. */
export function useLocalLibrary() {
  const [letters, setLetters] = useState<LetterDocument[] | null>(null);
  const [shares, setShares] = useState<LocalShare[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [l, s] = await Promise.all([listLetters(), listShares()]);
      setLetters(l);
      setShares(s);
      setError(null);
    } catch (e) {
      setError((e as Error).message || "Could not read your saved letters.");
      setLetters([]);
    }
  }, []);

  useEffect(() => {
    load();
    return onLocalChange(load);
  }, [load]);

  return { letters, shares, error, reload: load };
}
