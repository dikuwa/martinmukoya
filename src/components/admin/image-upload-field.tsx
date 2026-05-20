"use client";

/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ImageUploadField({
  label,
  value,
  onChange,
  folder = "uploads",
  placeholder = "Paste image URL or upload an image"
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  folder?: string;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", folder);

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData
      });
      const payload = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;

      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error || "Upload failed");
      }

      onChange(payload.url);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error("Image not uploaded", {
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="grid gap-2 text-sm font-bold text-[color:var(--text-strong)]">
      <span>{label}</span>
      {value ? (
        <div className="group relative aspect-[16/9] overflow-hidden rounded-[calc(var(--radius)*0.75)] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)]">
          <img src={value} alt="" className="h-full w-full object-cover transition duration-200 group-hover:scale-105" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/50 text-white opacity-0 transition hover:bg-black/70 group-hover:opacity-100"
            aria-label="Remove image"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center rounded-[calc(var(--radius)*0.75)] border-2 border-dashed border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)]">
          <ImagePlus size={24} className="text-[color:var(--text-faint)]" />
        </div>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <LinkIcon size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--text-faint)]" />
          <input
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value)}
            className="h-11 w-full rounded-[calc(var(--radius)*0.75)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] pl-9 pr-4 text-sm text-[color:var(--text-strong)] outline-none transition placeholder:text-[color:var(--text-faint)] hover:bg-[color:var(--surface-soft)] hover:border-[color:var(--primary)]/30 focus:border-[color:var(--primary)] focus:bg-[color:var(--surface-soft)]"
            placeholder={placeholder}
          />
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={uploading} className="shrink-0">
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </div>
  );
}
