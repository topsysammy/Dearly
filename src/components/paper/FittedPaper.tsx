"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { PAPER_DIMENSIONS } from "@/lib/letter/options";
import type { LetterDocument } from "@/lib/letter/types";
import { Paper, type PaperEditProps } from "./Paper";

type Props = {
  doc: LetterDocument;
  edit?: Omit<PaperEditProps, "scale">;
  placeholder?: boolean;
  onOverflowChange?: (o: boolean) => void;
  /** Editor only: type straight onto the paper. */
  onMessageChange?: (v: string) => void;
  /** Also constrain by available height (px). */
  maxHeight?: number;
  shadow?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** Scales the true-size <Paper> to fit its container while preserving the A-series aspect ratio. */
export function FittedPaper({ doc, edit, placeholder, onOverflowChange, onMessageChange, maxHeight, shadow = true, className, style }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [availWidth, setAvailWidth] = useState(0);
  const { width, height } = PAPER_DIMENSIONS[doc.paper.size];

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const update = () => setAvailWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  let scale = availWidth ? availWidth / width : 0;
  if (maxHeight && scale) scale = Math.min(scale, maxHeight / height);
  const w = width * scale;
  const h = height * scale;

  return (
    <div ref={box} className={className} style={{ width: "100%", ...style }}>
      <div
        style={{
          width: scale ? w : "100%",
          height: scale ? h : undefined,
          aspectRatio: scale ? undefined : `${width} / ${height}`,
          margin: "0 auto",
          position: "relative",
          filter: shadow
            ? "drop-shadow(0 1px 1px rgba(41,39,34,0.08)) drop-shadow(0 10px 24px rgba(41,39,34,0.12))"
            : undefined,
        }}
      >
        {scale > 0 && (
          <div style={{ position: "absolute", top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <Paper
              doc={doc}
              placeholder={placeholder}
              onOverflowChange={onOverflowChange}
              onMessageChange={onMessageChange}
              edit={edit ? { ...edit, scale } : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}
