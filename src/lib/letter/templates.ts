import { createBlankLetter, newId } from "./document";
import type { DecorationPlacement, LetterDocument } from "./types";

export const TEMPLATE_CATEGORIES = [
  "All",
  "Love",
  "Birthday",
  "Thank You",
  "Personal",
  "Vintage",
  "Minimal",
  "Appreciation",
  "Friendship",
  "Heroes",
] as const;
export type TemplateCategory = Exclude<(typeof TEMPLATE_CATEGORIES)[number], "All">;

type Deco = Omit<DecorationPlacement, "id">;
const deco = (type: string, x: number, y: number, width: number, aspect: number, rotation = 0): Deco => ({
  type,
  x,
  y,
  width,
  height: width * aspect,
  rotation,
});

export type LetterTemplate = {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  paper: LetterDocument["paper"];
  typography: LetterDocument["typography"];
  decorations: Deco[];
  /** Example words, shown only in the gallery preview. */
  sample: Pick<LetterDocument, "recipient" | "greeting" | "message" | "closing" | "signature" | "date">;
};

export const TEMPLATES: LetterTemplate[] = [
  {
    id: "first-love",
    name: "First Love",
    category: "Love",
    description: "Blush paper, romantic script and a scatter of hearts.",
    paper: { color: "#FBE7EA", style: "blank", texture: "grainy", size: "A5", edgeStyle: "rounded" },
    typography: { fontFamily: "parisienne", fontSize: 22, inkColor: "#7A1F35", lineHeight: 1.7, letterSpacing: 0, alignment: "left" },
    decorations: [deco("heart-trio", 0.2, 0.055, 0.2, 0.5, -6), deco("heart", 0.88, 0.93, 0.09, 0.9, 12)],
    sample: {
      recipient: "Amara",
      greeting: "My dearest",
      message:
        "Every ordinary day becomes something I want to remember when you are in it. Thank you for the laughter, the quiet mornings and the way you hold my hand like it is the most natural thing in the world.",
      closing: "Forever yours,",
      signature: "Daniel",
      date: "14 February",
    },
  },
  {
    id: "midnight-rose",
    name: "Midnight Rose",
    category: "Love",
    description: "Warm cream stock, a single rose, elegant cursive.",
    paper: { color: "#FBF4E6", style: "blank", texture: "vintage", size: "A5", edgeStyle: "straight" },
    typography: { fontFamily: "dancing-script", fontSize: 22, inkColor: "#5B1A2B", lineHeight: 1.65, letterSpacing: 0, alignment: "left" },
    decorations: [deco("rose", 0.86, 0.9, 0.15, 1.1, -10), deco("sprig", 0.76, 0.9, 0.08, 1.75, -40)],
    sample: {
      recipient: "Love",
      greeting: "Dear",
      message:
        "I keep finding little pieces of you everywhere — in songs, in the smell of coffee, in the last light of evening. I wanted to write it down so you would always have it.",
      closing: "All my love,",
      signature: "J.",
      date: "A Sunday evening",
    },
  },
  {
    id: "confetti-wishes",
    name: "Confetti Wishes",
    category: "Birthday",
    description: "Sky-blue dotted paper with stars and sparkles.",
    paper: { color: "#E6F0FA", style: "dotted", texture: "smooth", size: "A5", edgeStyle: "rounded" },
    typography: { fontFamily: "caveat", fontSize: 22, inkColor: "#1B2A4A", lineHeight: 1.6, letterSpacing: 0.25, alignment: "left" },
    decorations: [
      deco("star", 0.11, 0.06, 0.09, 0.96, -12),
      deco("sparkles", 0.23, 0.045, 0.08, 1, 0),
      deco("star", 0.88, 0.92, 0.08, 0.96, 16),
    ],
    sample: {
      recipient: "Leo",
      greeting: "Happy birthday,",
      message:
        "Another trip around the sun and you somehow keep getting more wonderful. May this year bring you big adventures, slow breakfasts and everything you have been quietly hoping for.",
      closing: "Cheering you on,",
      signature: "Mia",
      date: "Your big day",
    },
  },
  {
    id: "sweet-sixteen-cake",
    name: "Cake & Candles",
    category: "Birthday",
    description: "Cheerful cream paper with a cake and a balloon.",
    paper: { color: "#FBF4E6", style: "blank", texture: "grainy", size: "A5", edgeStyle: "rounded" },
    typography: { fontFamily: "nothing-you-could-do", fontSize: 21, inkColor: "#4B2A86", lineHeight: 1.75, letterSpacing: 0, alignment: "left" },
    decorations: [deco("cake", 0.84, 0.9, 0.15, 1, 0), deco("balloon", 0.88, 0.1, 0.08, 2, 10), deco("bow", 0.14, 0.94, 0.12, 0.7, -8)],
    sample: {
      recipient: "Grandma",
      greeting: "Happy birthday",
      message:
        "Ninety years of stories, recipes and the best hugs in the whole family. Thank you for teaching us how to be kind and how to make the perfect pie crust.",
      closing: "With so much love,",
      signature: "Your grandchildren",
      date: "",
    },
  },
  {
    id: "thank-you-kindly",
    name: "Thank You Kindly",
    category: "Thank You",
    description: "Fresh mint paper, neat handwriting and an olive sprig.",
    paper: { color: "#E5F4EC", style: "blank", texture: "recycled", size: "A5", edgeStyle: "straight" },
    typography: { fontFamily: "patrick-hand", fontSize: 21, inkColor: "#1F4D3A", lineHeight: 1.6, letterSpacing: 0, alignment: "left" },
    decorations: [deco("sprig", 0.94, 0.3, 0.08, 1.75, 12), deco("daisy", 0.88, 0.92, 0.1, 1, 0)],
    sample: {
      recipient: "Mrs. Okafor",
      greeting: "Dear",
      message:
        "Thank you for believing in me this year. Your patience and encouragement made such a difference, and I will carry the lessons from your classroom for a long time.",
      closing: "Gratefully,",
      signature: "Ada",
      date: "June",
    },
  },
  {
    id: "dear-diary",
    name: "Dear Diary",
    category: "Personal",
    description: "Ruled notebook page with washi tape across the top.",
    paper: { color: "#FFFFFF", style: "lined", texture: "smooth", size: "A4", edgeStyle: "straight" },
    typography: { fontFamily: "kalam", fontSize: 20, inkColor: "#1E3A8A", lineHeight: 1.65, letterSpacing: 0, alignment: "left" },
    decorations: [deco("washi-pink", 0.5, 0.012, 0.28, 0.2, -3)],
    sample: {
      recipient: "",
      greeting: "Dear future me,",
      message:
        "Today I finally took the first step on something I have been putting off for months. I am scared and excited in equal measure. Remember this feeling, and remember that you started.",
      closing: "Proud of you,",
      signature: "Me",
      date: "A Tuesday",
    },
  },
  {
    id: "old-post",
    name: "Old Post",
    category: "Vintage",
    description: "Aged beige stock with a stamp, postmark and torn edge.",
    paper: { color: "#EFE4D2", style: "blank", texture: "vintage", size: "A5", edgeStyle: "torn" },
    typography: { fontFamily: "homemade-apple", fontSize: 20, inkColor: "#5B3A24", lineHeight: 1.85, letterSpacing: 0, alignment: "left" },
    decorations: [deco("stamp-heart", 0.86, 0.89, 0.12, 1.22, 4), deco("postmark", 0.68, 0.9, 0.18, 0.6, -8)],
    sample: {
      recipient: "Eleanor",
      greeting: "My dear",
      message: "The garden is in full bloom and the house feels too quiet without you. Write soon and tell me everything.",
      closing: "Ever yours,",
      signature: "Thomas",
      date: "Spring",
    },
  },
  {
    id: "la-belle",
    name: "Pressed Flowers",
    category: "Vintage",
    description: "Linen paper with tulips and an old-world hand.",
    paper: { color: "#F6EEDF", style: "blank", texture: "linen", size: "A5", edgeStyle: "straight" },
    typography: { fontFamily: "la-belle-aurore", fontSize: 22, inkColor: "#2E2A24", lineHeight: 1.75, letterSpacing: 0, alignment: "left" },
    decorations: [deco("tulip", 0.9, 0.86, 0.08, 1.85, 8), deco("tulip", 0.82, 0.9, 0.07, 1.85, -12)],
    sample: {
      recipient: "Rosa",
      greeting: "Dearest",
      message: "I found the flowers you pressed between the pages of my old book. They still smell faintly of summer.",
      closing: "Lovingly,",
      signature: "Ines",
      date: "",
    },
  },
  {
    id: "quiet-note",
    name: "Quiet Note",
    category: "Minimal",
    description: "Pure white, generous margins, nothing to distract.",
    paper: { color: "#FFFFFF", style: "blank", texture: "smooth", size: "A5", edgeStyle: "straight" },
    typography: { fontFamily: "shadows-into-light", fontSize: 22, inkColor: "#1F1D1A", lineHeight: 1.6, letterSpacing: 0.5, alignment: "left" },
    decorations: [],
    sample: {
      recipient: "Sam",
      greeting: "Hi",
      message: "Just a small note to say I am thinking of you. No reason. That is the reason.",
      closing: "—",
      signature: "K",
      date: "",
    },
  },
  {
    id: "grid-notes",
    name: "Grid Notes",
    category: "Minimal",
    description: "A neat graph-paper page for tidy thoughts.",
    paper: { color: "#FFFFFF", style: "grid", texture: "smooth", size: "A4", edgeStyle: "straight" },
    typography: { fontFamily: "patrick-hand", fontSize: 20, inkColor: "#1B2A4A", lineHeight: 1.5, letterSpacing: 0, alignment: "left" },
    decorations: [deco("washi-kraft", 0.14, 0.02, 0.2, 0.2, -30)],
    sample: {
      recipient: "Team",
      greeting: "Hello",
      message: "A few things I am grateful for this week: your ideas, your patience on Thursday, and the excellent biscuits.",
      closing: "Cheers,",
      signature: "Priya",
      date: "Friday",
    },
  },
  {
    id: "with-gratitude",
    name: "With Gratitude",
    category: "Appreciation",
    description: "Linen stationery, deep navy ink and a little sparkle.",
    paper: { color: "#FBF4E6", style: "blank", texture: "linen", size: "A5", edgeStyle: "rounded" },
    typography: { fontFamily: "dancing-script", fontSize: 22, inkColor: "#1B2A4A", lineHeight: 1.65, letterSpacing: 0, alignment: "left" },
    decorations: [deco("sparkles", 0.12, 0.055, 0.1, 1, 0), deco("sprig", 0.9, 0.88, 0.08, 1.75, 24)],
    sample: {
      recipient: "Coach Rivera",
      greeting: "Dear",
      message:
        "You saw something in us before we saw it in ourselves. Thank you for every early practice, every honest word and every time you stayed late.",
      closing: "With deep gratitude,",
      signature: "The whole team",
      date: "End of season",
    },
  },
  {
    id: "best-friends",
    name: "Best Friends",
    category: "Friendship",
    description: "Lavender dotted paper, butterflies and a playful hand.",
    paper: { color: "#EDE7F8", style: "dotted", texture: "grainy", size: "A5", edgeStyle: "rounded" },
    typography: { fontFamily: "caveat", fontSize: 23, inkColor: "#4B2A86", lineHeight: 1.55, letterSpacing: 0.25, alignment: "left" },
    decorations: [
      deco("butterfly", 0.9, 0.3, 0.12, 0.83, 14),
      deco("butterfly-blue", 0.12, 0.93, 0.1, 0.83, -18),
      deco("washi-lavender", 0.12, 0.02, 0.22, 0.2, -26),
    ],
    sample: {
      recipient: "Zoe",
      greeting: "Hey",
      message:
        "Ten years of inside jokes, late-night calls and saving each other the last slice. I do not know what I would do without you, and I hope I never have to find out.",
      closing: "Your partner in crime,",
      signature: "Ella",
      date: "",
    },
  },
  {
    id: "starry-night",
    name: "Starry Night",
    category: "Friendship",
    description: "Soft lavender, a crescent moon and goodnight wishes.",
    paper: { color: "#EDE7F8", style: "blank", texture: "smooth", size: "A5", edgeStyle: "straight" },
    typography: { fontFamily: "great-vibes", fontSize: 21, inkColor: "#4B2A86", lineHeight: 1.75, letterSpacing: 0, alignment: "center" },
    decorations: [deco("moon", 0.5, 0.05, 0.11, 0.9, 0), deco("cloud", 0.86, 0.92, 0.13, 0.62, 0)],
    sample: {
      recipient: "Noor",
      greeting: "Goodnight,",
      message: "However far apart we are, we are still under the same sky. Look up tonight — I will be too.",
      closing: "Sweet dreams,",
      signature: "Layla",
      date: "",
    },
  },
  {
    id: "my-hero",
    name: "My Hero",
    category: "Heroes",
    description: "Comic-book paper and a cheering little hero — for the person who saves your day.",
    paper: { color: "#FFF6DD", style: "halftone", texture: "smooth", size: "A5", edgeStyle: "rounded" },
    typography: { fontFamily: "kalam", fontSize: 21, inkColor: "#1F1D1A", lineHeight: 1.65, letterSpacing: 0, alignment: "left" },
    decorations: [
      deco("comic-burst", 0.12, 0.06, 0.1, 1, -8),
      deco("hero", 0.84, 0.86, 0.15, 1.3, 4),
      deco("bolt", 0.94, 0.6, 0.055, 1.83, 14),
    ],
    sample: {
      recipient: "Dad",
      greeting: "To my hero,",
      message:
        "You never wore a cape, but you showed up every single time I needed you. Thank you for the early mornings, the patient lessons and the terrible jokes I secretly love.",
      closing: "Your biggest fan,",
      signature: "Kemi",
      date: "Father's Day",
    },
  },
  {
    id: "super-birthday",
    name: "Super Birthday",
    category: "Heroes",
    description: "A bright sunburst, a POW! and a rocket for a birthday with superpowers.",
    paper: { color: "#E8F4FF", style: "sunburst", texture: "smooth", size: "A5", edgeStyle: "rounded" },
    typography: { fontFamily: "caveat", fontSize: 23, inkColor: "#1E3A8A", lineHeight: 1.55, letterSpacing: 0.25, alignment: "left" },
    decorations: [
      deco("pow", 0.16, 0.06, 0.17, 0.786, -10),
      deco("rocket", 0.91, 0.82, 0.08, 1.857, 14),
      deco("cake", 0.72, 0.9, 0.12, 1, 0),
    ],
    sample: {
      recipient: "Leo",
      greeting: "Happy birthday,",
      message:
        "Seven years old today — that is practically a superpower. May your year be full of big adventures, brave ideas and as much cake as one hero can handle.",
      closing: "Have a super day,",
      signature: "Auntie Bee",
      date: "Your big day",
    },
  },
  {
    id: "sidekick-for-life",
    name: "Sidekick for Life",
    category: "Heroes",
    description: "A mask, a badge and a ZAP! for the friend who always has your back.",
    paper: { color: "#FFE9DF", style: "halftone", texture: "grainy", size: "A5", edgeStyle: "straight" },
    typography: { fontFamily: "patrick-hand", fontSize: 21, inkColor: "#4B2A86", lineHeight: 1.6, letterSpacing: 0, alignment: "left" },
    decorations: [
      deco("hero-mask", 0.2, 0.05, 0.18, 0.43, -8),
      deco("zap", 0.84, 0.9, 0.17, 0.786, 8),
      deco("hero-badge", 0.12, 0.91, 0.09, 1.156, -6),
    ],
    sample: {
      recipient: "Jo",
      greeting: "Dear",
      message:
        "Every hero needs a sidekick, and I got the best one. Thanks for the rescue missions, the late-night pep talks and for laughing at all my plans before helping with them anyway.",
      closing: "Your partner in crime-fighting,",
      signature: "Max",
      date: "",
    },
  },
];

export function getTemplate(id: string | null | undefined): LetterTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

/** Apply a template's design to a letter. The writer's words are always kept. */
export function applyTemplate(doc: LetterDocument, template: LetterTemplate): LetterDocument {
  return {
    ...doc,
    templateId: template.id,
    paper: { ...template.paper },
    typography: { ...template.typography },
    decorations: template.decorations.map((d) => ({ ...d, id: newId() })),
    updatedAt: new Date().toISOString(),
  };
}

/** Full example letter for gallery thumbnails and the homepage. */
const previewCache = new Map<string, LetterDocument>();
export function templatePreviewDoc(template: LetterTemplate): LetterDocument {
  const cached = previewCache.get(template.id);
  if (cached) return cached;
  const doc: LetterDocument = {
    ...createBlankLetter(),
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    id: `template-${template.id}`,
    ...template.sample,
    templateId: template.id,
    paper: template.paper,
    typography: template.typography,
    decorations: template.decorations.map((d, i) => ({ ...d, id: `${template.id}-${i}` })),
  };
  previewCache.set(template.id, doc);
  return doc;
}
