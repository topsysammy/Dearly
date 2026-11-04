import {
  Caveat,
  Dancing_Script,
  DM_Sans,
  Great_Vibes,
  Homemade_Apple,
  Instrument_Serif,
  Kalam,
  La_Belle_Aurore,
  Nothing_You_Could_Do,
  Parisienne,
  Patrick_Hand,
  Shadows_Into_Light,
  Shadows_Into_Light_Two,
} from "next/font/google";
import type { FontId } from "./letter/types";

/* Interface typefaces */
export const uiSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
export const uiSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

/** Hand-lettered face for headings, buttons and labels (the sketchbook UI). */
export const uiHand = Shadows_Into_Light_Two({ subsets: ["latin"], weight: "400", variable: "--font-hand-face", display: "swap" });

/* Handwriting faces — self-hosted by next/font so exports can embed them same-origin. */
const dancing = Dancing_Script({ subsets: ["latin"], display: "swap", preload: true });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", display: "swap", preload: false });
const parisienne = Parisienne({ subsets: ["latin"], weight: "400", display: "swap", preload: false });
const caveat = Caveat({ subsets: ["latin"], display: "swap", preload: true });
const nothing = Nothing_You_Could_Do({ subsets: ["latin"], weight: "400", display: "swap", preload: false });
const patrick = Patrick_Hand({ subsets: ["latin"], weight: "400", display: "swap", preload: false });
const kalam = Kalam({ subsets: ["latin"], weight: ["400"], display: "swap", preload: false });
const homemade = Homemade_Apple({ subsets: ["latin"], weight: "400", display: "swap", preload: false });
const belle = La_Belle_Aurore({ subsets: ["latin"], weight: "400", display: "swap", preload: false });
const shadows = Shadows_Into_Light({ subsets: ["latin"], weight: "400", display: "swap", preload: false });

export const HANDWRITING_FONTS: Record<FontId, string> = {
  "dancing-script": dancing.style.fontFamily,
  "great-vibes": greatVibes.style.fontFamily,
  parisienne: parisienne.style.fontFamily,
  caveat: caveat.style.fontFamily,
  "nothing-you-could-do": nothing.style.fontFamily,
  "patrick-hand": patrick.style.fontFamily,
  kalam: kalam.style.fontFamily,
  "homemade-apple": homemade.style.fontFamily,
  "la-belle-aurore": belle.style.fontFamily,
  "shadows-into-light": shadows.style.fontFamily,
};

export function handwritingFamily(id: FontId): string {
  return HANDWRITING_FONTS[id] ?? HANDWRITING_FONTS["dancing-script"];
}
