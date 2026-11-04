"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LetterDocument } from "@/lib/letter/types";
import { getLetter, saveLetter } from "@/lib/storage/local";

export type SaveState = "idle" | "saving" | "saved" | "error";

/** Loads a draft from IndexedDB and autosaves every change (debounced, flushed on hide/unload). */
export function useLetterDraft(id: string) {
  const [doc, setDoc] = useState<LetterDocument | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const pending = useRef<LetterDocument | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    getLetter(id)
      .then((d) => {
        if (!alive) return;
        if (d) {
          setDoc(d);
          setStatus("ready");
        } else setStatus("missing");
      })
      .catch(() => alive && setStatus("error"));
    return () => {
      alive = false;
    };
  }, [id]);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const d = pending.current;
    if (!d) return;
    pending.current = null;
    try {
      await saveLetter(d);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }, []);

  const update = useCallback(
    (fn: (d: LetterDocument) => LetterDocument) => {
      setDoc((prev) => {
        if (!prev) return prev;
        const next = { ...fn(prev), updatedAt: new Date().toISOString() };
        pending.current = next;
        return next;
      });
      setSaveState("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, 450);
    },
    [flush],
  );

  useEffect(() => {
    const onHide = () => document.visibilityState === "hidden" && flush();
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onHide);
      flush();
    };
  }, [flush]);

  return { doc, status, saveState, update, flush };
}
