/**
 * The single structured document that powers the editor, preview, exports and
 * the recipient-facing letter. Keep it serialisable (plain JSON).
 */

export type PaperStyle = "blank" | "lined" | "dotted" | "grid" | "halftone" | "sunburst" | "speedlines" | "kawaii";
export type PaperTexture = "smooth" | "grainy" | "vintage" | "recycled" | "linen";
export type PaperSize = "A4" | "A5";
export type EdgeStyle = "straight" | "rounded" | "torn";
export type TextAlignment = "left" | "center" | "right" | "justify";

export type FontId =
  | "dancing-script"
  | "great-vibes"
  | "parisienne"
  | "caveat"
  | "nothing-you-could-do"
  | "patrick-hand"
  | "kalam"
  | "homemade-apple"
  | "la-belle-aurore"
  | "shadows-into-light";

export type DecorationPlacement = {
  id: string;
  /** Key into the decoration catalog. */
  type: string;
  /** Centre of the decoration as a fraction (0–1) of paper width. */
  x: number;
  /** Centre of the decoration as a fraction (0–1) of paper height. */
  y: number;
  /** Width as a fraction of paper width. */
  width: number;
  /** Height as a fraction of paper width (keeps aspect independent of paper height). */
  height: number;
  /** Degrees. */
  rotation: number;
};

export type LetterDocument = {
  id: string;
  version: 1;
  title?: string;
  recipient?: string;
  date?: string;
  greeting?: string;
  message: string;
  closing?: string;
  signature?: string;
  templateId?: string;
  paper: {
    color: string;
    style: PaperStyle;
    texture: PaperTexture;
    size: PaperSize;
    edgeStyle: EdgeStyle;
  };
  typography: {
    fontFamily: FontId;
    fontSize: number;
    inkColor: string;
    lineHeight: number;
    letterSpacing: number;
    alignment: TextAlignment;
  };
  decorations: DecorationPlacement[];
  createdAt: string;
  updatedAt: string;
};

/** A link the signed-in sender has generated. */
export type LocalShare = {
  token: string;
  /** Only present right after creation; account ownership is what authorises management. */
  revokeKey?: string;
  url: string;
  letterId: string;
  /** Title/first line captured at share time, for display in the library. */
  label: string;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  /** Last status the server reported. */
  lastKnownStatus?: ShareStatus;
  firstOpenedAt?: string | null;
  openCount?: number;
};

export type ShareStatus = "active" | "revoked" | "expired" | "missing";
