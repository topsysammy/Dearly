import Link from "next/link";

export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect x="2" y="7" width="28" height="19" rx="3.5" fill="#F5E9D8" stroke="#292722" strokeWidth="1.6" />
      <path d="M3.5 9 16 18l12.5-9" fill="none" stroke="#292722" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="16" cy="18" r="4.4" fill="#8E2436" />
      <path d="M16 20.2c-1.7-1.1-2.6-2-2.6-3 0-.7.5-1.2 1.2-1.2.6 0 1 .3 1.4.8.4-.5.8-.8 1.4-.8.7 0 1.2.5 1.2 1.2 0 1-.9 1.9-2.6 3Z" fill="#F7D6DC" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 rounded-full" aria-label="Dearly home">
      <LogoMark />
      <span className="font-serif text-[26px] leading-none tracking-tight">Dearly</span>
    </Link>
  );
}
