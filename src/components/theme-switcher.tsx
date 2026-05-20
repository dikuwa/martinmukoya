"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  return (
    <Button
      aria-label="Toggle theme"
      size="icon"
      variant="secondary"
      className={cn(
        "h-10 w-10 rounded-full p-0 border transition duration-200",
        isLight
          ? "bg-[#f7f3ff] text-[#6b26d9] border-[#e6d8ff] hover:bg-[#ece1ff] shadow-[0_10px_30px_rgba(107,38,217,0.12)]"
          : "bg-[#1a1033] text-white border-[#3f2a64] hover:bg-[#271a48] shadow-[0_12px_32px_rgba(107,38,217,0.18)]"
      )}
      onClick={() => setTheme(isLight ? "dark" : "light")}
    >
      <Sun aria-hidden="true" className="theme-icon-sun" size={18} />
      <Moon aria-hidden="true" className="theme-icon-moon" size={18} />
    </Button>
  );
}
