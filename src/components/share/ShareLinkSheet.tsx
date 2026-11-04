"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Link2, Mail, MessageCircle, MessageSquareText, Share2, ShieldCheck } from "lucide-react";
import type { ExpiryOption } from "@/lib/letter/schema";
import type { LetterDocument, LocalShare } from "@/lib/letter/types";
import { createShareLink, shareMessage, shareTargets, ShareError } from "@/lib/share-client";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const EXPIRY: { id: ExpiryOption; label: string }[] = [
  { id: "never", label: "Never" },
  { id: "1d", label: "1 day" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
];

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older/insecure contexts
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function ShareTargets({ share, doc }: { share: Pick<LocalShare, "url">; doc?: Pick<LetterDocument, "recipient"> }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);
  useEffect(() => setCanNative(typeof navigator !== "undefined" && !!navigator.share), []);
  const text = shareMessage(doc);
  const t = shareTargets(share.url, text);

  const copy = async () => {
    if (await copyText(share.url)) {
      setCopied(true);
      toast("Link copied", { tone: "success" });
      setTimeout(() => setCopied(false), 2000);
    } else toast("Couldn't copy — select the link and copy it manually.", { tone: "error" });
  };

  const native = async () => {
    try {
      await navigator.share({ title: "A letter for you", text, url: share.url });
    } catch (e) {
      if ((e as Error).name !== "AbortError") copy();
    }
  };

  const target = "flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-surface py-3 text-[12px] font-medium text-ink transition hover:bg-[#fffdf9] active:scale-[0.97]";
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface p-1.5 pl-4">
        <Link2 className="size-4 shrink-0 text-muted" />
        <input
          readOnly
          value={share.url}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Share link"
          className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none"
        />
        <Button size="sm" onClick={copy} className="shrink-0">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <a className={target} href={t.whatsapp} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="size-5 text-[#25A35A]" /> WhatsApp
        </a>
        <a className={target} href={t.sms}>
          <MessageSquareText className="size-5 text-[#3478F6]" /> Messages
        </a>
        <a className={target} href={t.email}>
          <Mail className="size-5 text-[#B8642B]" /> Email
        </a>
        {canNative ? (
          <button type="button" className={target} onClick={native}>
            <Share2 className="size-5 text-accent" /> More
          </button>
        ) : (
          <a className={target} href={share.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-5 text-accent" /> Open
          </a>
        )}
      </div>
    </div>
  );
}

export function ShareLinkSheet({
  open,
  onClose,
  doc,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  doc: LetterDocument;
  onCreated?: (s: LocalShare) => void;
}) {
  const [expiry, setExpiry] = useState<ExpiryOption>("never");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [share, setShare] = useState<LocalShare | null>(null);

  useEffect(() => {
    if (open) {
      setShare(null);
      setError(null);
    }
  }, [open]);

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const s = await createShareLink(doc, expiry);
      setShare(s);
      onCreated?.(s);
    } catch (e) {
      const err = e as ShareError;
      setError({ message: err.message, code: err.code });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={share ? "Your letter is sealed" : "Send as a link"}
      description={
        share
          ? "Send this link — they'll receive a sealed envelope to open."
          : "We'll seal a copy of this letter in an envelope only people with the link can open."
      }
    >
      {share ? (
        <div className="space-y-5">
          <ShareTargets share={share} doc={doc} />
          <p className="text-[13px] leading-relaxed text-muted">
            {share.expiresAt
              ? `This link stops working on ${new Date(share.expiresAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}. `
              : ""}
            You can revoke it any time from <strong className="font-medium text-ink">Letters → Sent</strong>.
          </p>
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Done
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-[13px] font-medium text-muted">Link expires</p>
            <div role="radiogroup" aria-label="Link expiry" className="flex flex-wrap gap-2">
              {EXPIRY.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  role="radio"
                  aria-checked={expiry === e.id}
                  onClick={() => setExpiry(e.id)}
                  className={`h-9 rounded-full px-4 text-[13px] font-medium transition ${
                    expiry === e.id ? "bg-ink text-white" : "border border-line bg-surface text-muted hover:text-ink"
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 rounded-2xl bg-cream p-4 text-[13px] leading-relaxed text-[#5d574d]">
            <p className="flex gap-2.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#8a6d3b]" />
              <span>
                <strong className="font-medium text-ink">Anyone with the link can open and forward this letter.</strong> It isn&rsquo;t
                listed or searchable anywhere.
              </span>
            </p>
            <p className="pl-6.5">
              We save a snapshot of the letter exactly as it is now — editing your draft later won&rsquo;t change what they receive.
            </p>
            <p className="pl-6.5">You can revoke the link any time from Letters → Sent, on any device you&rsquo;re signed in to.</p>
          </div>

          {error && (
            <p role="alert" className="rounded-2xl border border-[#f3d2cd] bg-[#fff6f4] px-4 py-3 text-[13px] text-danger">
              {error.code === "not_configured"
                ? "Link sharing isn't set up on this server yet (no database is configured). You can still download or share your letter as an image or PDF."
                : error.message}
            </p>
          )}

          <Button className="w-full" size="lg" onClick={create} loading={busy}>
            {busy ? "Sealing your envelope…" : error ? "Try again" : "Seal & create link"}
          </Button>
        </div>
      )}
    </Sheet>
  );
}
