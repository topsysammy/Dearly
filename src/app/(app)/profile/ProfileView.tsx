"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronRight, LogOut, Trash2 } from "lucide-react";
import { useUser } from "@/components/app/UserProvider";
import { useLocalLibrary } from "@/hooks/useLocalLibrary";
import { effectiveStatus } from "@/lib/share-client";
import { api, ApiError } from "@/lib/storage/local";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";

export function ProfileView() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, setUser } = useUser();
  const { letters, shares } = useLocalLibrary();
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const active = shares.filter((s) => effectiveStatus(s) === "active").length;
  const opened = shares.filter((s) => s.firstOpenedAt).length;

  const saveName = async () => {
    if (name.trim() === user.name) return;
    setSaving(true);
    try {
      const r = await api<{ user: typeof user }>("/api/auth/me", { method: "PATCH", json: { name } });
      setUser(r.user);
      toast("Name updated", { tone: "success" });
    } catch (e) {
      toast((e as Error).message, { tone: "error" });
      setName(user.name);
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    await api("/api/auth/logout", { method: "POST", json: {} }).catch(() => {});
    router.replace("/login");
    router.refresh();
  };

  const deleteAccount = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await api("/api/auth/delete", { method: "POST", json: { password } });
      router.replace("/welcome");
      router.refresh();
    } catch (e) {
      setDeleteError(e instanceof ApiError ? e.message : "Couldn't delete the account.");
      setDeleting(false);
    }
  };

  const row = "flex w-full items-center gap-3 px-5 py-4 text-left text-[15px] transition hover:bg-black/[0.02]";

  return (
    <div className="mx-auto max-w-md px-5 pt-[max(24px,env(safe-area-inset-top))]">
      <h1 className="text-center font-serif text-[34px]">Profile</h1>

      <div className="mt-8 flex flex-col items-center">
        <div className="hand flex size-24 items-center justify-center rounded-full border-2 border-ink bg-surface text-[44px] shadow-[0_12px_26px_-16px_rgba(0,0,0,0.5)]">
          {user.name.trim()[0]?.toUpperCase() ?? "D"}
        </div>
        <p className="mt-3 text-[14px] text-muted">{user.email}</p>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3 text-center">
        {[
          ["Letters", letters?.length ?? "–"],
          ["Live links", active],
          ["Opened", opened],
        ].map(([label, n]) => (
          <div key={label} className="rounded-3xl border border-white/80 bg-surface/80 py-4 shadow-card">
            <p className="text-[28px] leading-none font-light tabular-nums">{n}</p>
            <p className="mt-1 text-[12px] text-muted">{label}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-3xl border border-white/80 bg-surface/80 p-5 shadow-card">
        <label className="block">
          <span className="hand mb-1.5 block text-[17px] text-muted">Your name</span>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              className="h-12 min-w-0 flex-1 rounded-full border border-line bg-canvas/40 px-5 text-[16px] focus:border-ink/40 focus:outline-none"
            />
            <Button onClick={saveName} loading={saving} disabled={!name.trim() || name.trim() === user.name}>
              Save
            </Button>
          </div>
        </label>
      </section>

      <section className="mt-4 overflow-hidden rounded-3xl border border-white/80 bg-surface/80 shadow-card">
        <Link href="/templates" className={row}>
          <BookOpen className="size-4 text-muted" /> <span className="flex-1">Browse templates</span>
          <ChevronRight className="size-4 text-faint" />
        </Link>
        <Link href="/welcome" className={`${row} border-t border-line`}>
          <span className="w-4 text-center text-muted">✦</span> <span className="flex-1">Replay the tour</span>
          <ChevronRight className="size-4 text-faint" />
        </Link>
        <button onClick={signOut} className={`${row} border-t border-line`}>
          <LogOut className="size-4 text-muted" /> <span className="flex-1">Sign out</span>
        </button>
      </section>

      <button onClick={() => setConfirmDelete(true)} className="mx-auto mt-8 flex items-center gap-2 text-[13px] text-muted hover:text-danger">
        <Trash2 className="size-3.5" /> Delete account
      </button>

      <Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete your account?">
        <p className="text-[15px] leading-relaxed text-muted">
          This permanently deletes your drafts and revokes every link you&rsquo;ve shared — recipients will see that the letter is no
          longer available. This can&rsquo;t be undone.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          autoComplete="current-password"
          className="mt-5 h-12 w-full rounded-full border border-line bg-surface px-5 text-[16px] focus:border-ink/40 focus:outline-none"
        />
        {deleteError && <p className="mt-2 pl-4 text-[13px] text-danger">{deleteError}</p>}
        <div className="mt-5 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(false)}>
            Keep it
          </Button>
          <Button variant="danger" className="flex-1" onClick={deleteAccount} loading={deleting} disabled={!password}>
            Delete forever
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
