"use client";

/* eslint-disable @next/next/no-img-element */

import { useRef, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { ImagePlus, Loader2, Link as LinkIcon, Crop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageCropperModal } from "@/components/admin/image-cropper-modal";

type CropShape = "round" | "rect";

export function ImageUploadField({
  label,
  value,
  onChange,
  folder = "uploads",
  placeholder = "Paste image URL or upload an image",
  cropAspect,
  cropShape = "round",
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  folder?: string;
  placeholder?: string;
  /** Aspect ratio for the crop modal. Defaults to 1 (square). Set to `false` to disable cropping entirely. */
  cropAspect?: number | false;
  /** Crop area shape. Defaults to "round" for profile pics. */
  cropShape?: CropShape;
}) {
  const hiddenFileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);

  const shouldCrop = cropAspect !== false;

  // Read a File as a data URL
  const readFileAsDataURL = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }, []);

  // Upload a blob/file to the server
  const uploadFile = useCallback(
    async (blob: Blob, filename: string): Promise<string> => {
      const formData = new FormData();
      formData.set("file", blob, filename);
      formData.set("folder", folder);

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as {
        url?: string;
        error?: string;
      } | null;

      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error || "Upload failed");
      }

      return payload.url;
    },
    [folder]
  );

  // Handle file selection — open crop modal if enabled, otherwise upload directly
  async function handleFilePick(file: File) {
    // Skip crop modal for SVGs (can't canvas-crop vector images)
    if (shouldCrop && file.type !== "image/svg+xml") {
      // Read as data URL and open crop modal (don't upload yet)
      try {
        const dataUrl = await readFileAsDataURL(file);
        setCropSrc(dataUrl);
        setCropOpen(true);
      } catch {
        toast.error("Could not read image file");
      } finally {
        if (hiddenFileRef.current) hiddenFileRef.current.value = "";
      }
    } else {
      // Upload directly without cropping
      setUploading(true);
      try {
        const url = await uploadFile(file, file.name);
        onChange(url);
        toast.success("Image uploaded");
      } catch (error) {
        toast.error(
          "Image not uploaded — " +
            (error instanceof Error ? error.message : "Please try again.")
        );
      } finally {
        setUploading(false);
        if (hiddenFileRef.current) hiddenFileRef.current.value = "";
      }
    }
  }

  // Handle crop confirm — crop the data URL, upload the cropped result, set value
  async function handleCropConfirm(croppedUrl: string) {
    setCropOpen(false);
    setCropSrc(null);
    onChange(croppedUrl);
  }

  // Handle clicking on the existing image preview to recrop
  async function handleRecrop() {
    if (!value) return;
    setUploading(true);
    try {
      // We need to fetch the image and convert to data URL for the cropper
      const response = await fetch(value);
      const blob = await response.blob();
      const dataUrl = await readFileAsDataURL(new File([blob], "image.jpg", { type: blob.type }));
      setCropSrc(dataUrl);
      setCropOpen(true);
    } catch {
      // If the fetch fails (cross-origin without CORS), let the user know
      toast.error("Could not load image for cropping — it may be from an external domain.");
    } finally {
      setUploading(false);
    }
  }

  function handleCropCancel() {
    setCropOpen(false);
    setCropSrc(null);
  }

  return (
    <div className="grid min-w-0 content-start gap-2 text-sm font-bold text-[color:var(--text-strong)]">
      <span>{label}</span>

      {value ? (
        <div className="group relative h-28 overflow-hidden rounded-[calc(var(--radius)*0.75)] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] sm:h-32">
          <img
            src={value}
            alt=""
            className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
            onClick={shouldCrop ? handleRecrop : undefined}
            style={shouldCrop ? { cursor: "pointer" } : undefined}
          />

          {/* Overlay toolbar */}
          <div className="absolute inset-0 flex items-start justify-end gap-1.5 p-2 opacity-0 transition group-hover:opacity-100">
            {shouldCrop && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleRecrop();
                }}
                className="grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
                aria-label="Crop image"
              >
                <Crop size={13} />
              </button>
            )}
            <button
              type="button"
              onClick={() => onChange("")}
              className="grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
              aria-label="Remove image"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div
          className="flex h-28 cursor-pointer items-center justify-center rounded-[calc(var(--radius)*0.75)] border-2 border-dashed border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] transition hover:border-[color:var(--primary)]/40 sm:h-32"
          onClick={() => hiddenFileRef.current?.click()}
        >
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

        {/* Hidden file input */}
        <input
          ref={hiddenFileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFilePick(file);
          }}
        />

        <Button
          type="button"
          variant="secondary"
          onClick={() => hiddenFileRef.current?.click()}
          disabled={uploading}
          className="shrink-0"
        >
          {uploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ImagePlus size={16} />
          )}
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </div>

      {/* Crop modal */}
      {cropSrc && (
        <ImageCropperModal
          imageSrc={cropSrc}
          open={cropOpen}
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
          aspect={typeof cropAspect === "number" ? cropAspect : 1}
          cropShape={cropShape}
          folder={folder}
        />
      )}
    </div>
  );
}
