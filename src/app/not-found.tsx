import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[color:var(--accent)]">404</p>
        <h1 className="mt-3 font-display text-5xl font-black text-[color:var(--text-strong)]">Page not found</h1>
        <p className="mx-auto mt-4 max-w-md text-[color:var(--text-muted)]">
          This page is not part of the portfolio yet, or the link has moved.
        </p>
        <Button asChild className="mt-7">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
