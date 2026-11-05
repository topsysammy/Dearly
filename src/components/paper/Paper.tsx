"use client";

import { forwardRef, memo, useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { handwritingFamily } from "@/lib/fonts";
import { greetingLine } from "@/lib/letter/document";
import { getFontOption, PAPER_DIMENSIONS } from "@/lib/letter/options";
import type { DecorationPlacement, LetterDocument } from "@/lib/letter/types";
import { DecorationArt } from "@/components/decorations/DecorationArt";
import { EditableDecoration } from "./EditableDecoration";
import { textureLayers, TORN_CLIP_PATH } from "./textures";

export type PaperEditProps = {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<DecorationPlacement>) => void;
  onRemove: (id: string) => void;
  /** Current on-screen scale of the paper so handles stay finger-sized. */
  scale: number;
};

type PaperProps = {
  doc: LetterDocument;
  edit?: PaperEditProps;
  /** Show soft placeholder copy when the letter is empty (editor only). */
  placeholder?: boolean;
  onOverflowChange?: (overflowing: boolean) => void;
  /** Editor only: renders the message as an editable field on the paper itself. */
  onMessageChange?: (value: string) => void;
  className?: string;
  style?: CSSProperties;
};

/** Metrics shared by every layer so ruled lines line up with handwriting. */
export function paperMetrics(doc: LetterDocument) {
  const { width, height } = PAPER_DIMENSIONS[doc.paper.size];
  const font = getFontOption(doc.typography.fontFamily);
  const fontPx = doc.typography.fontSize * font.scale;
  const line = Math.round(doc.typography.fontSize * doc.typography.lineHeight * 100) / 100;
  const padX = Math.round(width * 0.11);
  const padTop = Math.round(width * 0.1);
  const padBottom = Math.round(width * 0.09);
  return { width, height, fontPx, line, padX, padTop, padBottom };
}

/** Tiny hearts, stars and dots for the "kawaii" paper (plain SVG, no filters, so it exports cleanly). */
const KAWAII_TILE = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>" +
    "<path d='M14 20c-5-3-8-6-8-9 0-2 1.6-3.6 3.6-3.6 1.8 0 3.2 1 4.4 2.6 1.2-1.6 2.6-2.6 4.4-2.6 2 0 3.6 1.6 3.6 3.6 0 3-3 6-8 9Z' fill='#FF9DB8'/>" +
    "<path d='M46 38l2 4.4 4.8.6-3.5 3.3.9 4.7-4.2-2.3-4.2 2.3.9-4.7-3.5-3.3 4.8-.6Z' fill='#FFD45E'/>" +
    "<circle cx='44' cy='12' r='2.2' fill='#9CC9EE'/><circle cx='18' cy='50' r='2.2' fill='#C6B8FF'/>" +
    "</svg>",
)}")`;

