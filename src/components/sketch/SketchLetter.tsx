"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { handwritingFamily } from "@/lib/fonts";

const INK = "#24221f";

/**
 * The onboarding's self-writing letter, redrawn as a pencil sketch for Home:
 * wobbly ink outline, pencil-ruled lines, a sketched stamp, a pencil and a paper plane.
 * The whole letter is a link that starts a new letter.
 */
export function SketchLetter({ name }: { name: string }) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const line = "Who will you write to today?";
  const HOLD = 26; // ticks to pause on the finished line before rewriting
  const [n, setN] = useState(reduce ? line.length : 0);

  useEffect(() => {
    if (reduce) {
      setN(line.length);
      return;
    }
    const t = setInterval(() => setN((v) => (v >= line.length + HOLD ? 0 : v + 1)), 85);
    return () => clearInterval(t);
  }, [reduce, line.length]);

  const typed = line.slice(0, Math.min(n, line.length));
  const done = n >= line.length;
  const family = handwritingFamily("dancing-script");

  return (
    <div className="relative mx-auto w-full max-w-[380px] px-6 py-10">
      {/* Sketchy filter shared by the outlines */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id={`${uid}-sk`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="5" />
          <feDisplacementMap in="SourceGraphic" scale="2.2" />
        </filter>
      </svg>

      {/* Paper plane looping beside the letter */}
      <motion.svg
        viewBox="0 0 120 60"
        className="pointer-events-none absolute -top-1 -left-2 w-28"
        aria-hidden
        animate={reduce ? undefined : { x: [0, 6, 0], y: [0, -5, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: `url(#${uid}-sk)` }}
      >
        <path d="M6 48c18 6 34-2 40-14s-6-22-14-12 6 22 30 16" fill="none" stroke={INK} strokeOpacity=".35" strokeWidth="1.4" strokeDasharray="3 5" strokeLinecap="round" />
        <g transform="translate(80 10) rotate(-12)">
          <path d="M0 14 30 0 20 22 13 16Z" fill="#fff" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M13 16 30 0" stroke={INK} strokeWidth="1.4" />
        </g>
      </motion.svg>

      {/* Clouds drifting, as on the globe */}
      <motion.svg
        viewBox="0 0 70 40"
        className="pointer-events-none absolute top-6 -right-3 w-16"
        aria-hidden
        animate={reduce ? undefined : { x: [0, -8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M16 34c-7 0-11-4-11-8.6s3.8-8 8.8-8c1.6-4.6 5.8-7.6 10.8-7.6 6.2 0 11 4.6 11 10.6 4.6 0 7.6 2.8 7.6 6.4s-3.2 7.2-8 7.2Z" fill="#fff" stroke={INK} strokeWidth="1.4" />
      </motion.svg>

      <Link
        href="/write"
        aria-label="Start a new letter"
        className="group relative block rotate-[-3deg] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:rotate-[-2deg] active:scale-[0.98]"
      >
        {/* Text is sized from the card (cqw) so each written line sits on a ruled line at any size. */}
        <div className="relative" style={{ aspectRatio: "3 / 3.6", containerType: "inline-size" }}>
          {/* Paper with a wobbly pencil outline and ruled lines */}
          <svg viewBox="0 0 300 360" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
            <rect x="6" y="10" width="292" height="350" rx="6" fill="#000" opacity=".06" />
            <g filter={`url(#${uid}-sk)`}>
              <rect x="2" y="2" width="292" height="350" rx="6" fill="#FBFAF7" stroke={INK} strokeWidth="2.4" />
              {Array.from({ length: 8 }).map((_, i) => (
                <path
                  key={i}
                  d={`M22 ${92 + i * 32}q70 ${i % 2 ? 1.5 : -1.5} 140 0t118 0`}
                  fill="none"
                  stroke={INK}
                  strokeOpacity=".16"
                  strokeWidth="1.2"
                />
              ))}
              {/* Sketched stamp with a postmark */}
              <g transform="translate(222 262) rotate(6)">
                <rect x="0" y="0" width="48" height="58" rx="2" fill="#fff" stroke={INK} strokeWidth="1.6" strokeDasharray="4 2.5" />
                <rect x="6" y="6" width="36" height="46" fill="none" stroke={INK} strokeWidth="1.2" />
                <path d="M24 40c-7-4.5-10.5-8.4-10.5-12.4 0-3 2.3-5.2 5.1-5.2 2.3 0 4 1.2 5.4 3.2 1.4-2 3.1-3.2 5.4-3.2 2.8 0 5.1 2.2 5.1 5.2 0 4-3.5 7.9-10.5 12.4Z" fill="#8E2436" />
              </g>
              <g transform="translate(196 292)" stroke={INK} strokeOpacity=".45" fill="none" strokeWidth="1.3">
                <circle cx="0" cy="0" r="18" />
                <path d="M-30-6c6-4 10 4 16 0M-30 4c6-4 10 4 16 0" />
              </g>
            </g>
          </svg>

          {/* The handwriting itself (real text). One ruled line = 32/300 of the card width. */}
          <div
            className="absolute"
            style={{ left: "8%", right: "6%", top: "19.5cqw", fontFamily: family, color: INK, lineHeight: "10.667cqw" }}
          >
            <p style={{ fontSize: "8.4cqw" }}>Dear {name},</p>
            <p style={{ fontSize: "7.2cqw" }}>
              {typed}
              {!reduce && (
                <span
                  aria-hidden
                  className={`ml-0.5 inline-block h-[0.9em] w-px translate-y-[0.12em] bg-ink ${done ? "animate-pulse" : ""}`}
                />
              )}
            </p>
            <motion.p
              className="text-right"
              style={{ fontSize: "6.6cqw" }}
              initial={false}
              animate={{ opacity: done ? 1 : 0, y: done ? 0 : 4 }}
              transition={{ duration: 0.5 }}
            >
              — your next letter
            </motion.p>
          </div>
        </div>

        {/* A pencil resting against the letter */}
        <svg
          viewBox="0 0 160 40"
          className="pointer-events-none absolute -right-8 -bottom-6 w-40 rotate-[-28deg]"
          aria-hidden
          style={{ filter: `url(#${uid}-sk)` }}
        >
          <path d="M18 8h112v24H18Z" fill="#fff" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M18 16h112M18 24h112" stroke={INK} strokeOpacity=".35" strokeWidth="1.2" />
          <path d="M130 8 154 20 130 32Z" fill="#F1E6D4" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M146 16 154 20 146 24Z" fill={INK} />
          <path d="M4 8h14v24H4c-2 0-3-1-3-3V11c0-2 1-3 3-3Z" fill="#F6C9D2" stroke={INK} strokeWidth="2" />
          <path d="M14 8v24" stroke={INK} strokeWidth="2" />
        </svg>
      </Link>
    </div>
  );
}
