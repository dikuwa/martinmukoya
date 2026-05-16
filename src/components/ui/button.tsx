import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-sm font-bold outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[color:var(--primary)] !text-[color:var(--primary-foreground)] shadow-[0_6px_14px_rgba(85,49,113,0.16)] hover:-translate-y-0.5 hover:bg-[color:var(--primary-light)]",
        secondary:
          "border border-[color:var(--border-subtle)] bg-[color:var(--surface)] text-[color:var(--text-normal)] hover:-translate-y-0.5 hover:bg-[color:var(--surface-soft)]",
        ghost:
          "text-[color:var(--primary)] hover:bg-[color:var(--primary)]/10 hover:text-[color:var(--primary-foreground)]",
        danger: "bg-[color:var(--destructive)] text-[color:var(--destructive-foreground)] hover:bg-[color:var(--destructive)]/90"
      },
      size: {
        sm: "h-9 px-3",
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
