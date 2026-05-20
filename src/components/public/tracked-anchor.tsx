"use client";

import type { AnchorHTMLAttributes } from "react";
import { trackEvent } from "@/lib/analytics-client";

type TrackedAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  eventType: string;
  eventPage: string;
  eventSource: string;
  siteSlug?: string;
  eventMetadata?: Record<string, unknown>;
};

export function TrackedAnchor({
  eventType,
  eventPage,
  eventSource,
  siteSlug,
  eventMetadata,
  onClick,
  children,
  ...props
}: TrackedAnchorProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        trackEvent({
          eventType,
          siteSlug,
          page: eventPage,
          source: eventSource,
          metadata: eventMetadata
        });
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
