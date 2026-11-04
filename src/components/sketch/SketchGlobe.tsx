"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * A pencil-drawn globe that slowly turns, with paper planes and an envelope
 * travelling around it — letters on their way.
 */

const INK = "#24221f";
const STRIP = 520; // width of one full turn of the continent strip

const LAND = [
  // North America, Greenland, South America
  "M40 110C60 90 110 85 135 100c15 10 5 30-10 40-10 10-5 25-20 35-10 7-20-5-30-15-15-10-30-20-35-35Z",
  "M150 70c10-6 26-4 28 6s-10 16-20 14-12-14-8-20Z",
  "M110 195c15-5 30 5 28 23-2 22-10 44-20 67-6 13-14 5-14-10-1-20-8-40-6-60 1-10 5-17 12-20Z",
  // Europe, Africa
  "M230 105c15-10 40-10 50 0 8 7-2 17-12 19s-20 8-30 4-14-16-8-23Z",
  "M240 140c22-5 50 2 56 20s-4 36-14 55c-8 17-14 37-26 43-10 4-14-13-16-30s-14-32-14-50 2-33 14-38Z",
  // Asia, India, Australia
  "M290 95c30-15 90-13 130 0 25 9 30 30 12 43-14 10-32 12-47 22-13 8-25 18-40 12s-23-22-37-27c-12-4-24-15-24-27 0-10 2-19 6-23Z",
  "M350 175c8-3 16 5 14 17s-8 22-13 18-7-18-5-28Z",
  "M410 230c18-8 42-4 50 10 6 12-4 24-20 26s-30-4-36-16c-4-8-2-16 6-20Z",
];

const MOUNTAINS: [number, number][] = [
  [70, 118], [84, 112], [98, 120], [118, 230], [122, 250], [308, 112], [322, 104], [336, 110], [350, 100], [364, 112],
  [378, 104], [392, 114], [342, 128], [356, 122], [262, 170], [276, 182], [250, 112], [430, 244],
];
const TREES: [number, number][] = [[248, 122], [262, 116], [256, 200], [270, 214], [92, 140], [404, 130], [418, 120]];
const WAVES: [number, number][] = [[180, 150], [200, 250], [320, 230], [60, 230], [470, 180], [160, 300], [380, 290]];

function Strip() {
  return (
    <>
      {LAND.map((d, i) => (
        <path key={i} d={d} fill="#F8F7F3" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      ))}
      {MOUNTAINS.map(([x, y], i) => (
        <path key={`m${i}`} d={`M${x - 5} ${y + 5}l5-10 5 10`} fill="#fff" stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
      ))}
      {TREES.map(([x, y], i) => (
        <g key={`t${i}`} stroke={INK} strokeWidth="1" fill="#fff">
          <circle cx={x} cy={y} r="2.6" />
          <path d={`M${x} ${y + 2.6}v3`} />
        </g>
      ))}
      {WAVES.map(([x, y], i) => (
        <path key={`w${i}`} d={`M${x} ${y}q3-3 6 0t6 0`} fill="none" stroke={INK} strokeOpacity=".35" strokeWidth="1" strokeLinecap="round" />
      ))}
    </>
  );
}

function Plane({ color = INK }: { color?: string }) {
  return (
    <g transform="translate(-9 -6)">
      <path d="M0 6 18 0 12 12 8 8Z" fill="#fff" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M8 8 18 0" stroke={color} strokeWidth="1" />
    </g>
  );
}

function Letter() {
  return (
    <g transform="translate(-8 -5.5)">
      <rect width="16" height="11" rx="1.5" fill="#fff" stroke={INK} strokeWidth="1.1" />
      <path d="M1 1.5 8 6.5l7-5" fill="none" stroke={INK} strokeWidth="1" />
      <circle cx="8" cy="6.5" r="1.8" fill="#8E2436" />
    </g>
  );
}


