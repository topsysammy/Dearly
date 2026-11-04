import type { Metadata } from "next";
import { RecipientView } from "./RecipientView";

// Never reveal anything about the letter in link previews or search results.
export const metadata: Metadata = {
  title: "You've received a letter",
  description: "Someone has written something for you. Open the envelope to read it.",
  robots: { index: false, follow: false, nocache: true },
  openGraph: { title: "You've received a letter", description: "Someone has written something for you." },
};

export default async function LetterPage({ params }: PageProps<"/letter/[token]">) {
  const { token } = await params;
  return <RecipientView token={token} />;
}
