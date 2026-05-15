import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-sm font-bold outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[color:var(--accent)] !text-white shadow-[0_6px_14px_rgba(198,97,63,0.14)] hover:-translate-y-0.5 hover:bg-[#D98263]",
        secondary:
          "border border-[color:var(--border-subtle)] bg-white/[0.04] text-[color:var(--text-strong)] hover:-translate-y-0.5 hover:border-[#74459A] hover:bg-white/[0.07]",
        ghost:
          "text-[color:var(--text-muted)] hover:bg-white/[0.06] hover:text-[color:var(--text-strong)]",
        danger: "bg-[#EF4444] text-white hover:bg-[#DC2626]"
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
