"use client";

/* eslint-disable @next/next/no-img-element */

import Cropper, { type Area, type Point } from "react-easy-crop";
import * as Dialog from "@radix-ui/react-dialog";
import { SlidersHorizontal, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

type CropShape = "round" | "rect";

interface ImageCropperModalProps {
  /** The image URL or data URI to crop */
  imageSrc: string;
  /** Whether the modal is open */
  open: boolean;
  /** Called when the modal should close without cropping */
  onCancel: () => void;
  /** Called with the cropped blob after successful crop + upload */
  onConfirm: (croppedUrl: string) => void;
  /** Aspect ratio width/height (default 1 for square/circle) */
  aspect?: number;
  /** Crop area shape (default "round" for profile pics) */
  cropShape?: CropShape;
  /** Upload folder to pass to the upload endpoint */
  folder?: string;
}

function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      "image/jpeg",
      0.92
    );
  });
}

async function uploadCropped(
  blob: Blob,
  folder: string
): Promise<string> {
  const formData = new FormData();
  formData.set("file", blob, "cropped.jpg");
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
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

export function ImageCropperModal({
  imageSrc,
  open,
  onCancel,
  onConfirm,
  aspect = 1,
  cropShape = "round",
  folder = "uploads",
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const zoomTrackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const onCropComplete = useCallback(
    (_: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  async function handleConfirm() {
    if (!croppedAreaPixels || saving) return;

    setSaving(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
      if (!blob) throw new Error("Could not crop image");

      const url = await uploadCropped(blob, folder);
      onConfirm(url);
      toast.success("Image cropped and saved");
    } catch (error) {
      toast.error(
        "Crop failed — " +
          (error instanceof Error ? error.message : "Please try again.")
      );
    } finally {
      setSaving(false);
    }
  }

  // Reset state on open
  function handleOpenChange(open: boolean) {
    if (!open) {
      onCancel();
    }
  }

  // Reset zoom/crop when image changes
  function handleCancel() {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    onCancel();
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
      <Dialog.Content
        className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out sm:w-full"
        onInteractOutside={(e: Event) => e.preventDefault()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--primary)]/10">
              <SlidersHorizontal size={15} className="text-[var(--primary)]" />
            </div>
            <div>
              <Dialog.Title className="text-base font-bold text-[var(--text-strong)]">
                Adjust image
              </Dialog.Title>
              <p className="text-xs text-[var(--text-muted)]">
                Drag to reposition · {cropShape === "round" ? "Square crop" : `${aspect}:1 crop`}
              </p>
            </div>
          </div>
        </div>

        {/* Cropper area */}
        <div className="relative h-[min(55vw,24rem)] w-full bg-[#0f051e]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={false}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: {
                background:
                  "repeating-conic-gradient(#1a1033 0% 25%, #15082b 0% 50%) 50% / 20px 20px",
              },
            }}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3 border-t border-[var(--border-subtle)] px-5 py-3.5">
          <button
            type="button"
            onClick={() => setZoom((prev) => Math.max(MIN_ZOOM, +(prev - 0.2).toFixed(1)))}
            className="grid h-7 w-7 place-items-center rounded-md text-[var(--text-faint)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text-strong)] disabled:opacity-30"
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <div
            ref={zoomTrackRef}
            className="relative flex-1 h-5 flex items-center cursor-pointer group touch-none"
            onPointerDown={(e) => {
              e.preventDefault();
              isDraggingRef.current = true;
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              setZoom(MIN_ZOOM + pct * (MAX_ZOOM - MIN_ZOOM));

              const onMove = (ev: PointerEvent) => {
                if (!isDraggingRef.current) return;
                const r = zoomTrackRef.current?.getBoundingClientRect();
                if (!r) return;
                const p = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
                setZoom(MIN_ZOOM + p * (MAX_ZOOM - MIN_ZOOM));
              };
              const onUp = () => {
                isDraggingRef.current = false;
                window.removeEventListener("pointermove", onMove);
                window.removeEventListener("pointerup", onUp);
              };

              window.addEventListener("pointermove", onMove);
              window.addEventListener("pointerup", onUp);
            }}
          >
            <div className="absolute inset-x-0 h-1 rounded-full bg-[var(--border-subtle)]" />
            <div
              className="absolute h-1 rounded-full bg-[var(--primary)]"
              style={{ width: `${((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100}%` }}
            />
            <div
              className="absolute h-4 w-4 rounded-full border-2 border-[var(--primary)] bg-[var(--surface)] shadow-md -translate-x-1/2 transition-transform group-hover:scale-110"
              style={{ left: `${((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => setZoom((prev) => Math.min(MAX_ZOOM, +(prev + 0.2).toFixed(1)))}
            className="grid h-7 w-7 place-items-center rounded-md text-[var(--text-faint)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text-strong)] disabled:opacity-30"
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-[var(--border-subtle)] px-5 py-4">
          <Button type="button" variant="secondary" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={16} className="mr-1.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
