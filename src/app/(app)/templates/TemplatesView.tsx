"use client";

import { useState } from "react";
import { PenLine } from "lucide-react";
import { TEMPLATE_CATEGORIES, TEMPLATES, templatePreviewDoc, type LetterTemplate } from "@/lib/letter/templates";
import { getFontOption } from "@/lib/letter/options";
import { FittedPaper } from "@/components/paper/FittedPaper";
import { ButtonLink } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";

export function TemplatesView() {
  const [cat, setCat] = useState<(typeof TEMPLATE_CATEGORIES)[number]>("All");
  const [selected, setSelected] = useState<LetterTemplate | null>(null);
  const list = cat === "All" ? TEMPLATES : TEMPLATES.filter((t) => t.category === cat);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-12 sm:px-6 sm:pt-10">
      <h1 className="font-serif text-[44px] leading-none sm:text-[56px]">Templates</h1>
      <p className="mt-3 max-w-xl text-[16px] text-muted">
        Ready-made stationery to start from. Every detail stays editable — paper, handwriting, ink and decorations.
      </p>

      <div role="tablist" aria-label="Template categories" className="no-scrollbar -mx-4 mt-8 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {TEMPLATE_CATEGORIES.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={cat === c}
            onClick={() => setCat(c)}
            className={`h-9 shrink-0 rounded-full px-4 text-[13px] font-medium transition ${
              cat === c ? "bg-ink text-white" : "bg-black/[0.04] text-muted hover:text-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="py-16 text-center text-muted">No templates in this category yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
          {list.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t)}
              aria-pressed={selected?.id === t.id}
              className="group text-left"
            >
              <div className={`p-1 transition ${selected?.id === t.id ? "ring-2 ring-ink" : ""}`}>
                <div className="transition duration-300 group-hover:-translate-y-1 group-hover:rotate-[-0.6deg]">
                  <FittedPaper doc={templatePreviewDoc(t)} />
                </div>
              </div>
              <p className="mt-3 text-[15px] font-medium">{t.name}</p>
              <p className="text-[12px] text-muted">{t.category}</p>
            </button>
          ))}
        </div>
      )}

      <Sheet open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ""} description={selected?.description} wide>
        {selected && (
          <div className="grid gap-6 sm:grid-cols-[1fr_200px] sm:items-end">
            <div className="p-2">
              <FittedPaper doc={templatePreviewDoc(selected)} maxHeight={460} />
            </div>
            <div className="space-y-4">
              <dl className="space-y-2 text-[13px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Handwriting</dt>
                  <dd className="text-right">{getFontOption(selected.typography.fontFamily).name}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Paper</dt>
                  <dd className="text-right capitalize">
                    {selected.paper.texture} · {selected.paper.style} · {selected.paper.size}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Decorations</dt>
                  <dd>{selected.decorations.length || "None"}</dd>
                </div>
              </dl>
              <ButtonLink href={`/write?template=${selected.id}`} className="w-full" size="lg">
                <PenLine className="size-4" /> Use this template
              </ButtonLink>
              <p className="text-[12px] text-muted">The sample words are just for show — you&rsquo;ll start with a fresh page.</p>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
