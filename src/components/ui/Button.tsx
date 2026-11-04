import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ComponentProps } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "soft" | "danger" | "ink" | "blush";
type Size = "sm" | "md" | "lg";

const base =
  "hand inline-flex items-center justify-center gap-2 rounded-full transition-[background,color,box-shadow,transform] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary: "bg-ink text-white shadow-[0_8px_18px_-10px_rgba(0,0,0,0.7)] hover:bg-black",
  secondary: "bg-surface text-ink border border-line shadow-[0_4px_12px_-8px_rgba(0,0,0,0.25)] hover:bg-white",
  ghost: "text-ink hover:bg-black/[0.04]",
  soft: "bg-accent-soft text-accent-deep hover:bg-[#d8d6d0]",
  danger: "bg-surface text-danger border border-[#f3d2cd] hover:bg-[#fff5f3]",
  ink: "bg-[#111] text-white hover:bg-black shadow-[0_8px_20px_-10px_rgba(0,0,0,0.6)]",
  blush:
    "text-ink bg-[linear-gradient(100deg,#FBDCE8,#F6BFD6_55%,#F9D2E0)] shadow-[0_10px_28px_-10px_rgba(232,120,160,0.65)] hover:brightness-[1.03]",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[16px]",
  md: "h-11 px-5 text-[18px]",
  lg: "h-13 px-7 text-[20px]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, className = "", children, disabled, type = "button", ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={buttonClass(variant, size, className)} disabled={disabled || loading} {...rest}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...rest} />;
}

export function IconButton({
  label,
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex size-11 items-center justify-center rounded-full text-ink transition hover:bg-black/[0.05] active:scale-95 disabled:opacity-40 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
