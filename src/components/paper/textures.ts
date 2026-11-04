import type { CSSProperties } from "react";
import type { PaperTexture } from "@/lib/letter/types";

/** Deterministic PRNG so textures and torn edges are identical everywhere (editor, export, recipient). */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/*
 * Textures are generated once per session as small PNG tiles on a canvas.
 * Plain raster tiles with alpha (no SVG filters, no blend modes) render identically
 * on screen and inside html-to-image exports in every browser.
 */
const cache = new Map<string, string>();
type RGB = [number, number, number];

function tile(key: string, size: number, draw: (ctx: CanvasRenderingContext2D, rand: () => number) => void): string | null {
  if (typeof document === "undefined") return null;
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  draw(ctx, seeded(key.split("").reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7)));
  const url = `url("${c.toDataURL("image/png")}")`;
  cache.set(key, url);
  return url;
}

/** Per-pixel grain. */
function grain(key: string, rgb: RGB, maxAlpha: number, size = 192) {
  return tile(key, size, (ctx, rand) => {
    const img = ctx.createImageData(size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = rand();
      const shade = v < 0.5 ? 0 : 1;
      img.data[i] = rgb[0] + shade * 30;
      img.data[i + 1] = rgb[1] + shade * 30;
      img.data[i + 2] = rgb[2] + shade * 30;
      img.data[i + 3] = Math.round(Math.pow(rand(), 2.2) * maxAlpha * 255);
    }
    ctx.putImageData(img, 0, 0);
  });
}

/** Soft, cloudy low-frequency noise (blotches, uneven pulp). */
function clouds(key: string, rgb: RGB, maxAlpha: number, size = 384, cells = 18) {
  return tile(key, size, (ctx, rand) => {
    const small = document.createElement("canvas");
    small.width = small.height = cells;
    const sctx = small.getContext("2d")!;
    const img = sctx.createImageData(cells, cells);
    for (let i = 0; i < img.data.length; i += 4) {
      img.data[i] = rgb[0];
      img.data[i + 1] = rgb[1];
      img.data[i + 2] = rgb[2];
      img.data[i + 3] = Math.round(Math.pow(rand(), 3) * maxAlpha * 255);
    }
    sctx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    // Draw a 3×3 wrap so the tile edges match up when repeated.
    const step = size;
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++) ctx.drawImage(small, dx * step, dy * step, step, step);
  });
}

/** Recycled-paper flecks and short fibres. */
function flecks(key: string, size = 300) {
  return tile(key, size, (ctx, rand) => {
    for (let i = 0; i < 70; i++) {
      const x = rand() * size;
      const y = rand() * size;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rand() * Math.PI);
      ctx.fillStyle = rand() > 0.5 ? `rgba(120,104,80,${0.18 + rand() * 0.35})` : `rgba(170,152,120,${0.2 + rand() * 0.3})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, 0.6 + rand() * 1.8, 0.4 + rand() * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.lineWidth = 0.6;
    for (let i = 0; i < 14; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const len = 6 + rand() * 12;
      const a = rand() * Math.PI;
      ctx.strokeStyle = `rgba(140,122,95,${0.22 + rand() * 0.2})`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.cos(a) * len * 0.5, y + Math.sin(a) * len * 0.5 + 2, x + Math.cos(a) * len, y + Math.sin(a) * len);
      ctx.stroke();
    }
  });
}

const layer = (url: string | null, extra: CSSProperties = {}): CSSProperties[] => (url ? [{ backgroundImage: url, ...extra }] : []);

/** Overlay layers rendered above the paper colour and below the ink. */
export function textureLayers(texture: PaperTexture): CSSProperties[] {
  switch (texture) {
    case "smooth":
      return layer(grain("smooth", [70, 62, 50], 0.07));
    case "grainy":
      return [...layer(grain("grainy", [64, 56, 44], 0.17)), ...layer(clouds("grainy-c", [90, 76, 56], 0.035))];
    case "vintage":
      return [
        ...layer(grain("vintage", [92, 66, 34], 0.17)),
        ...layer(clouds("vintage-c", [140, 98, 44], 0.16, 420, 14)),
        {
          backgroundImage:
            "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(150,105,45,0.14) 85%, rgba(120,80,30,0.28) 100%)",
        },
      ];
    case "recycled":
      return [
        ...layer(grain("recycled", [80, 72, 58], 0.16)),
        ...layer(clouds("recycled-c", [110, 98, 76], 0.08, 360, 24)),
        ...layer(flecks("recycled-f")),
      ];
    case "linen":
      return [
        {
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(90,70,40,0.05) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(90,70,40,0.045) 0 1px, transparent 1px 3px)",
        },
        ...layer(grain("linen", [70, 62, 50], 0.08)),
      ];
  }
}

/** Torn paper: jagged top & bottom edges as a percentage polygon (resolution independent). */
export const TORN_CLIP_PATH = (() => {
  const rand = seeded(42);
  const pts: string[] = [];
  const steps = 64;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;
    pts.push(`${x.toFixed(2)}% ${(rand() * 1.1 + (i % 2) * 0.35).toFixed(2)}%`);
  }
  for (let i = steps; i >= 0; i--) {
    const x = (i / steps) * 100;
    pts.push(`${x.toFixed(2)}% ${(100 - rand() * 1.1 - (i % 2) * 0.35).toFixed(2)}%`);
  }
  return `polygon(${pts.join(", ")})`;
})();
