"use client";

import { useId } from "react";
import { getDecorationMeta, type DecorationType } from "@/lib/decorations/catalog";

const HEART = "M50 86C22 67 5 50 5 29 5 15 16 5 29 5c9 0 16 5 21 13 5-8 12-13 21-13 13 0 24 10 24 24 0 21-17 38-45 57Z";

function perforation(w: number, h: number, r: number, step: number) {
  const holes: [number, number][] = [];
  for (let x = step / 2; x < w; x += step) holes.push([x, 0], [x, h]);
  for (let y = step / 2; y < h; y += step) holes.push([0, y], [w, y]);
  return holes.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={r} fill="#000" />);
}

function DaisyShape({ cx, cy, r, petal = "#FFFFFF", center = "#F2C14E" }: { cx: number; cy: number; r: number; petal?: string; center?: string }) {
  return (
    <g>
      {Array.from({ length: 10 }).map((_, i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy - r * 0.55}
          rx={r * 0.2}
          ry={r * 0.48}
          fill={petal}
          stroke="#E4D6C1"
          strokeWidth={r * 0.03}
          transform={`rotate(${i * 36} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.24} fill={center} />
      <circle cx={cx - r * 0.06} cy={cy - r * 0.06} r={r * 0.08} fill="#F8DA8A" />
    </g>
  );
}

function Art({ type, uid }: { type: DecorationType; uid: string }) {
  switch (type) {
    case "heart":
      return (
        <>
          <path d={HEART} fill="#E8667A" />
          <path d="M28 17c-7 0-12 6-12 13" stroke="#fff" strokeOpacity=".55" strokeWidth="5" strokeLinecap="round" fill="none" />
        </>
      );
    case "heart-outline":
      return (
        <g fill="none" stroke="#C2415A" strokeLinecap="round" strokeLinejoin="round">
          <path d={HEART} strokeWidth="4.5" />
          <path d="M50 80C25 62 11 47 11 30 11 19 19 11 29 11c8 0 15 5 21 14" strokeWidth="1.6" strokeOpacity=".6" />
        </g>
      );
    case "heart-trio":
      return (
        <>
          <path d={HEART} fill="#F4A6B8" transform="translate(4 22) scale(.5)" />
          <path d={HEART} fill="#E8667A" transform="translate(50 6) scale(.68) rotate(8 50 45)" />
          <path d={HEART} fill="#C9B8F0" transform="translate(112 30) scale(.42) rotate(-12 50 45)" />
        </>
      );
    case "rose":
      return (
        <>
          <path d="M50 70C46 86 40 98 30 106" stroke="#5E8A62" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M44 84c-14-6-24-2-30 6 12 4 22 2 30-6Z" fill="#6B9A6F" />
          <path d="M47 92c12-10 24-10 32-4-10 8-22 9-32 4Z" fill="#7FAE82" />
          <circle cx="50" cy="40" r="32" fill="#D9536B" />
          <path d="M22 44c4 18 18 28 28 28s25-10 28-28c-8 10-17 14-28 14S30 54 22 44Z" fill="#B83A55" />
          <path d="M50 22c-12 0-20 8-20 18s9 16 20 16 18-7 18-15-6-13-14-13-12 5-12 10 4 8 9 8" stroke="#9E2C46" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M34 22c6-6 14-8 22-6" stroke="#F08A9C" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      );
    case "daisy":
      return <DaisyShape cx={50} cy={50} r={46} />;
    case "sprig":
      return (
        <g>
          <path d="M40 136C38 100 42 60 50 8" stroke="#6E8F5E" strokeWidth="3" fill="none" strokeLinecap="round" />
          {[
            [44, 112, -50],
            [40, 92, 40],
            [45, 74, -48],
            [43, 56, 42],
            [48, 38, -44],
            [47, 22, 38],
          ].map(([x, y, r], i) => (
            <ellipse key={i} cx={x + (r > 0 ? 12 : -12)} cy={y} rx="14" ry="6.5" fill={i % 2 ? "#8BAA7A" : "#7A9C6A"} transform={`rotate(${r} ${x} ${y})`} />
          ))}
        </g>
      );
    case "tulip":
      return (
        <>
          <path d="M35 128V56" stroke="#5E8A62" strokeWidth="4" strokeLinecap="round" />
          <path d="M35 118c-16-6-24-22-24-40 14 8 22 22 24 40Z" fill="#7FAE82" />
          <path d="M35 106c14-6 22-20 22-34-12 6-20 18-22 34Z" fill="#6B9A6F" />
          <path d="M14 22c0 22 9 36 21 36s21-14 21-36l-10 10-11-20-11 20Z" fill="#F08A9C" />
          <path d="M35 12 26 30c2 14 5 22 9 28 4-6 7-14 9-28Z" fill="#E8667A" />
        </>
      );
    case "star":
      return (
        <path
          d="M50 5l12.4 27.6 30 3.2-22.4 20.3 6.3 29.6L50 70.6 23.7 85.7 30 56.1 7.6 35.8l30-3.2Z"
          fill="#F2C14E"
          stroke="#E0A93B"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      );
    case "sparkles": {
      const sp = (x: number, y: number, s: number, c: string) => (
        <path d={`M${x} ${y - s}C${x + s * 0.12} ${y - s * 0.12} ${x + s * 0.12} ${y - s * 0.12} ${x + s} ${y}C${x + s * 0.12} ${y + s * 0.12} ${x + s * 0.12} ${y + s * 0.12} ${x} ${y + s}C${x - s * 0.12} ${y + s * 0.12} ${x - s * 0.12} ${y + s * 0.12} ${x - s} ${y}C${x - s * 0.12} ${y - s * 0.12} ${x - s * 0.12} ${y - s * 0.12} ${x} ${y - s}Z`} fill={c} />
      );
      return (
        <>
          {sp(40, 54, 34, "#E9B949")}
          {sp(80, 22, 16, "#F2C14E")}
          {sp(82, 80, 11, "#C9B8F0")}
        </>
      );
    }
    case "moon":
      return (
        <>
          <path d="M62 8a44 44 0 1 0 38 66A36 36 0 1 1 62 8Z" fill="#F2D27A" />
          <path d="M30 40a3 3 0 1 0 0.1 0" fill="#E9B949" />
          <path d="M90 22l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5Z" fill="#E9B949" />
          <path d="M100 52l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6Z" fill="#C9B8F0" />
        </>
      );
    case "butterfly":
    case "butterfly-blue": {
      const [a, b, c] = type === "butterfly" ? ["#B49BEA", "#F4A6B8", "#8A6BD6"] : ["#8EC1EA", "#C9E3F7", "#5A93C7"];
      return (
        <>
          <path d="M58 48C44 18 18 6 8 16s4 36 22 40c-14 6-20 22-10 30s28-4 38-30Z" fill={a} />
          <path d="M62 48c14-30 40-42 50-32s-4 36-22 40c14 6 20 22 10 30s-28-4-38-30Z" fill={a} />
          <path d="M54 50C42 30 26 22 20 26s0 22 14 26" fill={b} opacity=".9" />
          <path d="M66 50c12-20 28-28 34-24s0 22-14 26" fill={b} opacity=".9" />
          <circle cx="24" cy="70" r="5" fill={b} />
          <circle cx="96" cy="70" r="5" fill={b} />
          <rect x="56" y="30" width="8" height="48" rx="4" fill="#3E3550" />
          <path d="M58 32c-4-10-10-16-16-18M62 32c4-10 10-16 16-18" stroke="#3E3550" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M60 34v40" stroke={c} strokeWidth="1" />
        </>
      );
    }
    case "swirl":
      return (
        <path
          d="M6 40c18 0 26-26 44-26 14 0 16 16 6 20s-18-8-6-18 30 2 40 14 22 16 34 8 6-22-6-18-6 22 12 24 22-4 24-8"
          stroke="#4B4740"
          strokeWidth="3.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case "bow":
      return (
        <>
          <path d="M60 40C40 14 12 8 8 22s14 32 52 18Z" fill="#F4A6B8" />
          <path d="M60 40c20-26 48-32 52-18s-14 32-52 18Z" fill="#F4A6B8" />
          <path d="M56 44 38 80l12-4 6 8 4-38Zm8 0 18 36-12-4-6 8-4-38Z" fill="#E88AA0" />
          <path d="M22 22c8 0 20 6 30 14M98 22c-8 0-20 6-30 14" stroke="#E07A93" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <rect x="50" y="30" width="20" height="20" rx="7" fill="#E07A93" />
        </>
      );
    case "cloud":
      return (
        <path
          d="M30 72c-14 0-24-9-24-20s9-19 21-19c3-15 15-25 30-25 13 0 24 8 28 20 3-1 6-2 9-2 14 0 25 11 25 23s-10 23-24 23Z"
          fill="#FFFFFF"
          stroke="#B9C9DE"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      );
    case "washi-pink":
    case "washi-mint":
    case "washi-lavender":
    case "washi-kraft": {
      const base = { "washi-pink": "#F4B6C2", "washi-mint": "#A9DAC3", "washi-lavender": "#CBBDF1", "washi-kraft": "#D8B98E" }[type];
      const edge = "M4 2h212l-3 5 4 5-4 5 4 5-4 5 4 5-4 5 3 5H4l3-5-4-5 4-5-4-5 4-5-4-5 4-5Z";
      return (
        <>
          <defs>
            <pattern id={`${uid}-p`} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform={type === "washi-pink" ? "rotate(45)" : undefined}>
              {type === "washi-pink" && <rect width="7" height="16" fill="#fff" fillOpacity=".55" />}
              {type === "washi-mint" && <circle cx="8" cy="8" r="3" fill="#fff" fillOpacity=".7" />}
              {type === "washi-lavender" && (
                <>
                  <rect width="8" height="8" fill="#fff" fillOpacity=".45" />
                  <rect x="8" y="8" width="8" height="8" fill="#fff" fillOpacity=".45" />
                </>
              )}
              {type === "washi-kraft" && <path d="M0 8h6" stroke="#9C7A50" strokeOpacity=".5" strokeWidth="1.5" />}
            </pattern>
          </defs>
          <path d={edge} fill={base} fillOpacity=".86" />
          <path d={edge} fill={`url(#${uid}-p)`} />
        </>
      );
    }
    case "stamp-heart":
    case "stamp-flower": {
      const inner = type === "stamp-heart" ? "#F7D6DC" : "#DCEBDD";
      return (
        <>
          <defs>
            <mask id={`${uid}-m`}>
              <rect width="90" height="110" fill="#fff" />
              {perforation(90, 110, 3.4, 10)}
            </mask>
          </defs>
          <g mask={`url(#${uid}-m)`}>
            <rect width="90" height="110" fill="#FFFCF5" />
          </g>
          <rect x="9" y="9" width="72" height="92" fill={inner} />
          {type === "stamp-heart" ? (
            <path d={HEART} fill="#D9536B" transform="translate(20 26) scale(.5)" />
          ) : (
            <DaisyShape cx={45} cy={50} r={24} />
          )}
          <text x="45" y="92" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" letterSpacing="2" fill="#6B5A4E">
            {type === "stamp-heart" ? "LOVE" : "BLOOM"}
          </text>
          <text x="74" y="22" textAnchor="end" fontFamily="Georgia, serif" fontSize="9" fill="#6B5A4E">
            {type === "stamp-heart" ? "14" : "21"}
          </text>
        </>
      );
    }
    case "postmark":
      return (
        <g stroke="#5B4A3E" strokeOpacity=".62" fill="none" strokeWidth="2.4">
          <circle cx="45" cy="45" r="38" />
          <circle cx="45" cy="45" r="28" strokeWidth="1.4" />
          <text x="45" y="42" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fill="#5B4A3E" fillOpacity=".7" stroke="none" letterSpacing="1.5">
            DEARLY
          </text>
          <text x="45" y="56" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8" fill="#5B4A3E" fillOpacity=".7" stroke="none">
            ✦ POST ✦
          </text>
          {[24, 36, 48, 60, 72].map((y) => (
            <path key={y} d={`M82 ${y}c8-6 14 6 22 0s14 6 22 0 14 6 22 0`} />
          ))}
        </g>
      );
    case "cake":
      return (
        <>
          <rect x="14" y="56" width="72" height="34" rx="6" fill="#F6D7B0" />
          <path d="M14 64c8 8 16 8 24 0s16 8 24 0 16 8 24 0v-4c0-3-3-6-6-6H20c-3 0-6 3-6 6Z" fill="#F4A6B8" />
          <rect x="8" y="88" width="84" height="6" rx="3" fill="#E4D6C1" />
          {[32, 50, 68].map((x, i) => (
            <g key={x}>
              <rect x={x - 3} y="34" width="6" height="20" rx="2" fill={["#C9B8F0", "#8EC1EA", "#A9DAC3"][i]} />
              <path d={`M${x} 22c4 5 4 9 0 11-4-2-4-6 0-11Z`} fill="#F2C14E" />
            </g>
          ))}
          <circle cx="30" cy="76" r="2.5" fill="#E8667A" />
          <circle cx="52" cy="80" r="2.5" fill="#8A6BD6" />
          <circle cx="72" cy="74" r="2.5" fill="#E8667A" />
        </>
      );
    case "balloon":
      return (
        <>
          <path d="M35 80c-4 12 6 18 0 30s4 18 2 28" stroke="#8C8478" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <ellipse cx="35" cy="42" rx="30" ry="37" fill="#E8667A" />
          <path d="M30 79h10l-5 7Z" fill="#C94F64" />
          <ellipse cx="24" cy="28" rx="6" ry="11" fill="#fff" fillOpacity=".4" transform="rotate(-20 24 28)" />
        </>
      );
    case "envelope":
      return (
        <>
          <rect x="4" y="6" width="102" height="66" rx="5" fill="#F3E6D2" stroke="#D9C6A8" strokeWidth="2" />
          <path d="M6 10l49 34 49-34" fill="none" stroke="#CDB58F" strokeWidth="2.4" strokeLinejoin="round" />
          <circle cx="55" cy="44" r="9" fill="#9B2C3B" />
          <path d={HEART} fill="#F3C9CF" transform="translate(49.5 39.5) scale(.11)" />
        </>
      );
    default:
      return null;
  }
}

export function DecorationArt({ type, className }: { type: string; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const meta = getDecorationMeta(type);
  if (!meta) return null;
  return (
    <svg
      viewBox={`0 0 ${meta.vw} ${meta.vh}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden="true"
      style={{ display: "block", overflow: "visible" }}
    >
      <Art type={meta.type} uid={uid} />
    </svg>
  );
}
