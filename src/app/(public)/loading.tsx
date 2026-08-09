import { GsapEntrance } from "@/components/public/gsap";
import {
  PublicSkeletonHero,
  PublicSkeletonSection,
} from "@/components/ui/skeleton-card";

/**
 * Public route-group loading state.
 * Shown by Next.js while the server components stream in. Matches the brand
 * palette (deep purple bg, violet shimmer highlight) and layers a GSAP cascade
 * on mount so the skeleton feels intentional rather than static. Falls back to
 * fully-visible markup under prefers-reduced-motion.
 */
export default function PublicLoading() {
  return (
    <GsapEntrance
      aria-label="Loading page content"
      aria-busy="true"
      y={26}
      stagger={0.09}
      className="grid w-full"
    >
      <PublicSkeletonHero />
      <PublicSkeletonSection cardCount={4} />
      <PublicSkeletonSection cardCount={3} />
    </GsapEntrance>
  );
}
