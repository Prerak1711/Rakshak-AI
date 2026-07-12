import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function InteractiveCard({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-red-500/60 hover:bg-slate-900 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
