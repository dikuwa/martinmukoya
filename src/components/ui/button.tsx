import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] text-sm font-bold outline-none transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[color:var(--primary)] text-white shadow-[0_6px_14px_rgba(107,38,217,0.16)] hover:-translate-y-0.5 hover:bg-[color:var(--primary-light)] active:translate-y-0",
        secondary:
          "border border-[color:var(--border-subtle)] bg-[color:var(--surface)] text-[color:var(--text-normal)] hover:-translate-y-0.5 hover:bg-[color:var(--surface-soft)] hover:border-[color:var(--primary)]/40 active:translate-y-0",
        ghost:
          "text-[color:var(--primary)] hover:bg-[rgba(107,38,217,0.08)] hover:text-[color:var(--primary)]",
        danger:
          "border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] text-[#ef4444] hover:-translate-y-0.5 hover:bg-[rgba(239,68,68,0.15)] hover:border-[rgba(239,68,68,0.4)] active:translate-y-0",
        "outline":
          "border-2 border-[color:var(--primary)] bg-transparent text-[color:var(--primary)] hover:-translate-y-0.5 hover:bg-[rgba(107,38,217,0.06)] active:translate-y-0"
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { buttonVariants };
