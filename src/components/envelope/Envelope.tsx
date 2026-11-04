"use client";

import { forwardRef, useId, type ReactNode } from "react";
import { handwritingFamily } from "@/lib/fonts";
import type { LetterDocument } from "@/lib/letter/types";
import { FittedPaper } from "@/components/paper/FittedPaper";

/** Envelope palette — warm cream stock with a lavender liner and a burgundy wax seal. */
const C = {
  back: "#D8C3A2",
  backDeep: "#C9B08B",
  side: "#EBDCC3",
  sideShade: "#E2D0B3",
  bottom: "#F2E6D2",
  flap: "#F4E9D6",
  crease: "rgba(120, 92, 54, 0.22)",
  liner: "#E7DEF6",
  linerDot: "#F8F4FE",
};

function WaxSeal({ uid, half }: { uid: string; half?: "left" | "right" }) {
  // Irregular blob outline so it reads as poured wax, not a perfect circle.
  const blob =
    "M50 4c9 0 13 5 20 7s14 2 18 9 1 13 4 20 6 12 4 19-9 10-12 17-4 14-11 17-13 0-20 3-12 6-19 3-9-9-16-12-15-4-18-11 1-13-1-20-6-11-3-18 9-9 13-15 7-12 14-15 9-1 15-1Z";
  const clip = half === "left" ? `${uid}-cl` : half === "right" ? `${uid}-cr` : undefined;
  return (
    <svg viewBox="0 0 100 100" className="size-full overflow-visible" aria-hidden>
      <defs>
        <radialGradient id={`${uid}-wax`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#C2465A" />
          <stop offset="45%" stopColor="#9A2A3E" />
          <stop offset="100%" stopColor="#6A1626" />
        </radialGradient>
        <radialGradient id={`${uid}-in`} cx="60%" cy="65%" r="70%">
          <stop offset="0%" stopColor="#7D1C2E" />
          <stop offset="100%" stopColor="#A63348" />
        </radialGradient>
        {/* Jagged crack down the middle so the two halves break apart convincingly. */}
        <clipPath id={`${uid}-cl`}>
          <path d="M-10-10H52l-6 22 8 14-7 16 9 14-6 18 4 36H-10Z" />
        </clipPath>
        <clipPath id={`${uid}-cr`}>
          <path d="M110-10H52l-6 22 8 14-7 16 9 14-6 18 4 36H110Z" />
        </clipPath>
      </defs>
      <g clipPath={clip ? `url(#${clip})` : undefined}>
        <path d={blob} fill={`url(#${uid}-wax)`} />
        <circle cx="50" cy="51" r="29" fill={`url(#${uid}-in)`} />
        <circle cx="50" cy="51" r="29" fill="none" stroke="#5E1220" strokeOpacity=".5" strokeWidth="2" />
        <circle cx="50" cy="51" r="25" fill="none" stroke="#D86A7C" strokeOpacity=".35" strokeWidth="1" strokeDasharray="1.5 3" />
        {/* Embossed heart */}
        <path
          d="M50 66c-10-6.5-15-12-15-18 0-4.5 3.4-7.6 7.4-7.6 3.4 0 5.8 1.8 7.6 4.6 1.8-2.8 4.2-4.6 7.6-4.6 4 0 7.4 3.1 7.4 7.6 0 6-5 11.5-15 18Z"
          fill="#6E1828"
          stroke="#D46377"
          strokeOpacity=".55"
          strokeWidth="1.2"
        />
        <path d="M26 30c5-8 13-12 21-13" stroke="#fff" strokeOpacity=".32" strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

type EnvelopeProps = {
  doc: LetterDocument;
  recipientLabel?: string;
  children?: ReactNode;
};

/**
 * Layered paper envelope: back → letter → front pocket → flap → wax seal.
 * Every layer is a separate element so the opening can be choreographed.
 */
export const Envelope = forwardRef<HTMLDivElement, EnvelopeProps>(function Envelope({ doc, recipientLabel }, ref) {
  const uid = useId().replace(/:/g, "");
  return (
    <div ref={ref} className="relative w-full select-none" style={{ aspectRatio: "10 / 7", containerType: "inline-size", perspective: 1400 }}>
      {/* Back + interior liner */}
      <div
        data-env-part
        className="absolute inset-0 overflow-hidden rounded-[2.2cqw]"
        style={{ background: `linear-gradient(180deg, ${C.backDeep}, ${C.back} 40%)`, zIndex: 0 }}
      >
        <div
          className="absolute inset-x-[3%] top-[3%] h-[52%]"
          style={{
            background: `radial-gradient(circle, ${C.linerDot} 1.1px, transparent 1.4px) 0 0 / 9px 9px, ${C.liner}`,
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            opacity: 0.85,
          }}
        />
      </div>

      {/* The letter itself (rendered with the same renderer as everywhere else) */}
      <div
        data-letter
        aria-hidden
        className="absolute left-[6%] w-[88%] overflow-hidden rounded-[1cqw] bg-white"
        style={{ top: "5%", height: "90%", zIndex: 2, boxShadow: "0 -2px 10px rgba(60,40,20,0.12)" }}
      >
        <FittedPaper doc={doc} shadow={false} />
      </div>

      {/* Front pocket: two side flaps and a bottom flap */}
      <svg
        data-env-part
        viewBox="0 0 100 70"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
        style={{ zIndex: 3, filter: "drop-shadow(0 -1px 1.5px rgba(80,56,28,0.12))" }}
        aria-hidden
      >
        <defs>
          <linearGradient id={`${uid}-b`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.bottom} />
            <stop offset="1" stopColor="#EADCC4" />
          </linearGradient>
          <linearGradient id={`${uid}-sl`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={C.sideShade} />
            <stop offset="1" stopColor={C.side} />
          </linearGradient>
          <linearGradient id={`${uid}-sr`} x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor={C.sideShade} />
            <stop offset="1" stopColor={C.side} />
          </linearGradient>
        </defs>
        <path d="M0 1.2Q0 0 1.2 .8L47 37.5Q50 40 47 42L1.2 69.2Q0 70 0 68.8Z" fill={`url(#${uid}-sl)`} />
        <path d="M100 1.2Q100 0 98.8 .8L53 37.5Q50 40 53 42l45.8 27.2q1.2.8 1.2-.4Z" fill={`url(#${uid}-sr)`} />
        <path d="M0 70V68.4L45.6 35.6Q50 32.6 54.4 35.6L100 68.4V70Z" fill={`url(#${uid}-b)`} />
        <path d="M.6 68.4 45.6 35.6Q50 32.6 54.4 35.6L99.4 68.4" fill="none" stroke={C.crease} strokeWidth=".35" />
      </svg>

      {/* Recipient line, handwritten on the pocket */}
      {recipientLabel ? (
        <div
          data-env-part
          className="pointer-events-none absolute inset-x-0 bottom-[11%] text-center"
          style={{ zIndex: 3, fontFamily: handwritingFamily(doc.typography.fontFamily), color: "#4A3B2C", fontSize: "6.2cqw", lineHeight: 1 }}
        >
          {recipientLabel}
        </div>
      ) : null}

      {/* Top flap — rotates open on X. Two faces so the inside shows the liner. */}
      <div
        data-flap
        className="absolute inset-x-0 top-0 h-[58%]"
        style={{ zIndex: 4, transformOrigin: "50% 0%", transformStyle: "preserve-3d" }}
      >
        <svg viewBox="0 0 100 58" preserveAspectRatio="none" className="absolute inset-0 size-full" style={{ backfaceVisibility: "hidden", filter: "drop-shadow(0 1.5px 2px rgba(80,56,28,0.18))" }} aria-hidden>
          <defs>
            <linearGradient id={`${uid}-f`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#EFE2CC" />
              <stop offset="1" stopColor={C.flap} />
            </linearGradient>
          </defs>
          <path d="M0 0H100V1.5L54.5 54Q50 58.5 45.5 54L0 1.5Z" fill={`url(#${uid}-f)`} />
          <path d="M.5 1.5 45.5 54Q50 58.5 54.5 54L99.5 1.5" fill="none" stroke={C.crease} strokeWidth=".3" />
        </svg>
        <svg
          viewBox="0 0 100 58"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
          style={{ transform: "rotateX(180deg)", backfaceVisibility: "hidden" }}
          aria-hidden
        >
          <defs>
            <pattern id={`${uid}-lp`} width="3" height="3" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r=".38" fill={C.linerDot} />
            </pattern>
          </defs>
          <path d="M0 0H100V1.5L54.5 54Q50 58.5 45.5 54L0 1.5Z" fill={C.liner} />
          <path d="M0 0H100V1.5L54.5 54Q50 58.5 45.5 54L0 1.5Z" fill={`url(#${uid}-lp)`} />
        </svg>
      </div>

      {/* Wax seal, split in two halves for the break */}
      <div data-seal className="absolute left-1/2 w-[19%] -translate-x-1/2" style={{ top: "44%", aspectRatio: "1", zIndex: 5 }}>
        <div className="absolute inset-0" style={{ filter: "drop-shadow(0 2px 3px rgba(70,10,20,0.35))" }}>
          <div data-seal-left className="absolute inset-0">
            <WaxSeal uid={`${uid}l`} half="left" />
          </div>
          <div data-seal-right className="absolute inset-0">
            <WaxSeal uid={`${uid}r`} half="right" />
          </div>
        </div>
      </div>
    </div>
  );
});
