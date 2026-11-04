"use client";

import { Check, Pipette } from "lucide-react";
import type { ReactNode } from "react";

export function ControlLabel({ children, value }: { children: ReactNode; value?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between text-[13px] font-medium text-muted">
      <span>{children}</span>
      {value !== undefined && <span className="tabular-nums text-ink">{value}</span>}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-[11px] font-semibold tracking-[0.14em] text-faint uppercase">{title}</h3>
      {children}
    </section>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <ControlLabel value={format ? format(value) : value}>{label}</ControlLabel>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--fill" as string]: `${fill}%` }}
        aria-label={label}
      />
    </label>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; name: ReactNode; title?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-full border border-line bg-surface p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          title={o.title}
          onClick={() => onChange(o.id)}
          className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full px-2 text-[13px] font-medium transition ${
            value === o.id ? "bg-ink text-white shadow-sm" : "text-muted hover:text-ink"
          }`}
        >
          {o.name}
        </button>
      ))}
    </div>
  );
}

export function Swatches({
  label,
  value,
  options,
  onChange,
  round = true,
}: {
  label: string;
  value: string;
  options: { name: string; value: string }[];
  onChange: (v: string) => void;
  round?: boolean;
}) {
  const isCustom = !options.some((o) => o.value.toLowerCase() === value.toLowerCase());
  const shape = round ? "rounded-full" : "rounded-xl";
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2.5">
      {options.map((o) => {
        const active = o.value.toLowerCase() === value.toLowerCase();
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={o.name}
            title={o.name}
            onClick={() => onChange(o.value)}
            className={`relative size-10 ${shape} border transition ${active ? "border-ink ring-2 ring-ink/15 ring-offset-2 ring-offset-canvas" : "border-black/10 hover:scale-105"}`}
            style={{ background: o.value }}
          >
            {active && (
              <Check className={`absolute inset-0 m-auto size-4 ${isLight(o.value) ? "text-ink" : "text-white"}`} strokeWidth={2.5} />
            )}
          </button>
        );
      })}
      <label
        title="Custom colour"
        className={`relative flex size-10 cursor-pointer items-center justify-center ${shape} border transition ${isCustom ? "border-ink ring-2 ring-ink/15 ring-offset-2 ring-offset-canvas" : "border-dashed border-[#cfc7ba] hover:scale-105"}`}
        style={isCustom ? { background: value } : undefined}
      >
        <Pipette className={`size-4 ${isCustom && !isLight(value) ? "text-white" : "text-muted"}`} />
        <span className="sr-only">Custom colour</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}

export function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength = 80,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[16px] text-ink placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/15 focus:outline-none"
      />
    </label>
  );
}