function PatternLayer({ doc }: { doc: LetterDocument }) {
  const { line, padTop, padX, fontPx, height } = paperMetrics(doc);
  const style = doc.paper.style;
  if (style === "blank") return null;

  // Comic styles are decorative backdrops, kept faint and faded behind the writing area.
  if (style === "halftone") {
    return (
      <>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(31,29,43,0.16) 1.7px, transparent 2.2px)",
            backgroundSize: "11px 11px",
          }}
        />
        {/* Fade the dots out over the writing so the comic look lives in the corners. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 62% 58% at 50% 48%, ${doc.paper.color} 55%, transparent 100%)`,
          }}
        />
      </>
    );
  }
  if (style === "speedlines") {
    return (
      <>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-conic-gradient(from 0deg at 50% 44%, rgba(31,29,43,0.13) 0deg 0.7deg, transparent 0.7deg 3.4deg)",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 60% 56% at 50% 46%, ${doc.paper.color} 58%, transparent 100%)`,
          }}
        />
      </>
    );
  }
  if (style === "kawaii") {
    return (
      <>
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: KAWAII_TILE, backgroundSize: "64px 64px", opacity: 0.55 }} />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 60% 56% at 50% 46%, ${doc.paper.color} 50%, transparent 100%)`,
          }}
        />
      </>
    );
  }
  if (style === "sunburst") {
    return (
      <>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-conic-gradient(from 0deg at 50% 38%, rgba(255,186,40,0.16) 0deg 9deg, transparent 9deg 18deg)",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 58% 52% at 50% 46%, ${doc.paper.color} 45%, transparent 100%)`,
          }}
        />
      </>
    );
  }
  // Put each ruled line just under the handwriting baseline.
  const lineY = line / 2 + fontPx * 0.36;
  const originY = padTop + lineY - line;

  if (style === "lined") {
    const regionTop = Math.max(8, padTop * 0.55);
    const regionBottom = height - padTop * 0.5;
    const offset = (((originY - regionTop) % line) + line) % line;
    return (
      <>
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: regionTop,
            height: regionBottom - regionTop,
            backgroundImage: `linear-gradient(to bottom, transparent calc(100% - 1.2px), rgba(84,116,168,0.28) calc(100% - 1.2px))`,
            backgroundSize: `100% ${line}px`,
            backgroundPosition: `0 ${offset}px`,
          }}
        />
        <div
          aria-hidden
          style={{ position: "absolute", top: 0, bottom: 0, left: padX * 0.72, width: 1.4, background: "rgba(214,98,112,0.32)" }}
        />
      </>
    );
  }

  const cell = line;
  const offY = ((originY % cell) + cell) % cell;
  const offX = padX % cell;
  if (style === "dotted") {
    return (
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(70,64,56,0.26) 1.15px, transparent 1.6px)",
          backgroundSize: `${cell}px ${cell}px`,
          backgroundPosition: `${offX - cell / 2}px ${offY - cell / 2}px`,
        }}
      />
    );
  }
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(to bottom, rgba(84,116,168,0.17) 1px, transparent 1px), linear-gradient(to right, rgba(84,116,168,0.17) 1px, transparent 1px)",
        backgroundSize: `${cell}px ${cell}px`,
        backgroundPosition: `${offX}px ${offY}px`,
      }}
    />
  );
}

/** A borderless textarea that sizes itself to its content, so the paper is the editor. */
function InkField({ value, onChange, minHeight }: { value: string; onChange: (v: string) => void; minHeight: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.max(minHeight, el.scrollHeight)}px`;
  }, [value, minHeight]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={12000}
      aria-label="Your message"
      placeholder="Start writing your letter…"
      spellCheck
      rows={1}
      className="block w-full resize-none overflow-hidden border-0 bg-transparent p-0 outline-none placeholder:opacity-35 focus:outline-none"
      style={{ outline: "none", font: "inherit", lineHeight: "inherit", letterSpacing: "inherit", color: "inherit", textAlign: "inherit", pointerEvents: "auto", caretColor: "currentColor" }}
    />
  );
}

const TextLayer = memo(function TextLayer({
  doc,
  placeholder,
  onOverflowChange,
  onMessageChange,
}: {
  doc: LetterDocument;
  placeholder?: boolean;
  onOverflowChange?: (o: boolean) => void;
  onMessageChange?: (v: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { fontPx, line, padX, padTop, padBottom } = paperMetrics(doc);
  const t = doc.typography;
  const greeting = greetingLine(doc);
  const empty = !doc.message.trim();
  const blockAlign = t.alignment === "justify" ? "left" : t.alignment;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !onOverflowChange) return;
    const check = () => onOverflowChange(el.scrollHeight > el.clientHeight + 2);
    check();
    // Fonts may arrive late and change metrics.
    if (typeof document !== "undefined" && document.fonts) document.fonts.ready.then(check).catch(() => {});
  });

  const ink: CSSProperties = {
    color: t.inkColor,
    textShadow: `0 0 0.6px ${t.inkColor}55`,
  };

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: padX,
        right: padX,
        top: padTop,
        bottom: padBottom,
        overflow: "hidden",
        fontFamily: handwritingFamily(t.fontFamily),
        fontSize: fontPx,
        lineHeight: `${line}px`,
        letterSpacing: `${t.letterSpacing}px`,
        textAlign: t.alignment,
        overflowWrap: "break-word",
        wordBreak: "break-word",
        pointerEvents: "none",
        ...ink,
      }}
    >
      {doc.date?.trim() ? <div style={{ textAlign: "right", fontSize: fontPx * 0.85 }}>{doc.date}</div> : null}
      {greeting ? <div style={{ marginTop: doc.date?.trim() ? line : 0, textAlign: blockAlign }}>{greeting}</div> : null}
      <div style={{ whiteSpace: "pre-wrap", marginTop: greeting ? line * 0.5 : 0, minHeight: line }}>
        {onMessageChange ? (
          <InkField value={doc.message} onChange={onMessageChange} minHeight={line * 3} />
        ) : empty && placeholder ? (
          <span style={{ opacity: 0.32 }}>Start writing your letter… your words will appear here in ink.</span>
        ) : (
          doc.message
        )}
      </div>
      {doc.closing?.trim() || doc.signature?.trim() ? (
        <div style={{ marginTop: line, textAlign: blockAlign }}>
          {doc.closing?.trim() ? <div>{doc.closing}</div> : null}
          {doc.signature?.trim() ? (
            <div style={{ fontSize: fontPx * 1.25, lineHeight: `${line * 1.4}px` }}>{doc.signature}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
},
// Re-render the ink only when the words or type change — not while decorations are dragged.
(a, b) =>
  a.placeholder === b.placeholder &&
  a.onOverflowChange === b.onOverflowChange &&
  a.onMessageChange === b.onMessageChange &&
  a.doc.message === b.doc.message &&
  a.doc.greeting === b.doc.greeting &&
  a.doc.recipient === b.doc.recipient &&
  a.doc.date === b.doc.date &&
  a.doc.closing === b.doc.closing &&
  a.doc.signature === b.doc.signature &&
  a.doc.paper.size === b.doc.paper.size &&
  a.doc.typography === b.doc.typography);

/**
 * The one letter renderer. Renders at true logical size (see PAPER_DIMENSIONS);
 * wrap in <FittedPaper> to scale it to its container.
 */
export const Paper = forwardRef<HTMLDivElement, PaperProps>(function Paper(
  { doc, edit, placeholder, onOverflowChange, onMessageChange, className, style },
  ref,
) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const { width, height } = paperMetrics(doc);
  const edge = doc.paper.edgeStyle;

  useEffect(() => {
    if (!edit) return;
    const onDown = (e: PointerEvent) => {
      if (innerRef.current && !innerRef.current.contains(e.target as Node)) return;
      if ((e.target as HTMLElement).closest("[data-decoration]")) return;
      edit.onSelect(null);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [edit]);

  return (
    <div
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={className}
      data-paper
      style={{
        position: "relative",
        width,
        height,
        backgroundColor: doc.paper.color,
        borderRadius: edge === "rounded" ? Math.round(width * 0.035) : edge === "straight" ? 2 : 0,
        clipPath: edge === "torn" ? TORN_CLIP_PATH : undefined,
        overflow: "hidden",
        isolation: "isolate",
        ...style,
      }}
    >
      {textureLayers(doc.paper.texture).map((layer, i) => (
        <div key={i} aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", ...layer }} />
      ))}
      <PatternLayer doc={doc} />
      {/* Decorations sit beneath the ink so they never hide the words. */}
      <div style={{ position: "absolute", inset: 0 }}>
        {doc.decorations.map((d) =>
          edit ? (
            <EditableDecoration key={d.id} decoration={d} paperRef={innerRef} paperWidth={width} paperHeight={height} edit={edit} />
          ) : (
            <div
              key={d.id}
              aria-hidden
              style={{
                position: "absolute",
                left: d.x * width - (d.width * width) / 2,
                top: d.y * height - (d.height * width) / 2,
                width: d.width * width,
                height: d.height * width,
                transform: `rotate(${d.rotation}deg)`,
              }}
            >
              <DecorationArt type={d.type} />
            </div>
          ),
        )}
      </div>
      <TextLayer doc={doc} placeholder={placeholder} onOverflowChange={onOverflowChange} onMessageChange={onMessageChange} />
    </div>
  );
});
