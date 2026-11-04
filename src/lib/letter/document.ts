import type { LetterDocument } from "./types";

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function todayLabel(d = new Date()): string {
  return d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

export function createBlankLetter(overrides: Partial<LetterDocument> = {}): LetterDocument {
  const now = new Date().toISOString();
  return {
    id: newId(),
    version: 1,
    recipient: "",
    date: todayLabel(),
    greeting: "Dear",
    message: "",
    closing: "With love,",
    signature: "",
    paper: { color: "#FBF4E6", style: "blank", texture: "grainy", size: "A5", edgeStyle: "straight" },
    typography: {
      fontFamily: "dancing-script",
      fontSize: 22,
      inkColor: "#1B2A4A",
      lineHeight: 1.6,
      letterSpacing: 0,
      alignment: "left",
    },
    decorations: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function greetingLine(doc: Pick<LetterDocument, "greeting" | "recipient">): string {
  const parts = [doc.greeting?.trim(), doc.recipient?.trim()].filter(Boolean);
  if (parts.length === 0) return "";
  const line = parts.join(" ");
  return /[,.!?:;]$/.test(line) ? line : `${line},`;
}

export function hasWriting(doc: LetterDocument): boolean {
  return Boolean(doc.message.trim() || doc.signature?.trim() || doc.recipient?.trim());
}

/** Human label for lists: title → first line of message → recipient → fallback. */
export function letterLabel(doc: LetterDocument): string {
  if (doc.title?.trim()) return doc.title.trim();
  const first = doc.message.split("\n").find((l) => l.trim());
  if (first) return first.trim().slice(0, 64) + (first.trim().length > 64 ? "…" : "");
  if (doc.recipient?.trim()) return `A letter for ${doc.recipient.trim()}`;
  return "Untitled letter";
}

export function fileSlug(doc: LetterDocument): string {
  const base = (doc.title || (doc.recipient ? `for-${doc.recipient}` : "letter"))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `dearly-${base || "letter"}`;
}

export function duplicateLetter(doc: LetterDocument): LetterDocument {
  const now = new Date().toISOString();
  return {
    ...structuredClone(doc),
    id: newId(),
    title: doc.title ? `${doc.title} (copy)` : undefined,
    decorations: doc.decorations.map((d) => ({ ...d, id: newId() })),
    createdAt: now,
    updatedAt: now,
  };
}
