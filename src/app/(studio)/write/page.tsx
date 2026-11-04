import { NewLetter } from "./NewLetter";

export const metadata = { title: "Write a letter" };

export default async function WritePage({ searchParams }: PageProps<"/write">) {
  const { template } = await searchParams;
  return <NewLetter templateId={typeof template === "string" ? template : undefined} />;
}
