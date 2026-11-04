"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, MailX, PenLine, RefreshCw, SearchX, WifiOff } from "lucide-react";
import { EnvelopeExperience } from "@/components/envelope/EnvelopeExperience";
import { LogoMark } from "@/components/ui/Logo";
import { Doodles } from "@/components/sketch/Doodles";
import { ButtonLink, Button } from "@/components/ui/Button";
import { letterDocumentSchema } from "@/lib/letter/schema";
import type { LetterDocument } from "@/lib/letter/types";

type State =
  | { kind: "loading" }
  | { kind: "ready"; letter: LetterDocument }
  | { kind: "revoked" | "expired" | "invalid" | "unconfigured" }
  | { kind: "network" | "server"; message?: string };

export function RecipientView({ token }: { token: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);
  const reported = useRef(false);

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ kind: "loading" });
    (async () => {
      try {
        const res = await fetch(`/api/letter/${encodeURIComponent(token)}`, { signal: ctrl.signal, cache: "no-store" });
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
          const parsed = letterDocumentSchema.safeParse(body.letter);
          setState(parsed.success ? { kind: "ready", letter: parsed.data as LetterDocument } : { kind: "server" });
        } else if (res.status === 410) setState({ kind: body.status === "expired" ? "expired" : "revoked" });
        else if (res.status === 404) setState({ kind: "invalid" });
        else if (res.status === 503) setState({ kind: "unconfigured" });
        else setState({ kind: "server", message: body.error });
      } catch (e) {
        if ((e as Error).name !== "AbortError") setState({ kind: "network" });
      }
    })();
    return () => ctrl.abort();
  }, [token, attempt]);

  const onOpened = useCallback(() => {
    if (reported.current) return;
    reported.current = true;
    try {
      const key = `dearly-opened-${token.slice(0, 8)}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    fetch(`/api/letter/${encodeURIComponent(token)}/opened`, { method: "POST", keepalive: true }).catch(() => {});
  }, [token]);

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <Doodles />
      <main className="relative mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center px-4 py-16 sm:px-6">
        {state.kind === "loading" && <LoadingEnvelope />}
        {state.kind === "ready" && (
          <EnvelopeExperience
            doc={state.letter}
            onOpened={onOpened}
            readingFooter={
              <ButtonLink href="/" variant="secondary">
                <PenLine className="size-4" /> Write your own letter
              </ButtonLink>
            }
          />
        )}
        {state.kind === "revoked" && (
          <Unavailable
            icon={<MailX className="size-6" />}
            title="This letter is no longer available"
            body="The person who sent it has taken it back. If you think this is a mistake, ask them to send it again."
          />
        )}
        {state.kind === "expired" && (
          <Unavailable
            icon={<Clock className="size-6" />}
            title="This letter has expired"
            body="It was only meant to be kept for a little while. Ask the sender for a new link if you'd like to read it again."
          />
        )}
        {state.kind === "invalid" && (
          <Unavailable
            icon={<SearchX className="size-6" />}
            title="We couldn't find that letter"
            body="The link may be incomplete. Check that you copied the whole address, or ask the sender to share it again."
          />
        )}
        {state.kind === "unconfigured" && (
          <Unavailable
            icon={<MailX className="size-6" />}
            title="Letters can't be delivered right now"
            body="Link sharing isn't set up on this server yet. Please try again later."
          />
        )}
        {(state.kind === "network" || state.kind === "server") && (
          <Unavailable
            icon={<WifiOff className="size-6" />}
            title={state.kind === "network" ? "You seem to be offline" : "The letter didn't arrive"}
            body={
              state.kind === "network"
                ? "We couldn't reach Dearly to fetch your letter. Check your connection and try again."
                : state.message ?? "Something went wrong while fetching your letter. Please try again."
            }
            action={
              <Button onClick={() => setAttempt((a) => a + 1)}>
                <RefreshCw className="size-4" /> Try again
              </Button>
            }
          />
        )}
      </main>
      <footer className="relative pb-8 text-center">
        <Link href="/" className="hand inline-flex items-center gap-2 text-[16px] text-muted transition hover:text-ink">
          <LogoMark className="size-5" /> Sent with Dearly
        </Link>
      </footer>
    </div>
  );
}

function LoadingEnvelope() {
  return (
    <div className="flex flex-col items-center" role="status" aria-live="polite">
      <motion.div
        className="aspect-[10/7] w-[min(80vw,420px)] rounded-[2.2%] bg-[#dcd9d2]"
        animate={{ opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <p className="mt-10 text-[15px] text-muted">Your letter is on its way…</p>
    </div>
  );
}

function Unavailable({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex max-w-md flex-col items-center text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-full border border-white/80 bg-surface text-muted shadow-card">{icon}</div>
      <h1 className="mt-6 font-serif text-[36px] leading-tight">{title}</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-muted">{body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {action}
        <ButtonLink href="/" variant={action ? "secondary" : "primary"}>
          <PenLine className="size-4" /> Write a letter
        </ButtonLink>
      </div>
    </motion.div>
  );
}
