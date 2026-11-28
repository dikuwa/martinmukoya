"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLight = mounted && theme !== "dark";

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <Button
      aria-label="Toggle theme"
      aria-pressed={mounted && !isLight}
      type="button"
      size="icon"
      variant="secondary"
      className={cn(
        "theme-switcher h-10 w-10 rounded-full border p-0 transition duration-200"
      )}
      onClick={() => setTheme(isLight ? "dark" : "light")}
    >
      <Sun aria-hidden="true" className="theme-icon-sun" size={18} />
      <Moon aria-hidden="true" className="theme-icon-moon" size={18} />
    </Button>
  );
}
