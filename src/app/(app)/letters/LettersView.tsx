"use client";

import { useMemo, useState } from "react";
import { Loader2, PenLine, Plus } from "lucide-react";
import { duplicateLetter, letterLabel } from "@/lib/letter/document";
import type { LetterDocument } from "@/lib/letter/types";
import { deleteLetter, saveLetter } from "@/lib/storage/local";
import { effectiveStatus } from "@/lib/share-client";
import { useLocalLibrary } from "@/hooks/useLocalLibrary";
import { LetterCard } from "@/components/library/LetterCard";
import { LinkList } from "@/components/share/LinkList";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import { DecorationArt } from "@/components/decorations/DecorationArt";

type Tab = "letters" | "sent";

export function LettersView() {
  const { letters, shares, error } = useLocalLibrary();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("letters");
  const [toDelete, setToDelete] = useState<LetterDocument | null>(null);

  const activeByLetter = useMemo(() => {
    const m = new Map<string, number>();
    shares.forEach((s) => effectiveStatus(s) === "active" && m.set(s.letterId, (m.get(s.letterId) ?? 0) + 1));
    return m;
  }, [shares]);

  const duplicate = async (doc: LetterDocument) => {
    try {
      await saveLetter(duplicateLetter(doc));
      toast(`Duplicated “${letterLabel(doc)}”`, { tone: "success" });
    } catch (e) {
      toast((e as Error).message, { tone: "error" });
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const doc = toDelete;
    setToDelete(null);
    try {
      await deleteLetter(doc.id);
      toast("Letter deleted", { action: { label: "Undo", onClick: () => saveLetter(doc) } });
    } catch (e) {
      toast((e as Error).message, { tone: "error" });
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pt-[max(24px,env(safe-area-inset-top))] sm:px-6">
      <div className="relative flex items-center justify-center">
        <h1 className="font-serif text-[34px]">Collection</h1>
        <ButtonLink href="/write" size="sm" className="absolute right-0" aria-label="New letter">
          <Plus className="size-4" /> <span className="hidden sm:inline">New</span>
        </ButtonLink>
      </div>

      <div role="tablist" aria-label="Collection" className="mx-auto mt-6 grid max-w-sm grid-cols-2 rounded-full bg-[#dedcd6] p-1 shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)]">
        {(
          [
            ["letters", "Saved letters"],
            ["sent", `Sent${shares.length ? ` · ${shares.length}` : ""}`],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`hand h-11 rounded-full text-[18px] transition ${tab === id ? "bg-surface text-ink shadow-[0_4px_12px_-6px_rgba(0,0,0,0.3)]" : "text-muted hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="mt-6 rounded-2xl bg-[#fbefed] px-4 py-3 text-sm text-danger">{error}</p>}

      {letters === null ? (
        <div className="flex min-h-[40dvh] items-center justify-center text-muted">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : tab === "letters" ? (
        letters.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
            {letters.map((l) => (
              <LetterCard
                key={l.id}
                doc={l}
                activeLinks={activeByLetter.get(l.id) ?? 0}
                onDuplicate={() => duplicate(l)}
                onDelete={() => setToDelete(l)}
              />
            ))}
          </div>
        )
      ) : shares.length === 0 ? (
        <div className="mx-auto mt-16 max-w-xs text-center">
          <p className="font-serif text-[28px]">Nothing sent yet</p>
          <p className="mt-2 text-[14px] text-muted">Open a letter and choose “Send” to seal it in an envelope.</p>
        </div>
      ) : (
        <div className="mx-auto mt-8 max-w-2xl">
          <p className="mb-4 text-[13px] leading-relaxed text-muted">
            Each link opens a sealed copy of your letter as it was when you sent it. Revoke a link any time and the envelope
            stops opening.
          </p>
          <LinkList shares={shares} showLabel />
        </div>
      )}

      <Sheet open={!!toDelete} onClose={() => setToDelete(null)} title="Delete this letter?">
        <p className="text-[15px] leading-relaxed text-muted">
          “{toDelete ? letterLabel(toDelete) : ""}” will be removed from your account.
          {toDelete && activeByLetter.has(toDelete.id) ? " Links you've already sent keep working — revoke them in Sent if you want them gone." : ""}
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto mt-14 flex max-w-sm flex-col items-center text-center">
      <div className="relative mb-8 h-32 w-44">
        <div className="absolute inset-x-4 top-2 bottom-0 rotate-[-5deg] rounded-md border border-[#cfccc5] bg-[#FBFAF7] shadow-card" />
        <div className="absolute inset-x-6 top-0 bottom-2 rotate-[3deg] rounded-md border border-[#cfccc5] bg-white shadow-card" />
        <div className="absolute -top-4 -right-2 size-12 rotate-12">
          <DecorationArt type="heart-outline" />
        </div>
        <div className="absolute -bottom-3 left-0 size-14 -rotate-12">
          <DecorationArt type="stamp-flower" />
        </div>
      </div>
      <h2 className="font-serif text-[32px] leading-tight">Your letters will live here.</h2>
      <p className="mt-2 text-muted">Start writing something meaningful.</p>
      <ButtonLink href="/write" size="lg" className="mt-8">
        <PenLine className="size-4" /> Create your first letter
      </ButtonLink>
    </div>
  );
}
