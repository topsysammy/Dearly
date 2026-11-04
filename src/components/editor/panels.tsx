"use client";

import { useState } from "react";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Check, Copy, Trash2, CalendarDays, Sparkles } from "lucide-react";
import { handwritingFamily } from "@/lib/fonts";
import { newId, todayLabel } from "@/lib/letter/document";
import {
  EDGE_STYLES,
  FONT_OPTIONS,
  FONT_SIZE_RANGE,
  INK_COLORS,
  LETTER_SPACING_RANGE,
  LINE_HEIGHT_RANGE,
  PAPER_COLORS,
  PAPER_SIZES,
  PAPER_STYLES,
  PAPER_TEXTURES,
} from "@/lib/letter/options";
import { DECORATION_CATEGORIES, DECORATIONS, getDecorationMeta, type DecorationCategory } from "@/lib/decorations/catalog";
import { TEMPLATES, templatePreviewDoc, type LetterTemplate } from "@/lib/letter/templates";
import type { DecorationPlacement, LetterDocument, PaperStyle, PaperTexture, TextAlignment } from "@/lib/letter/types";
import { DecorationArt } from "@/components/decorations/DecorationArt";
import { FittedPaper } from "@/components/paper/FittedPaper";
import { textureLayers } from "@/components/paper/textures";
import { ControlLabel, Section, Segmented, Slider, Swatches, TextField } from "@/components/ui/Controls";

type Update = (fn: (d: LetterDocument) => LetterDocument) => void;
type PanelProps = { doc: LetterDocument; update: Update };

const setTypo = (update: Update, patch: Partial<LetterDocument["typography"]>) =>
  update((d) => ({ ...d, typography: { ...d.typography, ...patch } }));
const setPaper = (update: Update, patch: Partial<LetterDocument["paper"]>) =>
  update((d) => ({ ...d, paper: { ...d.paper, ...patch } }));
const setField = (update: Update, key: keyof LetterDocument) => (v: string) => update((d) => ({ ...d, [key]: v }));

/* ─────────────────────────── Write ─────────────────────────── */

export function WritePanel({ doc, update, compact }: PanelProps & { compact?: boolean }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Greeting" value={doc.greeting ?? ""} onChange={setField(update, "greeting")} placeholder="Dear" />
        <TextField label="Recipient" value={doc.recipient ?? ""} onChange={setField(update, "recipient")} placeholder="Their name" />
      </div>
      <label className="block">
        <span className="mb-1.5 flex items-center justify-between text-[13px] font-medium text-muted">
          Your message
          <span className="font-normal text-faint tabular-nums">{doc.message.length.toLocaleString()} / 12,000</span>
        </span>
        <textarea
          value={doc.message}
          onChange={(e) => update((d) => ({ ...d, message: e.target.value }))}
          maxLength={12000}
          placeholder="Start with what's on your mind…"
          rows={compact ? 6 : 12}
          className="block w-full resize-y rounded-2xl border border-line bg-surface px-4 py-3 text-[16px] leading-relaxed text-ink placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/15 focus:outline-none"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Closing" value={doc.closing ?? ""} onChange={setField(update, "closing")} placeholder="With love," />
        <TextField label="Signature" value={doc.signature ?? ""} onChange={setField(update, "signature")} placeholder="Your name" />
      </div>
      <div>
        <TextField label="Date" value={doc.date ?? ""} onChange={setField(update, "date")} placeholder="Optional" maxLength={60} />
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => update((d) => ({ ...d, date: todayLabel() }))}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-black/[0.04] px-3 text-[13px] text-ink hover:bg-black/[0.07]"
          >
            <CalendarDays className="size-3.5" /> Today
          </button>
          {doc.date ? (
            <button
              type="button"
              onClick={() => update((d) => ({ ...d, date: "" }))}
              className="inline-flex h-8 items-center rounded-full px-3 text-[13px] text-muted hover:bg-black/[0.04]"
            >
              No date
            </button>
          ) : null}
        </div>
      </div>
      <TextField
        label="Letter name (only you see this)"
        value={doc.title ?? ""}
        onChange={setField(update, "title")}
        placeholder="e.g. Anniversary letter"
        maxLength={120}
      />
    </div>
  );
}

