"use client";

import { useRef, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { RotateCw, X, Scaling } from "lucide-react";
import { DecorationArt } from "@/components/decorations/DecorationArt";
import { getDecorationMeta } from "@/lib/decorations/catalog";
import type { DecorationPlacement } from "@/lib/letter/types";
import type { PaperEditProps } from "./Paper";

type Mode = "move" | "resize" | "rotate";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function EditableDecoration({
  decoration: d,
  paperRef,
  paperWidth,
  paperHeight,
  edit,
}: {
  decoration: DecorationPlacement;
  paperRef: RefObject<HTMLDivElement | null>;
  paperWidth: number;
  paperHeight: number;
  edit: PaperEditProps;
}) {
  const drag = useRef<{
    mode: Mode;
    startX: number;
    startY: number;
    orig: DecorationPlacement;
    rect: DOMRect;
    startDist: number;
    startAngle: number;
  } | null>(null);
  const selected = edit.selectedId === d.id;
  const meta = getDecorationMeta(d.type);
  const handle = Math.max(22, 30 / Math.max(edit.scale, 0.01));
  const inv = 1 / Math.max(edit.scale, 0.01);

  const begin = (mode: Mode) => (e: ReactPointerEvent) => {
    const paper = paperRef.current;
    if (!paper) return;
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    edit.onSelect(d.id);
    const rect = paper.getBoundingClientRect();
    const cx = rect.left + d.x * rect.width;
    const cy = rect.top + d.y * rect.height;
    drag.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      orig: d,
      rect,
      startDist: Math.hypot(e.clientX - cx, e.clientY - cy) || 1,
      startAngle: Math.atan2(e.clientY - cy, e.clientX - cx),
    };
  };

  const move = (e: ReactPointerEvent) => {
    const s = drag.current;
    if (!s) return;
    e.preventDefault();
    const { rect, orig } = s;
    if (s.mode === "move") {
      edit.onChange(d.id, {
        x: clamp(orig.x + (e.clientX - s.startX) / rect.width, 0, 1),
        y: clamp(orig.y + (e.clientY - s.startY) / rect.height, 0, 1),
      });
      return;
    }
    const cx = rect.left + orig.x * rect.width;
    const cy = rect.top + orig.y * rect.height;
    if (s.mode === "resize") {
      const ratio = Math.hypot(e.clientX - cx, e.clientY - cy) / s.startDist;
      const width = clamp(orig.width * ratio, 0.04, 0.9);
      edit.onChange(d.id, { width, height: (orig.height / orig.width) * width });
    } else {
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      let rotation = orig.rotation + ((angle - s.startAngle) * 180) / Math.PI;
      rotation = ((((rotation + 180) % 360) + 360) % 360) - 180;
      if (Math.abs(rotation) < 4) rotation = 0;
      edit.onChange(d.id, { rotation: Math.round(rotation) });
    }
  };

  const end = (e: ReactPointerEvent) => {
    if (!drag.current) return;
    drag.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 0.05 : 0.01;
    const map: Record<string, Partial<DecorationPlacement>> = {
      ArrowLeft: { x: clamp(d.x - step, 0, 1) },
      ArrowRight: { x: clamp(d.x + step, 0, 1) },
      ArrowUp: { y: clamp(d.y - step, 0, 1) },
      ArrowDown: { y: clamp(d.y + step, 0, 1) },
      "[": { rotation: d.rotation - 5 },
      "]": { rotation: d.rotation + 5 },
    };
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      edit.onRemove(d.id);
      return;
    }
    if (e.key === "+" || e.key === "=" || e.key === "-") {
      e.preventDefault();
      const width = clamp(d.width * (e.key === "-" ? 0.92 : 1.08), 0.04, 0.9);
      edit.onChange(d.id, { width, height: (d.height / d.width) * width });
      return;
    }
    if (map[e.key]) {
      e.preventDefault();
      edit.onChange(d.id, map[e.key]);
    }
  };

  const w = d.width * paperWidth;
  const h = d.height * paperWidth;

  const handleStyle = {
    width: handle,
    height: handle,
    borderWidth: 1.5 * inv,
    borderStyle: "solid" as const,
  };

  return (
    <div
      data-decoration
      role="button"
      tabIndex={0}
      aria-label={`${meta?.name ?? "Decoration"}. Drag to move, arrow keys to nudge, Delete to remove.`}
      aria-pressed={selected}
      onKeyDown={onKey}
      onFocus={() => edit.onSelect(d.id)}
      onPointerDown={begin("move")}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      className="group outline-none"
      style={{
        position: "absolute",
        left: d.x * paperWidth - w / 2,
        top: d.y * paperHeight - h / 2,
        width: w,
        height: h,
        transform: `rotate(${d.rotation}deg)`,
        touchAction: "none",
        cursor: "grab",
        zIndex: selected ? 5 : 1,
      }}
    >
      <DecorationArt type={d.type} />
      <div
        aria-hidden
        className={selected ? "" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"}
        style={{
          position: "absolute",
          inset: -6 * inv,
          border: `${1.5 * inv}px dashed rgba(104,67,214,${selected ? 0.9 : 0.45})`,
          borderRadius: 6 * inv,
          pointerEvents: "none",
        }}
      />
      {selected && (
        <>
          <button
            type="button"
            aria-label="Rotate"
            onPointerDown={begin("rotate")}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            className="absolute flex items-center justify-center rounded-full border-white bg-accent text-white shadow-md"
            style={{ ...handleStyle, left: "50%", top: -handle - 12 * inv, marginLeft: -handle / 2, touchAction: "none", cursor: "grab" }}
          >
            <RotateCw style={{ width: handle * 0.5, height: handle * 0.5 }} />
          </button>
          <button
            type="button"
            aria-label="Resize"
            onPointerDown={begin("resize")}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            className="absolute flex items-center justify-center rounded-full border-white bg-accent text-white shadow-md"
            style={{ ...handleStyle, right: -handle / 2 - 6 * inv, bottom: -handle / 2 - 6 * inv, touchAction: "none", cursor: "nwse-resize" }}
          >
            <Scaling style={{ width: handle * 0.5, height: handle * 0.5 }} />
          </button>
          <button
            type="button"
            aria-label="Remove decoration"
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onClick={(e) => {
              e.stopPropagation();
              edit.onRemove(d.id);
            }}
            className="absolute flex items-center justify-center rounded-full border-white bg-ink text-white shadow-md"
            style={{ ...handleStyle, left: -handle / 2 - 6 * inv, top: -handle / 2 - 6 * inv }}
          >
            <X style={{ width: handle * 0.5, height: handle * 0.5 }} />
          </button>
        </>
      )}
    </div>
  );
}
