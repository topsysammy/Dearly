"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import type { LetterDocument } from "@/lib/letter/types";
import { FittedPaper } from "@/components/paper/FittedPaper";
import { Envelope } from "./Envelope";

type Stage = "closed" | "opening" | "revealed";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * The recipient moment: a sealed envelope that opens on tap, click, Enter or Space.
 * Used full-screen on /letter/[token] and as a small demo on the homepage.
 */
export function EnvelopeExperience({
  doc,
  variant = "page",
  onOpened,
  readingFooter,
}: {
  doc: LetterDocument;
  variant?: "page" | "demo";
  onOpened?: () => void;
  readingFooter?: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>("closed");
  const [round, setRound] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const busy = useRef(false);
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const recipient = doc.recipient?.trim();

  const reveal = useCallback(() => {
    busy.current = false;
    setStage("revealed");
    onOpened?.();
  }, [onOpened]);

  const open = useCallback(async () => {
    if (busy.current || stage !== "closed") return;
    busy.current = true;
    setStage("opening");

    // If anything goes wrong (or a tab is backgrounded), the letter must still appear.
    const failsafe = setTimeout(reveal, reduce ? 800 : 7000);
    try {
      if (reduce) {
        await animate(scope.current, { opacity: 0 }, { duration: 0.35 });
      } else {
        const root = scope.current;
        // 1 — the envelope acknowledges the touch
        await animate(root, { scale: [1, 0.965, 1.012, 1], rotate: [0, -0.8, 0.4, 0] }, { duration: 0.5, ease: "easeOut" });
        // 2 — the wax seal swells and cracks apart
        await animate("[data-seal]", { scale: 1.1 }, { duration: 0.16, ease: "easeOut" });
        await Promise.all([
          animate("[data-seal-left]", { x: "-46%", y: "34%", rotate: -32, opacity: 0 }, { duration: 0.6, ease: [0.4, 0, 0.2, 1] }),
          animate("[data-seal-right]", { x: "46%", y: "40%", rotate: 28, opacity: 0 }, { duration: 0.6, ease: [0.4, 0, 0.2, 1] }),
        ]);
        // 3 — the flap lifts; it tucks behind the letter once past vertical
        const flap = root.querySelector<HTMLElement>("[data-flap]");
        const flapAnim = animate("[data-flap]", { rotateX: 180 }, { duration: 0.85, ease: [0.65, 0, 0.35, 1] });
        await sleep(420);
        if (flap) flap.style.zIndex = "1";
        await flapAnim;
        // 4 — the letter slides out
        await animate("[data-letter]", { y: "-62%" }, { duration: 1.05, ease: [0.22, 1, 0.36, 1] });
        // 5 — the envelope falls away as the letter rises to be read
        await Promise.all([
          animate("[data-env-part], [data-flap]", { y: 70, opacity: 0 }, { duration: 0.6, ease: [0.4, 0, 1, 1] }),
          animate("[data-letter]", { y: "-80%", scale: 1.06, opacity: 0 }, { duration: 0.6, ease: [0.4, 0, 0.2, 1] }),
        ]);
      }
    } catch {
      // fall through to reveal
    }
    clearTimeout(failsafe);
    reveal();
  }, [animate, reduce, reveal, scope, stage]);

  // Replay: remount a fresh, sealed envelope then open it automatically.
  const replay = () => {
    busy.current = false;
    setAutoplay(true);
    setRound((r) => r + 1);
    setStage("closed");
    if (variant === "page") window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  useEffect(() => {
    if (!autoplay || stage !== "closed") return;
    const t = setTimeout(() => {
      setAutoplay(false);
      open();
    }, 750);
    return () => clearTimeout(t);
  }, [autoplay, stage, open, round]);

  const demo = variant === "demo";

  return (
    <AnimatePresence mode="wait">
      {stage !== "revealed" ? (
        <motion.div
          key={`env-${round}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full flex-col items-center"
        >
          {!demo && (
            <div
              className={`mb-10 text-center transition-opacity duration-500 sm:mb-12 ${stage === "opening" ? "opacity-0" : "opacity-100"}`}
            >
              <p className="hand text-[20px] text-muted">
                {recipient ? `For ${recipient}` : "Special delivery"}
              </p>
              <h1 className="mt-2 font-serif text-[44px] leading-[1.05] sm:text-[58px]">You&rsquo;ve received a letter.</h1>
              <p className="mt-3 text-[17px] text-muted">Someone has written something for you.</p>
            </div>
          )}

          <motion.div
            className={`relative ${demo ? "w-full max-w-[340px]" : "w-[min(86vw,460px)]"}`}
            animate={stage === "closed" && !reduce ? { y: [0, -7, 0] } : { y: 0 }}
            transition={stage === "closed" && !reduce ? { duration: 4.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
          >
            <button
              type="button"
              onClick={open}
              disabled={stage !== "closed"}
              aria-label={recipient ? `Open the letter for ${recipient}` : "Open the letter"}
              aria-describedby={`hint-${round}`}
              className="group block w-full cursor-pointer rounded-[3%] outline-offset-8 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:rotate-[-0.6deg] disabled:cursor-default"
            >
              <div ref={scope}>
                <Envelope doc={doc} recipientLabel={recipient ? `for ${recipient}` : undefined} />
              </div>
            </button>
            {/* Soft contact shadow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-7 left-[8%] h-6 w-[84%] rounded-[50%] bg-[#5b4325]/20 blur-xl transition-opacity duration-500"
              style={{ opacity: stage === "opening" ? 0 : 1 }}
            />
          </motion.div>

          <p
            id={`hint-${round}`}
            className={`text-center text-muted transition-opacity duration-300 ${demo ? "mt-8 text-sm" : "mt-14 text-[15px]"} ${
              stage === "opening" ? "opacity-0" : "opacity-100"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-wax/50 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-wax" />
              </span>
              Tap the envelope to open
            </span>
          </p>
        </motion.div>
      ) : (
        <motion.div
          key={`letter-${round}`}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduce ? 0.4 : 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`flex w-full flex-col items-center ${demo ? "" : "pt-2"}`}
        >
          <article
            aria-label={recipient ? `Letter for ${recipient}` : "Your letter"}
            className={demo ? "w-full max-w-[300px]" : "w-full max-w-[680px]"}
          >
            <FittedPaper doc={doc} />
          </article>
          <div className={`flex flex-wrap items-center justify-center gap-3 ${demo ? "mt-6" : "mt-10"}`}>
            <button
              type="button"
              onClick={replay}
              className="hand inline-flex h-11 items-center gap-2 rounded-full border border-white/80 bg-surface px-5 text-[18px] text-ink shadow-card transition hover:bg-white"
            >
              <RotateCcw className="size-4" /> Replay animation
            </button>
            {readingFooter}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
