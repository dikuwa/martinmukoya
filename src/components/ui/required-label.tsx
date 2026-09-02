"use client";

import { ReactNode } from "react";

export function RequiredLabel({ children }: { children: ReactNode }) {
  return (
    <span className="whitespace-nowrap">
      {children} <span className="text-[color:var(--destructive)]">*</span>
    </span>
  );
}