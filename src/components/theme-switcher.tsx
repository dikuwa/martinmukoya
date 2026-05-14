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
      {isLight ? <Moon aria-hidden="true" size={18} /> : <Sun aria-hidden="true" size={18} />}
    </Button>
  );
}
