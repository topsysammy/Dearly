import { ButtonLink } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <LogoMark className="size-10" />
      <h1 className="font-serif text-[42px] leading-tight">This page got lost in the post.</h1>
      <p className="max-w-sm text-muted">The address may be mistyped, or the page has moved.</p>
      <ButtonLink href="/" className="mt-4">Back to Dearly</ButtonLink>
    </main>
  );
}
