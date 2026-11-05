"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { handwritingFamily } from "@/lib/fonts";
import { getTemplate, templatePreviewDoc } from "@/lib/letter/templates";
import { FittedPaper } from "@/components/paper/FittedPaper";
import { DecorationArt } from "@/components/decorations/DecorationArt";
import { SketchGlobe } from "@/components/sketch/SketchGlobe";
import { Button, ButtonLink } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/Logo";

const markOnboarded = () => {
  document.cookie = `dearly_onboarded=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
};

const LINE = "I hope today is gentle with you, and that you know how loved you are.";

function TypingLetter() {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? LINE.length : 0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setN((v) => (v >= LINE.length + 18 ? 0 : v + 1)), 70);
    return () => clearInterval(t);
  }, [reduce]);
  const family = handwritingFamily("dancing-script");
  return (
    <div
      className="relative w-[min(74vw,300px)] rotate-[-2deg] rounded-[6px] border border-[#cfccc5] bg-[#FBFAF7] px-6 py-7 shadow-[0_22px_40px_-24px_rgba(0,0,0,0.45)]"
      style={{
        aspectRatio: "3 / 3.7",
        backgroundImage: "linear-gradient(to bottom, transparent 33px, rgba(28,27,25,0.12) 33px)",
        backgroundSize: "100% 34px",
        backgroundPosition: "0 28px",
      }}
    >
      <p style={{ fontFamily: family, fontSize: 26, lineHeight: "34px", color: "#24221f" }}>Dear you,</p>
      <p style={{ fontFamily: family, fontSize: 22, lineHeight: "34px", color: "#24221f", marginTop: 6 }}>
        {LINE.slice(0, Math.min(n, LINE.length))}
        <span className="ml-0.5 inline-block h-[22px] w-px translate-y-1 animate-pulse bg-ink" />
      </p>
      <div className="absolute right-4 bottom-4 w-12 rotate-6">
        <DecorationArt type="stamp-flower" />
      </div>
    </div>
  );
}

function Stationery() {
  const doc = templatePreviewDoc(getTemplate("best-friends")!);
  return (
    <div className="relative w-[min(70vw,270px)]">
      <div className="rotate-[4deg]">
        <FittedPaper doc={doc} />
      </div>
      {[
        { t: "rose", c: "-left-8 -top-6 w-20 -rotate-12" },
        { t: "washi-mint", c: "-right-10 top-10 w-28 rotate-[24deg]" },
        { t: "heart", c: "-right-5 -bottom-4 w-16 rotate-12" },
      ].map((s, i) => (
        <motion.div
          key={s.t}
          className={`absolute ${s.c}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25 + i * 0.12, type: "spring", stiffness: 260, damping: 16 }}
          style={{ filter: "drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff) drop-shadow(0 6px 8px rgba(0,0,0,.15))" }}
        >
          <DecorationArt type={s.t} />
        </motion.div>
      ))}
    </div>
  );
}

const SLIDES = [
  { art: TypingLetter, title: "Some things are better written.", body: "Dearly turns your words into letters that feel like real paper — and real post." },
  { art: Stationery, title: "Make it yours.", body: "Pick paper, ink and edges, then decorate with flowers, washi tape and stamps." },
  { art: () => <SketchGlobe className="w-[min(82vw,340px)]" />, title: "Send it anywhere.", body: "They receive a sealed envelope that opens with a tap. No app, no account needed." },
];

export function Onboarding() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const last = i === SLIDES.length - 1;
  const go = (next: number) => {
    if (next < 0 || next >= SLIDES.length) return;
    setDir(next > i ? 1 : -1);
    setI(next);
  };
  const finish = (to: string) => {
    markOnboarded();
    router.push(to);
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(i + 1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(i - 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(i + 1);
      if (e.key === "ArrowLeft") go(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const Art = SLIDES[i].art;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pt-[max(18px,env(safe-area-inset-top))] pb-[max(22px,env(safe-area-inset-bottom))]">
      <header className="flex h-14 items-center justify-between">
        <span className="inline-flex items-center gap-2">
          <LogoMark className="size-7" />
          <span className="hand text-[24px]">Dearly</span>
        </span>
        {!last && (
          <button onClick={() => finish("/signup")} className="hand rounded-full px-3 py-1.5 text-[17px] text-muted hover:text-ink">
            Skip
          </button>
        )}
      </header>

      <motion.div
        className="flex flex-1 cursor-grab touch-pan-y flex-col active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        onDragEnd={onDragEnd}
        aria-roledescription="carousel"
      >
        <AnimatePresence mode="wait" custom={dir}>
          <motion.section
            key={i}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${SLIDES.length}`}
            className="flex flex-1 flex-col"
          >
            <div className="flex min-h-[340px] flex-1 items-center justify-center py-6">
              <Art />
            </div>
            <h1 className="font-serif text-[40px] leading-[1.05]">{SLIDES[i].title}</h1>
            <p className="mt-3 text-[16px] leading-relaxed text-muted">{SLIDES[i].body}</p>
          </motion.section>
        </AnimatePresence>
      </motion.div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div className="flex gap-2" role="tablist" aria-label="Onboarding steps">
          {SLIDES.map((_, k) => (
            <button
              key={k}
              role="tab"
              aria-selected={k === i}
              aria-label={`Step ${k + 1}`}
              onClick={() => go(k)}
              className={`h-2 rounded-full transition-all ${k === i ? "w-7 bg-ink" : "w-2 bg-[#c9c6bf]"}`}
            />
          ))}
        </div>
        {!last && (
          <Button onClick={() => go(i + 1)} size="lg" className="min-w-[132px]">
            Next <ArrowRight className="size-4" />
          </Button>
        )}
      </div>

      {last && (
        <div className="mt-6 grid gap-3">
          <Button size="lg" onClick={() => finish("/signup")}>
            Create an account
          </Button>
          <ButtonLink href="/login" variant="secondary" size="lg" onClick={markOnboarded}>
            I already have an account
          </ButtonLink>
        </div>
      )}
      <p className="sr-only">
        <Link href="/login">Sign in</Link>
      </p>
    </div>
  );
}
