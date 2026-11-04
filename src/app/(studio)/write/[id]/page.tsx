import { Editor } from "@/components/editor/Editor";

export const metadata = { title: "Editor" };

export default async function EditorPage({ params }: PageProps<"/write/[id]">) {
  const { id } = await params;
  return <Editor id={id} />;
}
