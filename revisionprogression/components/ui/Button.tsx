import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "bg-accent text-white hover:bg-accent-hover shadow-sm shadow-accent/25 hover:shadow-md hover:shadow-accent/30",
  secondary:
    "bg-surface-2 text-foreground hover:bg-border shadow-sm",
  danger:
    "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-500/25 hover:shadow-md hover:shadow-red-500/30",
  ghost:
    "bg-transparent text-muted hover:bg-surface-2 hover:text-foreground",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-1 focus:ring-offset-background active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
