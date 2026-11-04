"use client";

import { useState } from "react";
import Link from "next/link";
import { Ban, Check, Copy, Eye } from "lucide-react";
import type { LocalShare, ShareStatus } from "@/lib/letter/types";
import { effectiveStatus, revokeShareLink } from "@/lib/share-client";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import { copyText } from "./ShareLinkSheet";

const STATUS: Record<ShareStatus, { label: string; cls: string }> = {
  active: { label: "Active", cls: "bg-sage text-[#2f6b45]" },
  revoked: { label: "Revoked", cls: "bg-black/[0.05] text-muted" },
  expired: { label: "Expired", cls: "bg-cream text-[#8a6d3b]" },
  missing: { label: "Unavailable", cls: "bg-black/[0.05] text-muted" },
};

const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export function LinkList({ shares, showLabel }: { shares: LocalShare[]; showLabel?: boolean }) {
  const { toast } = useToast();
  const [confirm, setConfirm] = useState<LocalShare | null>(null);
  const [busy, setBusy] = useState(false);

  const revoke = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      await revokeShareLink(confirm);
      toast("Link revoked — the envelope can no longer be opened.", { tone: "success" });
      setConfirm(null);
    } catch (e) {
      toast((e as Error).message, { tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-white/80 bg-surface/90 shadow-card">
        {shares.map((s) => {
          const st = effectiveStatus(s);
          const active = st === "active";
          return (
            <li key={s.token} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS[st].cls}`}>{STATUS[st].label}</span>
                  {s.firstOpenedAt && active && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-deep">
                      <Check className="size-3" /> Opened{s.openCount && s.openCount > 1 ? ` ×${s.openCount}` : ""}
                    </span>
                  )}
                </div>
                {showLabel && <p className="mt-1 truncate text-[14px] font-medium">{s.label}</p>}
                <p className="mt-0.5 truncate text-[12px] text-muted">
                  Sent {fmt(s.createdAt)}
                  {s.expiresAt ? ` · ${st === "expired" ? "expired" : "expires"} ${fmt(s.expiresAt)}` : " · no expiry"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {active && (
                  <>
                    <button
                      type="button"
                      onClick={async () => toast((await copyText(s.url)) ? "Link copied" : "Couldn't copy link", { tone: "success" })}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium hover:bg-black/[0.04]"
                    >
                      <Copy className="size-3.5" /> Copy
                    </button>
                    <Link
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open as recipient"
                      title="Open as recipient"
                      className="inline-flex size-9 items-center justify-center rounded-full hover:bg-black/[0.04]"
                    >
                      <Eye className="size-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setConfirm(s)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-danger hover:bg-[#fff5f3]"
                    >
                      <Ban className="size-3.5" /> Revoke
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <Sheet open={!!confirm} onClose={() => setConfirm(null)} title="Revoke this link?">
        <p className="text-[15px] leading-relaxed text-muted">
          Anyone who opens it afterwards will see that the letter is no longer available. This can&rsquo;t be undone, but you
          can always share the letter again with a new link.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirm(null)}>
            Keep it
          </Button>
          <Button variant="danger" className="flex-1" onClick={revoke} loading={busy}>
            Revoke link
          </Button>
        </div>
      </Sheet>
    </>
  );
}
