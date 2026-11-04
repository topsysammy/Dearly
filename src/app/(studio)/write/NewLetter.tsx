"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createBlankLetter } from "@/lib/letter/document";
import { applyTemplate, getTemplate } from "@/lib/letter/templates";
import { saveLetter } from "@/lib/storage/local";
import { ButtonLink } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/Logo";

/** Creates a fresh local draft (optionally from a template) and opens it in the editor. */
export function NewLetter({ templateId }: { templateId?: string }) {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let doc = createBlankLetter();
    const t = getTemplate(templateId);
    if (t) doc = applyTemplate(doc, t);
    saveLetter(doc)
      .then(() => router.replace(`/write/${doc.id}`))
      .catch((e: Error) => setError(e.message || "We couldn't create a draft in this browser."));
  }, [router, templateId]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <LogoMark className="size-10 animate-pulse" />
      {error ? (
        <>
          <p className="max-w-sm text-muted">
            {error} Private browsing modes sometimes block local storage — try a regular window.
          </p>
          <ButtonLink href="/">Back home</ButtonLink>
        </>
      ) : (
        <p className="text-muted">Laying out fresh paper…</p>
      )}
    </div>
  );
}