/* ───────────────────────── Handwriting ───────────────────────── */

const ALIGN_ICONS: Record<TextAlignment, typeof AlignLeft> = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
  justify: AlignJustify,
};

export function HandwritingPanel({ doc, update }: PanelProps) {
  const t = doc.typography;
  return (
    <div className="space-y-7">
      <Section title="Handwriting">
        <div role="radiogroup" aria-label="Handwriting font" className="grid grid-cols-2 gap-2">
          {FONT_OPTIONS.map((f) => {
            const active = f.id === t.fontFamily;
            return (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTypo(update, { fontFamily: f.id })}
                className={`relative flex h-[76px] flex-col items-start justify-between overflow-hidden rounded-2xl border px-3 py-2.5 text-left transition ${
                  active ? "border-ink bg-surface shadow-card" : "border-line bg-surface/60 hover:border-[#d8d1c5]"
                }`}
              >
                <span
                  className="w-full truncate text-ink"
                  style={{ fontFamily: handwritingFamily(f.id), fontSize: 22 * f.scale, lineHeight: 1.15, color: t.inkColor }}
                >
                  Dear friend,
                </span>
                <span className="text-[11px] text-muted">
                  {f.name} · {f.category}
                </span>
                {active && <Check className="absolute top-2 right-2 size-3.5 text-ink" />}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Ink">
        <Swatches label="Ink colour" value={t.inkColor} options={INK_COLORS} onChange={(v) => setTypo(update, { inkColor: v })} />
      </Section>

      <Section title="Type">
        <Slider
          label="Size"
          value={t.fontSize}
          {...FONT_SIZE_RANGE}
          format={(v) => `${v}px`}
          onChange={(v) => setTypo(update, { fontSize: v })}
        />
        <Slider
          label="Line spacing"
          value={t.lineHeight}
          {...LINE_HEIGHT_RANGE}
          format={(v) => v.toFixed(2)}
          onChange={(v) => setTypo(update, { lineHeight: Math.round(v * 100) / 100 })}
        />
        <Slider
          label="Letter spacing"
          value={t.letterSpacing}
          {...LETTER_SPACING_RANGE}
          format={(v) => `${v > 0 ? "+" : ""}${v}px`}
          onChange={(v) => setTypo(update, { letterSpacing: v })}
        />
        <div>
          <ControlLabel>Alignment</ControlLabel>
          <Segmented
            label="Text alignment"
            value={t.alignment}
            onChange={(v) => setTypo(update, { alignment: v })}
            options={(["left", "center", "right", "justify"] as TextAlignment[]).map((a) => {
              const I = ALIGN_ICONS[a];
              return { id: a, name: <I className="size-4" aria-label={a} />, title: a[0].toUpperCase() + a.slice(1) };
            })}
          />
        </div>
      </Section>
    </div>
  );
}

/* ─────────────────────────── Paper ─────────────────────────── */

function PatternSample({ style, color }: { style: PaperStyle; color: string }) {
  const bg: Record<PaperStyle, string> = {
    blank: "none",
    lined: "linear-gradient(to bottom, transparent 9px, rgba(84,116,168,.35) 9px) 0 0 / 100% 10px",
    dotted: "radial-gradient(circle, rgba(70,64,56,.4) 1px, transparent 1.4px) 0 0 / 8px 8px",
    grid: "linear-gradient(rgba(84,116,168,.25) 1px, transparent 1px) 0 0 / 8px 8px, linear-gradient(90deg, rgba(84,116,168,.25) 1px, transparent 1px) 0 0 / 8px 8px",
  };
  return <div className="h-14 w-full rounded-lg border border-black/[0.06]" style={{ background: `${bg[style] === "none" ? "" : bg[style] + ","} ${color}` }} />;
}

function TextureSample({ texture, color }: { texture: PaperTexture; color: string }) {
  return (
    <div className="relative h-14 w-full overflow-hidden rounded-lg border border-black/[0.06]" style={{ background: color }}>
      {textureLayers(texture).map((l, i) => (
        <div key={i} className="absolute inset-0" style={l} />
      ))}
    </div>
  );
}

function Tile({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`flex flex-col gap-1.5 rounded-xl border p-1.5 pb-2 text-[12px] font-medium transition ${
        active ? "border-ink bg-surface text-ink shadow-card" : "border-line bg-surface/50 text-muted hover:text-ink"
      }`}
    >
      {children}
      {label}
    </button>
  );
}

export function PaperPanel({ doc, update }: PanelProps) {
  const p = doc.paper;
  return (
    <div className="space-y-7">
      <Section title="Colour">
        <Swatches label="Paper colour" value={p.color} options={PAPER_COLORS} round={false} onChange={(v) => setPaper(update, { color: v })} />
      </Section>
      <Section title="Style">
        <div role="radiogroup" aria-label="Paper style" className="grid grid-cols-4 gap-2">
          {PAPER_STYLES.map((s) => (
            <Tile key={s.id} label={s.name} active={p.style === s.id} onClick={() => setPaper(update, { style: s.id })}>
              <PatternSample style={s.id} color={p.color} />
            </Tile>
          ))}
        </div>
      </Section>
      <Section title="Texture">
        <div role="radiogroup" aria-label="Paper texture" className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3">
          {PAPER_TEXTURES.map((s) => (
            <Tile key={s.id} label={s.name} active={p.texture === s.id} onClick={() => setPaper(update, { texture: s.id })}>
              <TextureSample texture={s.id} color={p.color} />
            </Tile>
          ))}
        </div>
      </Section>
      <Section title="Size">
        <Segmented
          label="Paper size"
          value={p.size}
          onChange={(v) => setPaper(update, { size: v })}
          options={PAPER_SIZES.map((s) => ({ id: s.id, name: s.name, title: s.hint }))}
        />
        <p className="text-xs text-muted">{PAPER_SIZES.find((s) => s.id === p.size)?.hint}</p>
      </Section>
      <Section title="Edges">
        <Segmented label="Paper edges" value={p.edgeStyle} onChange={(v) => setPaper(update, { edgeStyle: v })} options={EDGE_STYLES} />
      </Section>
    </div>
  );
}

/* ───────────────────────── Decorations ───────────────────────── */

const SLOTS: [number, number][] = [
  [0.85, 0.08],
  [0.14, 0.92],
  [0.86, 0.92],
  [0.14, 0.07],
  [0.92, 0.5],
  [0.08, 0.5],
  [0.5, 0.95],
  [0.5, 0.04],
];

/** Place new decorations in the margins first, so they don't sit under the words. */
export function placeDecoration(doc: LetterDocument, type: string): DecorationPlacement {
  const meta = getDecorationMeta(type)!;
  const width = meta.defaultWidth;
  const height = (width * meta.vh) / meta.vw;
  // The top-right corner holds the date line when there is one.
  const slots = doc.date?.trim() ? SLOTS.filter(([x, y]) => !(x > 0.7 && y < 0.15)) : SLOTS;
  const free = slots.find(([x, y]) => !doc.decorations.some((d) => Math.hypot(d.x - x, d.y - y) < 0.12));
  const [x, y] = free ?? [0.8 + Math.random() * 0.1, 0.1 + Math.random() * 0.1];
  const washi = meta.category === "Washi tape";
  return { id: newId(), type, x, y: washi ? Math.min(y, 0.03) : y, width, height, rotation: washi ? -4 : Math.round(Math.random() * 16 - 8) };
}

export function DecoratePanel({
  doc,
  update,
  selectedId,
  onSelect,
}: PanelProps & { selectedId: string | null; onSelect: (id: string | null) => void }) {
  const [cat, setCat] = useState<DecorationCategory | "All">("All");
  const selected = doc.decorations.find((d) => d.id === selectedId);
  const items = cat === "All" ? DECORATIONS : DECORATIONS.filter((d) => d.category === cat);

  const add = (type: string) => {
    const placed = placeDecoration(doc, type);
    update((d) => ({ ...d, decorations: [...d.decorations, placed] }));
    onSelect(placed.id);
  };
  const patch = (p: Partial<DecorationPlacement>) =>
    update((d) => ({ ...d, decorations: d.decorations.map((x) => (x.id === selectedId ? { ...x, ...p } : x)) }));

  return (
    <div className="space-y-6">
      {selected ? (
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
          <div className="mb-3 flex items-center gap-3">
            <div className="size-10 shrink-0">
              <DecorationArt type={selected.type} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{getDecorationMeta(selected.type)?.name}</p>
              <p className="text-xs text-muted">Drag it on the paper, or fine-tune here.</p>
            </div>
          </div>
          <div className="space-y-2">
            <Slider
              label="Size"
              value={Math.round(selected.width * 100)}
              min={4}
              max={80}
              step={1}
              format={(v) => `${v}%`}
              onChange={(v) => patch({ width: v / 100, height: (selected.height / selected.width) * (v / 100) })}
            />
            <Slider
              label="Rotation"
              value={selected.rotation}
              min={-180}
              max={180}
              step={1}
              format={(v) => `${v}°`}
              onChange={(v) => patch({ rotation: v })}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                const copy = { ...selected, id: newId(), x: Math.min(1, selected.x + 0.04), y: Math.min(1, selected.y + 0.03) };
                update((d) => ({ ...d, decorations: [...d.decorations, copy] }));
                onSelect(copy.id);
              }}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-line text-[13px] font-medium hover:bg-black/[0.03]"
            >
              <Copy className="size-3.5" /> Duplicate
            </button>
            <button
              type="button"
              onClick={() => {
                update((d) => ({ ...d, decorations: d.decorations.filter((x) => x.id !== selected.id) }));
                onSelect(null);
              }}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-[#f3d2cd] text-[13px] font-medium text-danger hover:bg-[#fff5f3]"
            >
              <Trash2 className="size-3.5" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <p className="rounded-2xl bg-accent-soft/60 px-4 py-3 text-[13px] leading-relaxed text-accent-deep">
          <Sparkles className="mr-1 inline size-3.5 -translate-y-px" />
          Tap a sticker to add it. Drag to move, use the handles to resize or rotate. Decorations sit beneath your ink, so
          words always stay readable.
        </p>
      )}

      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {(["All", ...DECORATION_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            aria-pressed={cat === c}
            className={`h-8 shrink-0 rounded-full px-3 text-[13px] font-medium transition ${
              cat === c ? "bg-ink text-white" : "bg-black/[0.04] text-muted hover:text-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-4">
        {items.map((d) => (
          <button
            key={d.type}
            type="button"
            onClick={() => add(d.type)}
            aria-label={`Add ${d.name}`}
            title={d.name}
            className="flex aspect-square items-center justify-center rounded-2xl border border-line bg-surface p-2.5 transition hover:-translate-y-0.5 hover:shadow-card active:scale-95"
          >
            <DecorationArt type={d.type} />
          </button>
        ))}
      </div>

      {doc.decorations.length > 0 && (
        <button
          type="button"
          onClick={() => {
            update((d) => ({ ...d, decorations: [] }));
            onSelect(null);
          }}
          className="text-[13px] text-muted underline-offset-4 hover:text-danger hover:underline"
        >
          Remove all decorations ({doc.decorations.length})
        </button>
      )}
    </div>
  );
}

/* ───────────────────────── Templates ───────────────────────── */

export function TemplateThumb({ template, active }: { template: LetterTemplate; active?: boolean }) {
  return (
    <div className={`rounded-xl p-1 transition ${active ? "ring-2 ring-ink" : ""}`}>
      <FittedPaper doc={templatePreviewDoc(template)} />
    </div>
  );
}

export function TemplatesPanel({ doc, onApply }: { doc: LetterDocument; onApply: (t: LetterTemplate) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-[13px] leading-relaxed text-muted">
        Templates change the paper, handwriting and decorations. Your words always stay put.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onApply(t)}
            aria-pressed={doc.templateId === t.id}
            className="group text-left"
          >
            <TemplateThumb template={t} active={doc.templateId === t.id} />
            <p className="mt-2 text-[13px] font-medium">{t.name}</p>
            <p className="text-[11px] text-muted">{t.category}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

