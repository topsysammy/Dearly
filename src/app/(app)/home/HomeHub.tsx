"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, MailOpen, Send, SlidersHorizontal } from "lucide-react";
import { useLocalLibrary } from "@/hooks/useLocalLibrary";
import { letterLabel } from "@/lib/letter/document";
import { useUser } from "@/components/app/UserProvider";
import { SketchLetter } from "@/components/sketch/SketchLetter";
import { FittedPaper } from "@/components/paper/FittedPaper";
import { Sheet } from "@/components/ui/Sheet";

const SEEN_KEY = "dearly-activity-seen";

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? "Still up" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function ago(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

const roundBtn =
  "relative inline-flex size-12 items-center justify-center rounded-full border border-white/70 bg-surface/80 text-ink shadow-[0_8px_20px_-14px_rgba(0,0,0,0.5)] backdrop-blur transition hover:bg-white";

export function HomeHub() {
  const { user } = useUser();
  const { letters, shares } = useLocalLibrary();
  const [activityOpen, setActivityOpen] = useState(false);
  const [seenAt, setSeenAt] = useState<number>(Date.now());
  const [hello, setHello] = useState("Hello");

  useEffect(() => {
    setHello(greeting());
    try {
      setSeenAt(Number(localStorage.getItem(SEEN_KEY) ?? 0));
    } catch {
      setSeenAt(0);
    }
  }, []);

  const opened = useMemo(
    () => shares.filter((s) => s.firstOpenedAt).sort((a, b) => b.firstOpenedAt!.localeCompare(a.firstOpenedAt!)),
    [shares],
  );
  const unseen = opened.some((s) => new Date(s.firstOpenedAt!).getTime() > seenAt);

  const openActivity = () => {
    setActivityOpen(true);
    const now = Date.now();
    setSeenAt(now);
    try {
      localStorage.setItem(SEEN_KEY, String(now));
    } catch {}
  };

  const drafts = (letters ?? []).slice(0, 3);
  const firstName = user.name.split(" ")[0];

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-md flex-col px-5 pt-[max(16px,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between py-2">
        <Link
          href="/letters"
          className="hand inline-flex h-12 items-center gap-2 rounded-full border border-white/70 bg-surface/80 px-4 text-[18px] shadow-[0_8px_20px_-14px_rgba(0,0,0,0.5)] backdrop-blur"
          aria-label={`${letters?.length ?? 0} letters`}
        >
          <MailOpen className="size-[18px]" strokeWidth={1.7} />
          <span className="font-sans text-[16px] tabular-nums">{letters?.length ?? "–"}</span>
        </Link>
        <div className="flex gap-2">
          <button className={roundBtn} onClick={openActivity} aria-label={unseen ? "Activity — new" : "Activity"}>
            <Bell className="size-[18px]" strokeWidth={1.7} />
            {unseen && <span className="absolute top-2.5 right-3 size-2 rounded-full bg-wax ring-2 ring-surface" />}
          </button>
          <Link href="/profile" className={roundBtn} aria-label="Settings">
            <SlidersHorizontal className="size-[18px]" strokeWidth={1.7} />
          </Link>
        </div>
      </header>

      <p className="hand mt-4 text-center text-[20px] text-muted">
        {hello}, {firstName}.
      </p>

      <div className="flex flex-1 items-center justify-center py-2">
        <SketchLetter name={firstName} />
      </div>

      <div className="flex flex-col items-center gap-3 pb-4">
        <Link
          href="/write"
          className="hand inline-flex h-14 items-center gap-3 rounded-full border border-white bg-surface px-8 text-[22px] text-ink shadow-[0_14px_30px_-16px_rgba(0,0,0,0.45)] transition hover:-translate-y-0.5 hover:bg-white active:scale-[0.98]"
        >
          <Send className="size-5 -rotate-12" strokeWidth={1.7} /> Write a letter
        </Link>
        <Link href="/templates" className="hand text-[17px] text-muted underline decoration-1 underline-offset-4 hover:text-ink">
          or start from a template
        </Link>
      </div>

      {drafts.length > 0 && (
        <section className="mt-10">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-serif text-[26px]">Continue writing</h2>
            <Link href="/letters" className="hand text-[16px] text-muted hover:text-ink">
              See all
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {drafts.map((d) => (
              <Link key={d.id} href={`/write/${d.id}`} className="group block" aria-label={`Continue ${letterLabel(d)}`}>
                <div className="transition group-hover:-translate-y-0.5">
                  <FittedPaper doc={d} />
                </div>
                <p className="mt-2 truncate text-[12px] text-muted">{letterLabel(d)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Sheet open={activityOpen} onClose={() => setActivityOpen(false)} title="Activity" description="When someone opens a letter you sent, it shows up here.">
        {opened.length === 0 ? (
          <p className="hand py-6 text-center text-[18px] text-muted">No envelopes opened yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {opened.map((s) => (
              <li key={s.token} className="flex items-center gap-3 py-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cream">
                  <MailOpen className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px]">
                    <span className="font-medium">{s.label}</span> was opened
                  </p>
                  <p className="text-[12px] text-muted">
                    {ago(s.firstOpenedAt!)}
                    {s.openCount && s.openCount > 1 ? ` · opened ${s.openCount} times` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Sheet>
    </div>
  );
}
