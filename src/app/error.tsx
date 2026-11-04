"use client";

import { Button, ButtonLink } from "@/components/ui/Button";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-serif text-[40px] leading-tight">Something smudged.</h1>
      <p className="max-w-sm text-muted">An unexpected error occurred. Your drafts are safe in this browser.</p>
      <div className="mt-4 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">Home</ButtonLink>
      </div>
    </main>
  );
}
