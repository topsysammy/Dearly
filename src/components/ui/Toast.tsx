"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

type Tone = "success" | "error" | "info";
type Toast = { id: number; message: string; tone: Tone; action?: { label: string; onClick: () => void } };
type Ctx = { toast: (message: string, opts?: { tone?: Tone; action?: Toast["action"]; duration?: number }) => void };

const ToastContext = createContext<Ctx>({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);
  const toast = useCallback<Ctx["toast"]>((message, opts = {}) => {
    const id = ++seq.current;
    setToasts((t) => [...t.slice(-2), { id, message, tone: opts.tone ?? "info", action: opts.action }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), opts.duration ?? 4200);
  }, []);
  const Icon = { success: CheckCircle2, error: AlertCircle, info: Info };
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4 sm:top-auto sm:bottom-6"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const I = Icon[t.tone];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                role={t.tone === "error" ? "alert" : "status"}
                className="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-white shadow-lift"
              >
                <I className={`size-4 shrink-0 ${t.tone === "error" ? "text-[#ffb4a8]" : t.tone === "success" ? "text-[#b7e4c7]" : "text-white/70"}`} />
                <span className="leading-snug">{t.message}</span>
                {t.action && (
                  <button
                    className="ml-1 shrink-0 rounded-full px-2 py-1 font-medium text-[#cbb9ff] hover:bg-white/10"
                    onClick={() => {
                      t.action!.onClick();
                      setToasts((all) => all.filter((x) => x.id !== t.id));
                    }}
                  >
                    {t.action.label}
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
