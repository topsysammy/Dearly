/** Scattered pencil doodles (plus signs, clouds, swirls, dots) for sketchbook backgrounds. */

const STROKE = "rgba(28,27,25,0.22)";

function Plus({ x, y, s = 14 }: { x: string; y: string; s?: number }) {
  return (
    <svg className="absolute" style={{ left: x, top: y, width: s, height: s }} viewBox="0 0 14 14" aria-hidden>
      <path d="M7 1.5v11M1.5 7.2h11" stroke={STROKE} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function Cloud({ x, y, s = 34 }: { x: string; y: string; s?: number }) {
  return (
    <svg className="absolute" style={{ left: x, top: y, width: s, height: s * 0.6 }} viewBox="0 0 34 20" aria-hidden>
      <path d="M8 17c-4 0-6-2.4-6-5s2.2-4.6 5-4.6C8 4.5 10.5 2.6 13.6 2.6c3 0 5.4 1.8 6.2 4.4 .8-.3 1.6-.4 2.4-.4 3.6 0 6.2 2.4 6.2 5.3S26 17 22.6 17Z" fill="none" stroke={STROKE} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
function Swirl({ x, y, s = 22 }: { x: string; y: string; s?: number }) {
  return (
    <svg className="absolute" style={{ left: x, top: y, width: s, height: s }} viewBox="0 0 22 22" aria-hidden>
      <path d="M11 11.5c0-1.4 1.6-2 2.6-1.1 1.3 1.2.6 3.6-1.4 4-2.6.6-4.6-1.8-4-4.4.8-3.4 5-4.6 7.6-2.6 3.2 2.4 2.4 7.6-1.4 9" fill="none" stroke={STROKE} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function Dots({ x, y }: { x: string; y: string }) {
  return (
    <svg className="absolute" style={{ left: x, top: y, width: 16, height: 12 }} viewBox="0 0 16 12" aria-hidden>
      <circle cx="3" cy="3" r="1.3" fill={STROKE} />
      <circle cx="11" cy="2.5" r="1.3" fill={STROKE} />
      <circle cx="7" cy="9" r="1.3" fill={STROKE} />
    </svg>
  );
}
function Sparkle({ x, y, s = 16 }: { x: string; y: string; s?: number }) {
  return (
    <svg className="absolute" style={{ left: x, top: y, width: s, height: s }} viewBox="0 0 16 16" aria-hidden>
      <path d="M8 1.5c.5 3.6 2.4 5.6 6.2 6.4C10.4 8.6 8.6 10.6 8 14.5 7.3 10.6 5.4 8.6 1.8 7.9 5.5 7.2 7.4 5.1 8 1.5Z" fill="none" stroke={STROKE} strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}
function Ticks({ x, y }: { x: string; y: string }) {
  return (
    <svg className="absolute" style={{ left: x, top: y, width: 14, height: 12 }} viewBox="0 0 14 12" aria-hidden>
      <path d="M3 10 4.5 2M7 10 8.5 2M11 10l1.5-8" stroke={STROKE} strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export function Doodles({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none fixed inset-0 overflow-hidden ${className}`}>
      <Plus x="38%" y="9%" s={16} />
      <Plus x="26%" y="14%" />
      <Ticks x="58%" y="8%" />
      <Dots x="8%" y="22%" />
      <Cloud x="44%" y="18%" s={26} />
      <Cloud x="72%" y="26%" s={30} />
      <Swirl x="4%" y="38%" />
      <Sparkle x="7%" y="58%" s={18} />
      <Plus x="88%" y="56%" s={16} />
      <Dots x="80%" y="68%" />
      <Plus x="20%" y="74%" s={15} />
      <Plus x="74%" y="80%" s={15} />
      <Cloud x="12%" y="88%" s={28} />
      <Swirl x="84%" y="90%" />
      <Dots x="50%" y="84%" />
      <Sparkle x="92%" y="14%" s={14} />
    </div>
  );
}