export function SketchGlobe({ className = "" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const orbits = [
    { rx: 186, ry: 50, tilt: -16, dur: 14, reverse: false, item: <Plane /> },
    { rx: 168, ry: 38, tilt: 22, dur: 19, reverse: true, item: <Letter /> },
  ];
  const path = (rx: number, ry: number, reverse: boolean) =>
    reverse
      ? `M${200 + rx} 200a${rx} ${ry} 0 1 0 -${2 * rx} 0a${rx} ${ry} 0 1 0 ${2 * rx} 0`
      : `M${200 - rx} 200a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 -${2 * rx} 0`;

  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label="A hand-drawn globe with letters travelling around it">
      <defs>
        <filter id={`${uid}-sk`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="2.4" />
        </filter>
        <clipPath id={`${uid}-disk`}>
          <circle cx="200" cy="200" r="128" />
        </clipPath>
        <radialGradient id={`${uid}-shade`} cx="38%" cy="34%" r="72%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.16" />
        </radialGradient>
        {orbits.map((o, i) => (
          <clipPath key={i} id={`${uid}-front${i}`}>
            <rect x="-100" y="200" width="600" height="300" />
          </clipPath>
        ))}
      </defs>

      {/* Moon & clouds */}
      <g filter={`url(#${uid}-sk)`}>
        <circle cx="338" cy="58" r="17" fill="#fff" stroke={INK} strokeWidth="1.6" />
        <path d="M330 52a8 8 0 0 0 6 12" fill="none" stroke={INK} strokeOpacity=".4" strokeWidth="1" />
      </g>
      <motion.g animate={reduce ? undefined : { x: [0, 6, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
        <path d="M44 132c-6 0-9-3.5-9-7.5s3.2-7 7.6-7c1.4-4 5-6.6 9.4-6.6 5.4 0 9.6 4 9.6 9.2 4 0 6.6 2.4 6.6 5.6s-2.8 6.3-7 6.3Z" fill="#fff" stroke={INK} strokeWidth="1.3" />
      </motion.g>
      <motion.g animate={reduce ? undefined : { x: [0, -8, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}>
        <path d="M318 300c-7 0-11-4-11-8.6s3.8-8 8.8-8c1.6-4.6 5.8-7.6 10.8-7.6 6.2 0 11 4.6 11 10.6 4.6 0 7.6 2.8 7.6 6.4s-3.2 7.2-8 7.2Z" fill="#fff" stroke={INK} strokeWidth="1.3" />
      </motion.g>

      {/* Orbits — back halves sit behind the globe */}
      {orbits.map((o, i) => (
        <g key={`b${i}`} transform={`rotate(${o.tilt} 200 200)`}>
          <ellipse cx="200" cy="200" rx={o.rx} ry={o.ry} fill="none" stroke={INK} strokeOpacity=".28" strokeWidth="1" strokeDasharray="3 6" />
          {!reduce && (
            <g>
              {o.item}
              <animateMotion dur={`${o.dur}s`} repeatCount="indefinite" rotate="auto" path={path(o.rx, o.ry, o.reverse)} />
            </g>
          )}
        </g>
      ))}

      {/* Globe */}
      <g filter={`url(#${uid}-sk)`}>
        <circle cx="200" cy="200" r="128" fill="#DAD8D2" />
        <g clipPath={`url(#${uid}-disk)`}>
          <motion.g
            animate={reduce ? undefined : { x: [0, -STRIP] }}
            transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
          >
            <g transform="translate(-60 0)">
              <Strip />
            </g>
            <g transform={`translate(${STRIP - 60} 0)`}>
              <Strip />
            </g>
          </motion.g>
          {/* latitude hint + curvature shading */}
          <ellipse cx="200" cy="200" rx="128" ry="30" fill="none" stroke={INK} strokeOpacity=".12" strokeWidth="1" />
          <circle cx="200" cy="200" r="128" fill={`url(#${uid}-shade)`} />
        </g>
        <circle cx="200" cy="200" r="128" fill="none" stroke={INK} strokeWidth="2.4" />
        <path d="M120 150a96 96 0 0 1 48-50" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="3" strokeLinecap="round" />
      </g>
      {/* soft contact shadow */}
      <ellipse cx="200" cy="356" rx="92" ry="8" fill="#000" opacity=".07" />

      {/* Orbits — front halves pass over the globe */}
      {!reduce &&
        orbits.map((o, i) => (
          <g key={`f${i}`} transform={`rotate(${o.tilt} 200 200)`}>
            <g clipPath={`url(#${uid}-front${i})`}>
              <g>
                {o.item}
                <animateMotion dur={`${o.dur}s`} repeatCount="indefinite" rotate="auto" path={path(o.rx, o.ry, o.reverse)} />
              </g>
            </g>
          </g>
        ))}
    </svg>
  );
}
