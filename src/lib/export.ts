"use client";

import { handwritingFamily } from "@/lib/fonts";
import { fileSlug } from "@/lib/letter/document";
import { getFontOption, PAPER_DIMENSIONS } from "@/lib/letter/options";
import type { LetterDocument } from "@/lib/letter/types";

export type ExportFormat = "png" | "jpg" | "pdf";

/** ~300 dpi for both A4 (794px → 2382px) and A5. */
const PIXEL_RATIO = 3;

async function waitForFonts(doc: LetterDocument) {
  if (typeof document === "undefined" || !document.fonts) return;
  const size = Math.round(doc.typography.fontSize * getFontOption(doc.typography.fontFamily).scale);
  const sample = [doc.greeting, doc.recipient, doc.message.slice(0, 200), doc.signature].filter(Boolean).join(" ") || "Aa";
  const family = handwritingFamily(doc.typography.fontFamily);
  await Promise.race([
    Promise.all([document.fonts.load(`${size}px ${family}`, sample), document.fonts.ready]),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Fonts took too long to load.")), 10000)),
  ]);
}

const isWebKit = () =>
  typeof navigator !== "undefined" && /AppleWebKit/.test(navigator.userAgent) && !/Chrome|Chromium|Edg|Android/.test(navigator.userAgent);

/** Rasterise the off-screen, unscaled <Paper> node. */
export async function renderToCanvas(node: HTMLElement, doc: LetterDocument): Promise<HTMLCanvasElement> {
  await waitForFonts(doc);
  const { toCanvas } = await import("html-to-image");
  const { width, height } = PAPER_DIMENSIONS[doc.paper.size];
  const opts = { width, height, pixelRatio: PIXEL_RATIO, cacheBust: false, skipAutoScale: true };
  // WebKit sometimes paints web fonts/images only on the second pass.
  if (isWebKit()) await toCanvas(node, { ...opts, pixelRatio: 1 }).catch(() => {});
  const canvas = await toCanvas(node, opts);
  if (!canvas.width || !canvas.height) throw new Error("The letter rendered empty.");
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode the image."))), type, quality),
  );
}

/** JPG has no transparency: flatten onto white (matters for torn/rounded edges). */
function flatten(canvas: HTMLCanvasElement) {
  const out = document.createElement("canvas");
  out.width = canvas.width;
  out.height = canvas.height;
  const ctx = out.getContext("2d")!;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(canvas, 0, 0);
  return out;
}

export async function exportLetter(node: HTMLElement, doc: LetterDocument, format: ExportFormat): Promise<File> {
  const canvas = await renderToCanvas(node, doc);
  const name = fileSlug(doc);
  if (format === "png") return new File([await canvasToBlob(canvas, "image/png")], `${name}.png`, { type: "image/png" });
  const flat = flatten(canvas);
  if (format === "jpg")
    return new File([await canvasToBlob(flat, "image/jpeg", 0.94)], `${name}.jpg`, { type: "image/jpeg" });

  const { jsPDF } = await import("jspdf");
  const [wmm, hmm] = PAPER_DIMENSIONS[doc.paper.size].mm;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: doc.paper.size.toLowerCase(), compress: true });
  pdf.setProperties({ title: doc.title || "A letter", creator: "Dearly" });
  pdf.addImage(flat.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, wmm, hmm, undefined, "FAST");
  return new File([pdf.output("blob")], `${name}.pdf`, { type: "application/pdf" });
}

export function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function canShareFiles(file?: File) {
  try {
    return typeof navigator !== "undefined" && !!navigator.canShare && !!navigator.share && navigator.canShare({ files: file ? [file] : [new File([""], "x.png", { type: "image/png" })] });
  } catch {
    return false;
  }
}
