import { PreviewView } from "./PreviewView";

export const metadata = { title: "Preview" };

export default async function PreviewPage({ params }: PageProps<"/preview/[id]">) {
  const { id } = await params;
  return <PreviewView id={id} />;
}
