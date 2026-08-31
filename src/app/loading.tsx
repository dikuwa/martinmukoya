import { SkeletonText } from "@/components/ui/skeleton-card";

/** Fallback loading state for routes outside (public) and admin groups — login, auth, shared docs. */
export default function Loading() {
  return (
    <div className="mx-auto grid max-w-[1200px] gap-6 px-4 py-16 sm:px-6 lg:px-8">
      {/* Simple centered content shape */}
      <div className="mx-auto w-full max-w-lg space-y-4">
        <div className="admin-skeleton h-8 w-1/2 rounded-lg" />
        <SkeletonText width="3/4" />
        <SkeletonText />
        <SkeletonText width="5/6" />
        <div className="mt-6 h-11 w-40 rounded-xl" />
      </div>
    </div>
  );
}
