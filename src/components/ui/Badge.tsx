import type { HTMLAttributes, ReactNode } from "react";

const variants = {
  red: "border-red-500/40 bg-red-500/10 text-red-200",
  green: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  slate: "border-slate-600 bg-slate-800/80 text-slate-300",
} as const;

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: keyof typeof variants;
};

export function Badge({
  children,
  className = "",
  variant = "slate",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
