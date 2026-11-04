/**
 * Decoration metadata. Pure data (no JSX) so it can be shared by the API validator.
 * The artwork for each type lives in components/decorations/DecorationArt.tsx.
 */

export const DECORATION_TYPES = [
  "heart",
  "heart-outline",
  "heart-trio",
  "rose",
  "daisy",
  "sprig",
  "tulip",
  "star",
  "sparkles",
  "moon",
  "butterfly",
  "butterfly-blue",
  "swirl",
  "bow",
  "cloud",
  "washi-pink",
  "washi-mint",
  "washi-lavender",
  "washi-kraft",
  "stamp-heart",
  "stamp-flower",
  "postmark",
  "cake",
  "balloon",
  "envelope",
] as const;

export type DecorationType = (typeof DECORATION_TYPES)[number];

export type DecorationCategory =
  | "Hearts"
  | "Flowers"
  | "Stars"
  | "Butterflies"
  | "Doodles"
  | "Washi tape"
  | "Stamps"
  | "Illustrations";

export type DecorationMeta = {
  type: DecorationType;
  name: string;
  category: DecorationCategory;
  /** viewBox width/height — the artwork's natural size. */
  vw: number;
  vh: number;
  /** Default width as a fraction of paper width. */
  defaultWidth: number;
};

export const DECORATIONS: DecorationMeta[] = [
  { type: "heart", name: "Heart", category: "Hearts", vw: 100, vh: 90, defaultWidth: 0.1 },
  { type: "heart-outline", name: "Sketched heart", category: "Hearts", vw: 100, vh: 90, defaultWidth: 0.11 },
  { type: "heart-trio", name: "Little hearts", category: "Hearts", vw: 160, vh: 80, defaultWidth: 0.16 },
  { type: "rose", name: "Rose", category: "Flowers", vw: 100, vh: 110, defaultWidth: 0.13 },
  { type: "daisy", name: "Daisy", category: "Flowers", vw: 100, vh: 100, defaultWidth: 0.11 },
  { type: "sprig", name: "Olive sprig", category: "Flowers", vw: 80, vh: 140, defaultWidth: 0.09 },
  { type: "tulip", name: "Tulip", category: "Flowers", vw: 70, vh: 130, defaultWidth: 0.08 },
  { type: "star", name: "Star", category: "Stars", vw: 100, vh: 96, defaultWidth: 0.09 },
  { type: "sparkles", name: "Sparkles", category: "Stars", vw: 100, vh: 100, defaultWidth: 0.11 },
  { type: "moon", name: "Moon & stars", category: "Stars", vw: 110, vh: 100, defaultWidth: 0.12 },
  { type: "butterfly", name: "Butterfly", category: "Butterflies", vw: 120, vh: 100, defaultWidth: 0.13 },
  { type: "butterfly-blue", name: "Blue butterfly", category: "Butterflies", vw: 120, vh: 100, defaultWidth: 0.12 },
  { type: "swirl", name: "Swirl", category: "Doodles", vw: 160, vh: 60, defaultWidth: 0.2 },
  { type: "bow", name: "Ribbon bow", category: "Doodles", vw: 120, vh: 84, defaultWidth: 0.13 },
  { type: "cloud", name: "Cloud", category: "Doodles", vw: 130, vh: 80, defaultWidth: 0.14 },
  { type: "washi-pink", name: "Pink stripe tape", category: "Washi tape", vw: 220, vh: 44, defaultWidth: 0.26 },
  { type: "washi-mint", name: "Mint dot tape", category: "Washi tape", vw: 220, vh: 44, defaultWidth: 0.26 },
  { type: "washi-lavender", name: "Lavender check tape", category: "Washi tape", vw: 220, vh: 44, defaultWidth: 0.26 },
  { type: "washi-kraft", name: "Kraft tape", category: "Washi tape", vw: 220, vh: 44, defaultWidth: 0.26 },
  { type: "stamp-heart", name: "Love stamp", category: "Stamps", vw: 90, vh: 110, defaultWidth: 0.12 },
  { type: "stamp-flower", name: "Flower stamp", category: "Stamps", vw: 90, vh: 110, defaultWidth: 0.12 },
  { type: "postmark", name: "Postmark", category: "Stamps", vw: 150, vh: 90, defaultWidth: 0.18 },
  { type: "cake", name: "Birthday cake", category: "Illustrations", vw: 100, vh: 100, defaultWidth: 0.13 },
  { type: "balloon", name: "Balloon", category: "Illustrations", vw: 70, vh: 140, defaultWidth: 0.08 },
  { type: "envelope", name: "Envelope", category: "Illustrations", vw: 110, vh: 76, defaultWidth: 0.12 },
];

export const DECORATION_CATEGORIES: DecorationCategory[] = [
  "Hearts",
  "Flowers",
  "Stars",
  "Butterflies",
  "Doodles",
  "Washi tape",
  "Stamps",
  "Illustrations",
];

export function getDecorationMeta(type: string): DecorationMeta | undefined {
  return DECORATIONS.find((d) => d.type === type);
}
