"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileImage, FileText, Image as ImageIcon, Loader2, PenLine, Send, Share } from "lucide-react";
import { letterLabel, hasWriting } from "@/lib/letter/document";
import type { LetterDocument, LocalShare } from "@/lib/letter/types";
import { getLetter, listSharesForLetter, onLocalChange } from "@/lib/storage/local";
import { canShareFiles, downloadFile, exportLetter, type ExportFormat } from "@/lib/export";
import { Paper } from "@/components/paper/Paper";
import { FittedPaper } from "@/components/paper/FittedPaper";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import { ShareLinkSheet } from "@/components/share/ShareLinkSheet";
import { LinkList } from "@/components/share/LinkList";

const FORMATS: { id: ExportFormat; label: string; hint: string; icon: typeof FileImage }[] = [
  { id: "png", label: "PNG image", hint: "Crisp, lossless — best for sharing online", icon: FileImage },
  { id: "jpg", label: "JPG image", hint: "Smaller file, great for messaging apps", icon: ImageIcon },
  { id: "pdf", label: "PDF document", hint: "Print-ready at true paper size", icon: FileText },
];

export function PreviewView({ id }: { id: string }) {
  const { toast } = useToast();
  const [doc, setDoc] = useState<LetterDocument | null | undefined>(undefined);
  const [shares, setShares] = useState<LocalShare[]>([]);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [busy, setBusy] = useState<ExportFormat | "share" | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const loadShares = useCallback(() => listSharesForLetter(id).then(setShares).catch(() => {}), [id]);

  useEffect(() => {
    getLetter(id)
      .then((d) => setDoc(d ?? null))
      .catch(() => setDoc(null));
    loadShares();
    return onLocalChange(loadShares);
  }, [id, loadShares]);

  const run = async (format: ExportFormat) => {
    if (!doc || !exportRef.current) return;
    setBusy(format);
    try {
      const file = await exportLetter(exportRef.current, doc, format);
      downloadFile(file);
      toast(`${format.toUpperCase()} downloaded`, { tone: "success" });
      setDownloadOpen(false);
    } catch (e) {
      toast(`Export failed: ${(e as Error).message || "please try again."}`, { tone: "error" });
    } finally {
      setBusy(null);
    }
  };

  const nativeShare = async () => {
    if (!doc || !exportRef.current) return;
    setBusy("share");
    try {
      const file = await exportLetter(exportRef.current, doc, "png");
      if (canShareFiles(file)) {
        try {
          await navigator.share({ files: [file], title: letterLabel(doc) });
        } catch (e) {
          if ((e as Error).name !== "AbortError") throw e;
        }
      } else {
        downloadFile(file);
        toast("Your device can't share files directly, so we downloaded the image instead.", { tone: "info" });
      }
    } catch (e) {
      toast(`Couldn't share: ${(e as Error).message || "please try again."}`, { tone: "error" });
    } finally {
      setBusy(null);
    }
  };

  if (doc === undefined)
    return (
      <div className="flex min-h-[60dvh] items-center justify-center text-muted">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  if (doc === null)
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-serif text-4xl">Letter not found</h1>
        <p className="text-muted">It may have been deleted, or it was written in a different browser.</p>
        <ButtonLink href="/letters">Back to my letters</ButtonLink>
      </div>
    );

  const empty = !hasWriting(doc);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-4 pb-10 sm:px-6 sm:pt-8">
      <div className="mb-6 flex items-center gap-2">
        <Link href={`/write/${doc.id}`} className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/70 bg-surface/80 shadow-card hover:bg-white" aria-label="Back to editor">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="min-w-0">
          <p className="hand text-[16px] text-faint">Preview</p>
          <h1 className="truncate font-serif text-[28px] leading-tight sm:text-[34px]">{letterLabel(doc)}</h1>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="mx-auto w-full max-w-[620px] p-2 sm:p-6">
          <FittedPaper doc={doc} />
        </div>

        <div className="space-y-6 lg:sticky lg:top-24">
          {empty && (
            <p className="rounded-2xl bg-cream px-4 py-3 text-[13px] text-[#6b5a3e]">
              This letter is still empty. Add a message before sending it.
            </p>
          )}
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-1">
            <Button size="lg" className="col-span-2 lg:col-span-1" onClick={() => setLinkOpen(true)} disabled={empty}>
              <Send className="size-[18px] -rotate-12" /> Send as a link
            </Button>
            <Button variant="secondary" onClick={() => setDownloadOpen(true)}>
              <Download className="size-4" /> Download
            </Button>
            <Button variant="secondary" onClick={nativeShare} loading={busy === "share"}>
              {busy !== "share" && <Share className="size-4" />} Share image
            </Button>
            <ButtonLink href={`/write/${doc.id}`} variant="ghost" className="col-span-2 lg:col-span-1">
              <PenLine className="size-4" /> Keep editing
            </ButtonLink>
          </div>

          <p className="text-[13px] leading-relaxed text-muted">
            Sending creates a link to a sealed envelope your recipient taps to open. They get a copy of the letter as it is
            now — later edits to your draft won&rsquo;t change it.
          </p>

          {shares.length > 0 && (
            <section>
              <h2 className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-faint uppercase">Links for this letter</h2>
              <LinkList shares={shares} />
            </section>
          )}
        </div>
      </div>

      {/* True-size, off-screen render used for exports — same renderer, no UI chrome. */}
      <div aria-hidden style={{ position: "fixed", left: -10000, top: 0, pointerEvents: "none" }}>
        <Paper ref={exportRef} doc={doc} />
      </div>

      <Sheet open={downloadOpen} onClose={() => setDownloadOpen(false)} title="Download" description={`High resolution · ${doc.paper.size}`}>
        <div className="space-y-2">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              disabled={!!busy}
              onClick={() => run(f.id)}
              className="flex w-full items-center gap-4 rounded-2xl border border-line bg-surface px-4 py-3.5 text-left transition hover:bg-[#fffdf9] disabled:opacity-60"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent-deep">
                {busy === f.id ? <Loader2 className="size-5 animate-spin" /> : <f.icon className="size-5" />}
              </span>
              <span className="flex-1">
                <span className="block text-[15px] font-medium">{f.label}</span>
                <span className="block text-[13px] text-muted">{busy === f.id ? "Preparing your file…" : f.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </Sheet>

      <ShareLinkSheet open={linkOpen} onClose={() => setLinkOpen(false)} doc={doc} />
    </div>
  );
}
