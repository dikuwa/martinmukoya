"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export function ClearFiltersButton({ href }: { href: string }) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="md:self-end text-[color:var(--text-faint)] hover:text-[color:var(--text-muted)]"
      onClick={() => {
        router.push(href);
        router.refresh();
      }}
    >
      <X size={14} />
      Clear
    </Button>
  );
}
