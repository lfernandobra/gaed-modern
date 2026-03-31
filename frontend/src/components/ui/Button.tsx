import { cn } from "../../lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90":
            variant === "primary",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80":
            variant === "secondary",
          "bg-destructive text-destructive-foreground hover:bg-destructive/90":
            variant === "destructive",
          "hover:bg-muted text-foreground": variant === "ghost",
        },
        {
          "text-xs px-3 py-1.5": size === "sm",
          "text-sm px-4 py-2": size === "md",
          "text-base px-5 py-2.5": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
