"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProjectGalleryImage } from "@/lib/public-content";

interface ProjectGalleryProps {
  coverImage: string;
  coverAlt: string;
  gallery: ProjectGalleryImage[];
  projectTitle: string;
}

export function ProjectGallery({ coverImage, coverAlt, gallery, projectTitle }: ProjectGalleryProps) {
  const [activeImage, setActiveImage] = useState(() => ({ url: coverImage, alt: coverAlt }));
  const [isLoaded, setIsLoaded] = useState(false);

  const handleThumbClick = (image: ProjectGalleryImage) => {
    setActiveImage({ url: image.url, alt: image.alt || projectTitle });
  };

  const isActive = (image: ProjectGalleryImage) => image.url === activeImage.url;

  if (gallery.length === 0) {
    return (
      <div className="overflow-hidden rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--background-elevated)] shadow-[0_30px_90px_color-mix(in_oklch,var(--primary)_18%,transparent)]">
        <div className="flex h-10 items-center gap-1.5 border-b border-[color:var(--border-subtle)] px-4" aria-hidden="true">
          <span className="size-2 rounded-full bg-[color:var(--accent)]" />
          <span className="size-2 rounded-full bg-[color:var(--primary)]/55" />
          <span className="size-2 rounded-full bg-[color:var(--text-faint)]/35" />
          <span className="ml-3 h-5 flex-1 rounded-md bg-[color:var(--surface-soft)]" />
        </div>
        <div className="relative aspect-[16/10] bg-[color:var(--surface)]">
          <Image
            src={coverImage}
            alt={coverAlt}
            fill
            priority
            className="object-cover object-top"
            sizes="(max-width: 1024px) 100vw, 58vw"
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--background-elevated)] shadow-[0_30px_90px_color-mix(in_oklch,var(--primary)_18%,transparent)]">
      <div className="flex h-10 items-center gap-1.5 border-b border-[color:var(--border-subtle)] px-4" aria-hidden="true">
        <span className="size-2 rounded-full bg-[color:var(--accent)]" />
        <span className="size-2 rounded-full bg-[color:var(--primary)]/55" />
        <span className="size-2 rounded-full bg-[color:var(--text-faint)]/35" />
        <span className="ml-3 h-5 flex-1 rounded-md bg-[color:var(--surface-soft)]" />
      </div>
      <div className="relative aspect-[16/10] bg-[color:var(--surface)]">
        <Image
          src={activeImage.url}
          alt={activeImage.alt}
          fill
          priority={!isLoaded}
          className={cn("object-cover object-top transition-opacity duration-300", !isLoaded ? "opacity-0" : "opacity-100")}
          sizes="(max-width: 1024px) 100vw, 58vw"
          onLoad={() => setIsLoaded(true)}
        />
      </div>
      <div className="flex flex-wrap gap-2 px-4 py-4" role="tablist" aria-label="Project screenshots">
        <button
          role="tab"
          aria-selected={activeImage.url === coverImage}
          onClick={() => setActiveImage({ url: coverImage, alt: coverAlt })}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-[12px] border-2 transition-all duration-200",
            "bg-[color:var(--surface)] px-2 py-1.5",
            activeImage.url === coverImage
              ? "border-[color:var(--primary)] ring-2 ring-[color:var(--primary)]/20"
              : "border-[color:var(--border-subtle)] hover:border-[color:var(--primary)]/40"
          )}
          aria-label={`View main preview`}
        >
          <Image
            src={coverImage}
            alt=""
            width={56}
            height={36}
            className="rounded-[8px] object-cover object-top"
            sizes="56px"
          />
          <span className="text-[11px] font-semibold text-[color:var(--text-muted)] truncate max-w-[80px]">Main</span>
        </button>
        {gallery.map((image, index) => (
          <button
            key={`${image.url}-${index}`}
            role="tab"
            aria-selected={isActive(image)}
            onClick={() => handleThumbClick(image)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-[12px] border-2 transition-all duration-200",
              "bg-[color:var(--surface)] px-2 py-1.5",
              isActive(image)
                ? "border-[color:var(--primary)] ring-2 ring-[color:var(--primary)]/20"
                : "border-[color:var(--border-subtle)] hover:border-[color:var(--primary)]/40"
            )}
            aria-label={`View screenshot ${index + 1}`}
          >
            <Image
              src={image.url}
              alt=""
              width={56}
              height={36}
              className="rounded-[8px] object-cover object-top"
              sizes="56px"
            />
            <span className="text-[11px] font-semibold text-[color:var(--text-muted)] truncate max-w-[80px]">
              {image.caption || `View ${index + 1}`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}