"use client";

import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, CloudOff, LayoutTemplate, Loader2, Palette, PenLine, Send, Sticker, Type, X } from "lucide-react";
import { useLetterDraft, type SaveState } from "@/hooks/useLetterDraft";
import { letterLabel } from "@/lib/letter/document";
import { applyTemplate, type LetterTemplate } from "@/lib/letter/templates";
import type { DecorationPlacement, LetterDocument } from "@/lib/letter/types";
import { FittedPaper } from "@/components/paper/FittedPaper";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { DecoratePanel, HandwritingPanel, PaperPanel, TemplatesPanel, WritePanel } from "./panels";

type Tab = "write" | "style" | "paper" | "decorate" | "templates";
const TABS: { id: Tab; label: string; icon: typeof PenLine }[] = [
  { id: "write", label: "Write", icon: PenLine },
  { id: "style", label: "Handwriting", icon: Type },
  { id: "paper", label: "Paper", icon: Palette },
  { id: "decorate", label: "Decorate", icon: Sticker },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
];

function SaveIndicator({ state }: { state: SaveState }) {
  const map = {
    idle: { icon: Check, text: "Saved", cls: "text-muted" },
    saved: { icon: Check, text: "Saved", cls: "text-muted" },
    saving: { icon: Loader2, text: "Saving…", cls: "text-muted" },
    error: { icon: CloudOff, text: "Couldn't save", cls: "text-danger" },
  }[state];
  const I = map.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] ${map.cls}`} role="status" aria-live="polite">
      <I className={`size-3.5 ${state === "saving" ? "animate-spin" : ""}`} />
      <span className="hidden sm:inline">{map.text}</span>
    </span>
  );
}

/** Measures the available paper stage so the letter is always fully visible. */
function useStageHeight() {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [h, setH] = useState(0);
  useLayoutEffect(() => {
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.clientHeight));
    ro.observe(el);
    setH(el.clientHeight);
    return () => ro.disconnect();
  }, [el]);
  return [setEl, h] as const;
}

export function Editor({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { doc, status, saveState, update, flush } = useLetterDraft(id);
  const [mobileTab, setMobileTab] = useState<Tab | null>(null);
  const [desktopTab, setDesktopTab] = useState<Exclude<Tab, "write">>("style");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [overflow, setOverflow] = useState(false);
  const [stageRef, stageH] = useStageHeight();

  const onApplyTemplate = useCallback(
    (t: LetterTemplate) => {
      if (!doc) return;
      const before = doc;
      update((d) => applyTemplate(d, t));
      setSelectedId(null);
      toast(`“${t.name}” applied — your words were kept.`, {
        tone: "success",
        action: { label: "Undo", onClick: () => update(() => ({ ...before })) },
      });
    },
    [doc, update, toast],
  );

  const edit = useMemo(
    () => ({
      selectedId,
      onSelect: setSelectedId,
      onChange: (did: string, patch: Partial<DecorationPlacement>) =>
        update((d) => ({ ...d, decorations: d.decorations.map((x) => (x.id === did ? { ...x, ...patch } : x)) })),
      onRemove: (did: string) => {
        update((d) => ({ ...d, decorations: d.decorations.filter((x) => x.id !== did) }));
        setSelectedId(null);
      },
    }),
    [selectedId, update],
  );

  // Selecting a sticker on the paper surfaces its controls.
  const selectFromPaper = useCallback(
    (sid: string | null) => {
      setSelectedId(sid);
      if (sid) {
        setDesktopTab("decorate");
        setMobileTab((t) => (t === null ? null : "decorate"));
      }
    },
    [],
  );
  const paperEdit = useMemo(() => ({ ...edit, onSelect: selectFromPaper }), [edit, selectFromPaper]);

  // Typing straight onto the paper.
  const onMessageChange = useCallback((v: string) => update((d) => ({ ...d, message: v })), [update]);

  const goPreview = async () => {
    await flush();
    router.push(`/preview/${id}`);
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }
  if (status !== "ready" || !doc) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-serif text-4xl">{status === "missing" ? "This draft isn't here" : "We couldn't open your drafts"}</h1>
        <p className="max-w-sm text-muted">
          {status === "missing"
            ? "Drafts live only in the browser where they were written. It may have been deleted, or written on another device."
            : "Local storage seems unavailable in this browser window."}
        </p>
        <div className="flex gap-3">
          <ButtonLink href="/letters" variant="secondary">
            My letters
          </ButtonLink>
          <ButtonLink href="/write">Start a new letter</ButtonLink>
        </div>
      </div>
    );
  }

  const panel = (tab: Tab, compact = false) => {
    switch (tab) {
      case "write":
        return <WritePanel doc={doc} update={update} compact={compact} />;
      case "style":
        return <HandwritingPanel doc={doc} update={update} />;
      case "paper":
        return <PaperPanel doc={doc} update={update} />;
      case "decorate":
        return <DecoratePanel doc={doc} update={update} selectedId={selectedId} onSelect={setSelectedId} />;
      case "templates":
        return <TemplatesPanel doc={doc} onApply={onApplyTemplate} />;
    }
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* Top bar: close · status · send */}
      <header className="z-20 flex h-16 shrink-0 items-center gap-3 px-3 pt-[env(safe-area-inset-top)] sm:px-5">
        <Link
          href="/letters"
          onClick={() => flush()}
          aria-label="Close editor"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/70 bg-surface/85 shadow-[0_6px_16px_-10px_rgba(0,0,0,0.45)] transition hover:bg-white"
        >
          <X className="size-5" strokeWidth={1.7} />
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <p className="hand truncate text-[19px] leading-tight">{letterLabel(doc)}</p>
          <SaveIndicator state={saveState} />
        </div>
        <Button onClick={goPreview} size="sm" className="h-11 shrink-0 px-5">
          <Send className="size-4 -rotate-12" strokeWidth={1.8} /> Send
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Desktop left: writing */}
        <aside aria-label="Write" className="m-3 mt-0 hidden w-[340px] shrink-0 overflow-y-auto rounded-[28px] border border-white/70 bg-surface/80 px-6 py-6 shadow-card backdrop-blur lg:block xl:w-[380px]">
          <h2 className="mb-5 font-serif text-[26px]">Your words</h2>
          {panel("write")}
        </aside>

        {/* Centre: live paper */}
        <section aria-label="Letter preview" className="relative flex min-w-0 flex-1 flex-col">
          <div ref={stageRef} className="relative min-h-0 flex-1 overflow-hidden px-4 py-4 sm:px-8 sm:py-8">
            <div className="flex h-full items-start justify-center">
              {stageH > 0 && (
                <FittedPaper
                  doc={doc}
                  edit={paperEdit}
                  placeholder
                  onMessageChange={onMessageChange}
                  onOverflowChange={setOverflow}
                  maxHeight={Math.max(160, stageH - (typeof window !== "undefined" && window.innerWidth >= 640 ? 64 : 32))}
                />
              )}
            </div>
            <OverflowNotice doc={doc} show={overflow} update={update} />
          </div>
        </section>

        {/* Desktop right: customisation */}
        <aside aria-label="Customise" className="m-3 mt-0 hidden w-[360px] shrink-0 flex-col overflow-hidden rounded-[28px] border border-white/70 bg-surface/80 shadow-card backdrop-blur lg:flex xl:w-[400px]">
          <div role="tablist" aria-label="Customise" className="flex gap-1 border-b border-line px-3 py-2">
            {TABS.filter((t) => t.id !== "write").map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={desktopTab === t.id}
                onClick={() => setDesktopTab(t.id as Exclude<Tab, "write">)}
                className={`hand flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-[16px] transition ${
                  desktopTab === t.id ? "bg-ink text-white" : "text-muted hover:text-ink"
                }`}
              >
                <t.icon className="size-4" />
                <span className={desktopTab === t.id ? "" : "hidden xl:inline"}>{t.label === "Handwriting" ? "Ink" : t.label}</span>
              </button>
            ))}
          </div>
          <div role="tabpanel" className="flex-1 overflow-y-auto px-6 py-6">
            {panel(desktopTab)}
          </div>
        </aside>
      </div>

      {/* Mobile: docked panel + toolbar */}
      <div className="shrink-0 lg:hidden">
        <AnimatePresence initial={false}>
          {mobileTab && (
            <motion.div
              key="dock"
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden rounded-t-[26px] border-t border-line bg-surface shadow-[0_-12px_30px_-18px_rgba(41,39,34,0.25)]"
            >
              <div className="flex items-center justify-between px-5 pt-3">
                <h2 className="font-serif text-[24px]">{TABS.find((t) => t.id === mobileTab)?.label}</h2>
                <button
                  onClick={() => setMobileTab(null)}
                  aria-label="Close panel"
                  className="-mr-2 inline-flex size-10 items-center justify-center rounded-full text-muted hover:bg-black/5"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="max-h-[44dvh] overflow-y-auto overscroll-contain px-5 pt-2 pb-5">{panel(mobileTab, true)}</div>
            </motion.div>
          )}
        </AnimatePresence>
        <nav aria-label="Editor tools" className="flex justify-center bg-transparent px-3 pt-2 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div role="tablist" className="grid w-full max-w-md grid-cols-5 rounded-full border border-white/70 bg-surface/90 p-1 shadow-[0_14px_30px_-16px_rgba(0,0,0,0.4)] backdrop-blur">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={mobileTab === t.id}
                onClick={() => setMobileTab((cur) => (cur === t.id ? null : t.id))}
                className={`hand flex h-[52px] flex-col items-center justify-center gap-0.5 rounded-full text-[13px] transition ${
                  mobileTab === t.id ? "bg-[#dcdad4] text-ink" : "text-muted"
                }`}
              >
                <t.icon className="size-[18px]" strokeWidth={1.7} />
                {t.id === "style" ? "Ink" : t.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

function OverflowNotice({ doc, show, update }: { doc: LetterDocument; show: boolean; update: (fn: (d: LetterDocument) => LetterDocument) => void }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          role="status"
          className="absolute inset-x-3 bottom-3 mx-auto flex max-w-md flex-wrap items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-[13px] text-white shadow-lift sm:bottom-5"
        >
          <AlertTriangle className="size-4 shrink-0 text-[#F2C14E]" />
          <span className="flex-1">Your letter runs past the bottom of the page.</span>
          {doc.paper.size === "A5" && (
            <button
              className="rounded-full bg-white/15 px-3 py-1 font-medium hover:bg-white/25"
              onClick={() => update((d) => ({ ...d, paper: { ...d.paper, size: "A4" } }))}
            >
              Use A4
            </button>
          )}
          {doc.typography.fontSize > 14 && (
            <button
              className="rounded-full bg-white/15 px-3 py-1 font-medium hover:bg-white/25"
              onClick={() => update((d) => ({ ...d, typography: { ...d.typography, fontSize: Math.max(14, d.typography.fontSize - 2) } }))}
            >
              Smaller text
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
