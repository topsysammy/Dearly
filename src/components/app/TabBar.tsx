"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, FolderHeart, UserRound } from "lucide-react";

const TABS = [
  { href: "/home", label: "Home", icon: Compass },
  { href: "/letters", label: "Letters", icon: FolderHeart },
  { href: "/profile", label: "Profile", icon: UserRound },
];

/** Floating pill tab bar, like a little toolbar resting on the page. */
export function TabBar() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(14px,env(safe-area-inset-bottom))]">
      <ul className="pointer-events-auto flex gap-1 rounded-full border border-white/70 bg-surface/85 p-1.5 shadow-[0_14px_34px_-16px_rgba(0,0,0,0.35)] backdrop-blur-md">
        {TABS.map((t) => {
          const active = path.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`hand flex h-[54px] w-[88px] flex-col items-center justify-center gap-0.5 rounded-full text-[14px] transition ${
                  active ? "bg-[#dcdad4] text-ink shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]" : "text-muted hover:text-ink"
                }`}
              >
                <t.icon className="size-[19px]" strokeWidth={1.7} />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
