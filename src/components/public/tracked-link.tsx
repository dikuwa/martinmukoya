"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackEvent } from "@/lib/analytics-client";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  eventType: string;
  eventPage: string;
  eventSource: string;
  siteSlug?: string;
  eventMetadata?: Record<string, unknown>;
};

export function TrackedLink({
  eventType,
  eventPage,
  eventSource,
  siteSlug,
  eventMetadata,
  onClick,
  children,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
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
    </Link>
  );
}
