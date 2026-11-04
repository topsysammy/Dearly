"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { loginSchema, signupSchema } from "@/lib/auth-schema";
import { api, ApiError } from "@/lib/storage/local";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/Logo";
import { DecorationArt } from "@/components/decorations/DecorationArt";

function Field({
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  error,
  trailing,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  error?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="hand mb-1.5 block text-[17px] text-muted">{label}</span>
      <span className="relative block">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          className={`h-13 w-full rounded-full border bg-surface px-5 text-[16px] text-ink shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] placeholder:text-faint focus:ring-2 focus:ring-ink/10 focus:outline-none ${
            error ? "border-danger/60" : "border-line focus:border-ink/40"
          } ${trailing ? "pr-12" : ""}`}
        />
        {trailing && <span className="absolute inset-y-0 right-2 flex items-center">{trailing}</span>}
      </span>
      {error && <span className="mt-1.5 block pl-4 text-[13px] text-danger">{error}</span>}
    </label>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const signup = mode === "signup";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = signup ? signupSchema.safeParse({ name, email, password }) : loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] ??= issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      await api(`/api/auth/${mode}`, { method: "POST", json: parsed.data });
      router.replace("/home");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-12">
      <div className="relative mx-auto mb-8 h-24 w-36">
        <div className="absolute inset-0 rotate-[-6deg] rounded-[10px] border border-[#cfccc5] bg-[#FBFAF7] shadow-[0_16px_30px_-20px_rgba(0,0,0,0.5)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <LogoMark className="size-14" />
        </div>
        <div className="absolute -top-4 -right-6 w-14 rotate-12">
          <DecorationArt type={signup ? "sparkles" : "heart-outline"} />
        </div>
      </div>

      <h1 className="text-center font-serif text-[42px] leading-tight">{signup ? "Start writing" : "Welcome back"}</h1>
      <p className="mt-2 text-center text-[15px] text-muted">
        {signup ? "Create an account to keep your letters on every device." : "Sign in to your letters."}
      </p>

      <form onSubmit={submit} noValidate className="mt-9 space-y-4">
        {signup && <Field label="Your name" value={name} onChange={setName} autoComplete="name" error={errors.name} />}
        <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" error={errors.email} />
        <Field
          label="Password"
          type={show ? "text" : "password"}
          value={password}
          onChange={setPassword}
          autoComplete={signup ? "new-password" : "current-password"}
          error={errors.password}
          trailing={
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="inline-flex size-9 items-center justify-center rounded-full text-muted hover:bg-black/5"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />
        {signup && !errors.password && <p className="pl-4 text-[12px] text-faint">At least 8 characters.</p>}

        {formError && (
          <p role="alert" className="rounded-2xl border border-danger/20 bg-[#fbefed] px-4 py-3 text-[14px] text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-2 w-full" loading={busy}>
          {signup ? "Create account" : "Sign in"}
        </Button>
      </form>

      <p className="hand mt-8 text-center text-[17px] text-muted">
        {signup ? "Already have an account? " : "New to Dearly? "}
        <Link href={signup ? "/login" : "/signup"} className="text-ink underline decoration-1 underline-offset-4">
          {signup ? "Sign in" : "Create one"}
        </Link>
      </p>
      <p className="mt-3 text-center">
        <Link href="/welcome" className="hand text-[15px] text-faint hover:text-muted">
          See the tour again
        </Link>
      </p>
    </div>
  );
}
