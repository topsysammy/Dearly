import type { EdgeStyle, FontId, PaperSize, PaperStyle, PaperTexture, TextAlignment } from "./types";

export type FontOption = {
  id: FontId;
  name: string;
  category: "Elegant cursive" | "Romantic" | "Casual" | "Neat" | "Vintage" | "Minimal";
  /** Multiplier so every face reads at a comparable size for the same font-size setting. */
  scale: number;
};

export const FONT_OPTIONS: FontOption[] = [
  { id: "dancing-script", name: "Dancing Script", category: "Elegant cursive", scale: 1.05 },
  { id: "great-vibes", name: "Great Vibes", category: "Romantic", scale: 1.3 },
  { id: "parisienne", name: "Parisienne", category: "Romantic", scale: 1.15 },
  { id: "caveat", name: "Caveat", category: "Casual", scale: 1.2 },
  { id: "nothing-you-could-do", name: "Nothing You Could Do", category: "Casual", scale: 0.9 },
  { id: "patrick-hand", name: "Patrick Hand", category: "Neat", scale: 1.0 },
  { id: "kalam", name: "Kalam", category: "Neat", scale: 0.92 },
  { id: "homemade-apple", name: "Homemade Apple", category: "Vintage", scale: 0.78 },
  { id: "la-belle-aurore", name: "La Belle Aurore", category: "Vintage", scale: 1.0 },
  { id: "shadows-into-light", name: "Shadows Into Light", category: "Minimal", scale: 1.05 },
];

export const FONT_IDS = FONT_OPTIONS.map((f) => f.id) as [FontId, ...FontId[]];

export function getFontOption(id: FontId): FontOption {
  return FONT_OPTIONS.find((f) => f.id === id) ?? FONT_OPTIONS[0];
}

export type Swatch = { name: string; value: string };

export const INK_COLORS: Swatch[] = [
  { name: "Black", value: "#1F1D1A" },
  { name: "Dark blue", value: "#1E3A8A" },
  { name: "Navy", value: "#1B2A4A" },
  { name: "Brown", value: "#5B3A24" },
  { name: "Burgundy", value: "#7A1F35" },
  { name: "Dark green", value: "#1F4D3A" },
  { name: "Purple", value: "#4B2A86" },
];

export const PAPER_COLORS: Swatch[] = [
  { name: "White", value: "#FFFFFF" },
  { name: "Cream", value: "#FBF4E6" },
  { name: "Beige", value: "#EFE4D2" },
  { name: "Pink", value: "#FBE7EA" },
  { name: "Light blue", value: "#E6F0FA" },
  { name: "Lavender", value: "#EDE7F8" },
  { name: "Mint", value: "#E5F4EC" },
];

export const PAPER_STYLES: { id: PaperStyle; name: string }[] = [
  { id: "blank", name: "Blank" },
  { id: "lined", name: "Lined" },
  { id: "dotted", name: "Dotted" },
  { id: "grid", name: "Grid" },
  { id: "halftone", name: "Comic" },
  { id: "sunburst", name: "Sunburst" },
  { id: "speedlines", name: "Speed lines" },
  { id: "kawaii", name: "Kawaii" },
];

export const PAPER_TEXTURES: { id: PaperTexture; name: string; hint: string }[] = [
  { id: "smooth", name: "Smooth", hint: "Clean, bright stock" },
  { id: "grainy", name: "Grainy", hint: "Fine paper tooth" },
  { id: "vintage", name: "Vintage", hint: "Aged, warm edges" },
  { id: "recycled", name: "Recycled", hint: "Flecks and fibres" },
  { id: "linen", name: "Linen", hint: "Woven stationery" },
];

export const PAPER_SIZES: { id: PaperSize; name: string; hint: string }[] = [
  { id: "A5", name: "A5", hint: "Note card · 148 × 210 mm" },
  { id: "A4", name: "A4", hint: "Full letter · 210 × 297 mm" },
];

export const EDGE_STYLES: { id: EdgeStyle; name: string }[] = [
  { id: "straight", name: "Straight" },
  { id: "rounded", name: "Rounded" },
  { id: "torn", name: "Torn" },
];

export const ALIGNMENTS: TextAlignment[] = ["left", "center", "right", "justify"];

/** Logical canvas size in CSS px (96dpi) — real proportions so A5 holds less text than A4. */
export const PAPER_DIMENSIONS: Record<PaperSize, { width: number; height: number; mm: [number, number] }> = {
  A4: { width: 794, height: 1123, mm: [210, 297] },
  A5: { width: 559, height: 794, mm: [148, 210] },
};

export const FONT_SIZE_RANGE = { min: 14, max: 40, step: 1 };
export const LINE_HEIGHT_RANGE = { min: 1.2, max: 2.4, step: 0.05 };
export const LETTER_SPACING_RANGE = { min: -1, max: 4, step: 0.25 };
