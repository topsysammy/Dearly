"use client";

import { useId } from "react";
import { getDecorationMeta, type DecorationType } from "@/lib/decorations/catalog";

const HEART = "M50 86C22 67 5 50 5 29 5 15 16 5 29 5c9 0 16 5 21 13 5-8 12-13 21-13 13 0 24 10 24 24 0 21-17 38-45 57Z";

/* Comic palette for the original hero set: teal suit, orange cape, sunny star. */
const COMIC_INK = "#1F1D2B";
const HERO = { suit: "#1E8C8C", cape: "#FF7A2F", star: "#FFD93B", belt: "#FFD93B", boot: "#1F1D2B", skin: "#F5C9A0", hair: "#3B2A20", mask: "#2B2D5C" };

/** Jagged comic "action" burst, deterministic so it looks the same in previews and exports. */
function burstPath(cx: number, cy: number, rOuter: number, rInner: number, points: number, seed: number) {
  let s = seed;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI * i) / points - Math.PI / 2;
    const r = (i % 2 ? rInner : rOuter) * (0.86 + rand() * 0.22);
    pts.push(`${(cx + Math.cos(a) * r * 1.06).toFixed(1)} ${(cy + Math.sin(a) * r * 0.8).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}

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

    /* ── Heroes: original artwork, not based on any existing character ── */
    case "hero":
      return (
        <g stroke={COMIC_INK} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round">
          {/* cape */}
          <path d="M30 52c-10 22-16 48-20 70 14-6 26-4 40-8 14 4 26 2 40 8-4-22-10-48-20-70Z" fill={HERO.cape} />
          {/* body */}
          <path d="M34 54c0-6 7-10 16-10s16 4 16 10v34c0 4-3 6-6 6H40c-3 0-6-2-6-6Z" fill={HERO.suit} />
          <path d="M50 58l3.2 6.6 7.2 1-5.2 5 1.3 7.2-6.5-3.4-6.5 3.4 1.3-7.2-5.2-5 7.2-1Z" fill={HERO.star} strokeWidth="1.8" />
          <path d="M34 80h32" stroke={HERO.belt} strokeWidth="5" />
          {/* legs & boots */}
          <path d="M40 94v18M60 94v18" strokeWidth="7" stroke={HERO.suit} />
          <path d="M34 116h12v6H34ZM54 116h12v6H54Z" fill={HERO.boot} />
          {/* arms raised in a cheer */}
          <path d="M35 58 20 40M65 58l15-18" strokeWidth="7" stroke={HERO.suit} />
          <circle cx="19" cy="38" r="5" fill={HERO.skin} />
          <circle cx="81" cy="38" r="5" fill={HERO.skin} />
          {/* head with a domino mask */}
          <circle cx="50" cy="28" r="17" fill={HERO.skin} />
          <path d="M31 22c4-12 14-17 22-16 9 1 15 7 16 14-8-4-16-4-24-1-6 2-10 3-14 3Z" fill={HERO.hair} />
          <path d="M35 28c4-4 10-4 15-1 5-3 11-3 15 1-1 5-5 7-9 7-3 0-5-2-6-3-1 1-3 3-6 3-4 0-8-2-9-7Z" fill={HERO.mask} />
          <circle cx="43" cy="29" r="1.8" fill="#fff" stroke="none" />
          <circle cx="57" cy="29" r="1.8" fill="#fff" stroke="none" />
          <path d="M44 38c3 3 9 3 12 0" fill="none" strokeWidth="2" />
        </g>
      );
    case "hero-mask":
      return (
        <g stroke={COMIC_INK} strokeWidth="3" strokeLinejoin="round">
          <path d="M70 18c-14-10-40-12-56-4C6 18 4 26 8 34c6 12 22 18 36 14 10-3 18-9 26-9s16 6 26 9c14 4 30-2 36-14 4-8 2-16-6-20-16-8-42-6-56 4Z" fill={HERO.mask} />
          <path d="M22 28c4-6 14-7 22-3-2 7-8 11-14 10-5-1-8-3-8-7ZM118 28c-4-6-14-7-22-3 2 7 8 11 14 10 5-1 8-3 8-7Z" fill="#fff" />
          <path d="M18 20c10-5 22-6 32-2" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case "cape":
      return (
        <g stroke={COMIC_INK} strokeWidth="2.6" strokeLinejoin="round">
          <path d="M30 8c-12 30-22 70-24 104 16-10 30-4 44-10 14 6 28 0 44 10-2-34-12-74-24-104Z" fill={HERO.cape} />
          <path d="M30 8h40c2 6-2 10-8 10H38c-6 0-10-4-8-10Z" fill={HERO.belt} />
          <path d="M40 30c-6 22-10 46-11 70M60 30c6 22 10 46 11 70" fill="none" strokeOpacity=".35" strokeWidth="2" />
        </g>
      );
    case "hero-badge":
      return (
        <g stroke={COMIC_INK} strokeWidth="3" strokeLinejoin="round">
          <path d="M45 4 82 16v34c0 26-16 42-37 50C24 92 8 76 8 50V16Z" fill={HERO.suit} />
          <path d="M45 13 73 22v28c0 20-12 33-28 40-16-7-28-20-28-40V22Z" fill={HERO.star} strokeWidth="2" />
          <path d="M45 30l5.6 11.4 12.6 1.8-9.1 8.9 2.1 12.5L45 58.7l-11.2 5.9 2.1-12.5-9.1-8.9 12.6-1.8Z" fill={HERO.cape} strokeWidth="2" />
        </g>
      );
    case "pow":
    case "zap":
    case "wow": {
      const style = { pow: ["#FFD93B", "#E8452C"], zap: ["#7FD8E6", "#1D5F8A"], wow: ["#FF9FC4", "#6B2FA0"] }[type];
      return (
        <>
          <path d={burstPath(70, 55, 66, 44, 13, type.length * 7)} fill={COMIC_INK} transform="translate(4 4)" />
          <path d={burstPath(70, 55, 66, 44, 13, type.length * 7)} fill={style[0]} stroke={COMIC_INK} strokeWidth="3" strokeLinejoin="round" />
          <text
            x="70"
            y="68"
            textAnchor="middle"
            fontFamily="Impact, 'Arial Black', 'Helvetica Neue', sans-serif"
            fontWeight="900"
            fontSize="36"
            fill={style[1]}
            stroke={COMIC_INK}
            strokeWidth="2"
            paintOrder="stroke"
            transform="rotate(-8 70 55)"
          >
            {type.toUpperCase()}!
          </text>
        </>
      );
    }
    case "comic-burst":
      return (
        <>
          <path d={burstPath(55, 55, 52, 30, 16, 3)} fill="#FFD93B" stroke={COMIC_INK} strokeWidth="3" strokeLinejoin="round" />
          <path d={burstPath(55, 55, 30, 18, 10, 9)} fill="#FF8A3D" stroke={COMIC_INK} strokeWidth="2.4" strokeLinejoin="round" />
          <circle cx="55" cy="55" r="7" fill="#fff" stroke={COMIC_INK} strokeWidth="2" />
        </>
      );
    case "bolt":
      return (
        <path
          d="M38 4 8 62h20l-8 44 34-62H32l8-40Z"
          fill="#FFD93B"
          stroke={COMIC_INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      );
    case "rocket":
      return (
        <g stroke={COMIC_INK} strokeWidth="2.6" strokeLinejoin="round">
          <path d="M28 104c-2 10 2 18 7 24 5-6 9-14 7-24Z" fill="#FF8A3D" />
          <path d="M31 104c0 6 2 10 4 14 2-4 4-8 4-14Z" fill="#FFD93B" strokeWidth="1.6" />
          <path d="M20 78 6 96v10l16-8ZM50 78l14 18v10l-16-8Z" fill={HERO.cape} />
          <path d="M35 6c-14 14-18 40-16 70l4 28h24l4-28c2-30-2-56-16-70Z" fill="#F7F4EE" />
          <circle cx="35" cy="48" r="9" fill="#7FD8E6" />
          <path d="M23 92h24" strokeWidth="3" stroke={HERO.suit} />
        </g>
      );
    case "skyline":
      return (
        <g stroke={COMIC_INK} strokeWidth="2.2" strokeLinejoin="round">
          {[
            [0, 46, 28], [26, 30, 22], [46, 54, 30], [74, 18, 24], [96, 40, 30], [124, 8, 20],
            [142, 34, 34], [174, 22, 24], [196, 48, 30], [224, 14, 26], [248, 38, 28], [274, 50, 26],
          ].map(([x, y, w], i) => (
            <g key={i}>
              <rect x={x} y={y} width={w} height={90 - y} fill={i % 2 ? "#2F4B6E" : "#3E6189"} />
              {Array.from({ length: Math.floor((86 - y) / 12) }).map((_, r) => (
                <rect key={r} x={x + 5} y={y + 6 + r * 12} width={w - 10} height="4" fill="#FFD93B" fillOpacity={(r + i) % 3 ? 0.85 : 0.25} stroke="none" />
              ))}
            </g>
          ))}
        </g>
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
