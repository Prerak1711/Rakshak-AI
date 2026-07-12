import type { ReactNode } from "react";

const variants = {
  safe: "bg-emerald-400 shadow-emerald-400/50",
  warning: "bg-amber-400 shadow-amber-400/50",
  danger: "bg-red-500 shadow-red-500/50",
  neutral: "bg-slate-400 shadow-slate-400/40",
} as const;

type StatusIndicatorProps = {
  label: string;
  value: ReactNode;
  tone?: keyof typeof variants;
};

export function StatusIndicator({
  label,
  value,
  tone = "neutral",
}: StatusIndicatorProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
          {label}
        </p>
        <p className="mt-1 font-semibold text-slate-100">{value}</p>
      </div>
      <span
        className={`h-3 w-3 rounded-full shadow-lg ${variants[tone]}`}
        aria-hidden="true"
      />
    </div>
  );
}
