"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function LiveSearchInput({ name = "search", defaultValue = "", placeholder, className, "aria-label": ariaLabel }: {
  name?: string; defaultValue?: string; placeholder: string; className?: string; "aria-label"?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (value.trim()) next.set(name, value.trim()); else next.delete(name);
      next.delete("page");
      if ((params.get(name) || "") !== value.trim()) {
        const query = next.toString();
        router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [name, pathname, params, router, value]);
  return <input name={name} value={value} onChange={event => setValue(event.target.value)} placeholder={placeholder} aria-label={ariaLabel} className={className} />;
}
