import { SkeletonChatPane } from "@/components/ui/skeleton-card";

export default function ChatLoading() {
  return (
    <div className="grid gap-6">
      <SkeletonChatPane />
    </div>
  );
}
