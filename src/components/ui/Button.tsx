import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

const variants = {
  primary:
    "bg-red-600 text-white shadow-lg shadow-red-950/30 hover:bg-red-500 hover:shadow-red-900/40",
  secondary:
    "border border-slate-700 bg-slate-900/70 text-slate-100 hover:border-red-500/70 hover:bg-slate-800",
  ghost:
    "text-slate-300 hover:bg-white/10 hover:text-white",
  danger:
    "bg-red-700 text-white shadow-lg shadow-red-950/40 hover:bg-red-600",
} as const;

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
} as const;

type ButtonVariant = keyof typeof variants;
type ButtonSize = keyof typeof sizes;

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400";

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type AppLinkButtonProps = LinkProps & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = ""
) {
  return `${baseClass} ${variants[variant]} ${sizes[size]} ${className}`.trim();
}

export function AppButton({
  children,
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: AppButtonProps) {
  return (
    <button className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

export function AppLinkButton({
  children,
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: AppLinkButtonProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
