"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Copy, Eye, MoreHorizontal, PenLine, Trash2 } from "lucide-react";
import { letterLabel } from "@/lib/letter/document";
import type { LetterDocument } from "@/lib/letter/types";
import { FittedPaper } from "@/components/paper/FittedPaper";

const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export function LetterCard({
  doc,
  activeLinks,
  onDuplicate,
  onDelete,
}: {
  doc: LetterDocument;
  activeLinks: number;
  onDuplicate?: () => void;
  onDelete?: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menu) return;
    const close = (e: PointerEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", esc);
    };
  }, [menu]);

  return (
    <article className="group relative">
      <Link href={`/write/${doc.id}`} className="block" aria-label={`Edit ${letterLabel(doc)}`}>
        <div className="transition duration-300 group-hover:-translate-y-0.5">
          <FittedPaper doc={doc} />
        </div>
      </Link>
      <div className="mt-3 flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-medium">{letterLabel(doc)}</h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-muted">
            <span>Edited {fmt(doc.updatedAt)}</span>
            {activeLinks > 0 ? (
              <span className="rounded-full bg-sage px-1.5 py-px text-[11px] font-semibold text-[#2f6b45]">
                Sent{activeLinks > 1 ? ` ×${activeLinks}` : ""}
              </span>
            ) : (
              <span className="rounded-full bg-black/[0.05] px-1.5 py-px text-[11px] font-semibold text-muted">Draft</span>
            )}
          </p>
        </div>
        {onDelete && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="More options"
              aria-haspopup="menu"
              aria-expanded={menu}
              onClick={() => setMenu((m) => !m)}
              className="inline-flex size-9 items-center justify-center rounded-full text-muted hover:bg-black/5 hover:text-ink"
            >
              <MoreHorizontal className="size-5" />
            </button>
            {menu && (
              <div role="menu" className="absolute right-0 bottom-11 z-20 w-44 overflow-hidden rounded-2xl border border-line bg-surface py-1 shadow-lift">
                {[
                  { label: "Edit", icon: PenLine, href: `/write/${doc.id}` },
                  { label: "Preview & share", icon: Eye, href: `/preview/${doc.id}` },
                ].map((i) => (
                  <Link key={i.label} role="menuitem" href={i.href} className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] hover:bg-black/[0.03]">
                    <i.icon className="size-4 text-muted" /> {i.label}
                  </Link>
                ))}
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenu(false);
                    onDuplicate?.();
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[14px] hover:bg-black/[0.03]"
                >
                  <Copy className="size-4 text-muted" /> Duplicate
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenu(false);
                    onDelete();
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[14px] text-danger hover:bg-[#fff5f3]"
                >
                  <Trash2 className="size-4" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
