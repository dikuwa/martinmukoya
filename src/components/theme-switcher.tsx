"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  return (
    <Button
      aria-label="Toggle theme"
      size="icon"
      variant="ghost"
      onClick={() => setTheme(isLight ? "dark" : "light")}
    >
      <Sun aria-hidden="true" className="theme-icon-sun" size={18} />
      <Moon aria-hidden="true" className="theme-icon-moon" size={18} />
    </Button>
  );
}
