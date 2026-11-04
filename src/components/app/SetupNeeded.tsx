import { LogoMark } from "@/components/ui/Logo";

/** Shown when the server has no DATABASE_URL — accounts can't work without one. */
export function SetupNeeded() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <LogoMark className="size-12" />
      <h1 className="font-serif text-[40px] leading-tight">Dearly isn&rsquo;t connected yet</h1>
      <p className="max-w-sm text-muted">
        Accounts, drafts and share links are stored in PostgreSQL. Set <code className="rounded bg-black/5 px-1">DATABASE_URL</code> on
        the server and restart to open the doors.
      </p>
    </main>
  );
}
