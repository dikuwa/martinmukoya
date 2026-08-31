import { cn } from "@/lib/utils";
import type { ElementType, ReactNode } from "react";

type Padding = "none" | "sm" | "md" | "lg";

const paddingMap: Record<Padding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

type CardProps<T extends ElementType = "div"> = {
  children: ReactNode;
  padding?: Padding;
  className?: string;
  as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, "className" | "children" | "as">;

export function Card<T extends ElementType = "div">({
  children,
  padding = "md",
  className,
  as,
  ...props
}: CardProps<T>) {
  const Tag = as || ("div" as ElementType);
  return (
    <Tag
      className={cn(
        "rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]",
        paddingMap[padding],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
