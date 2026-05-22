"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";

export function DeleteButton({
  endpoint,
  redirectTo = ".",
  label = "Delete"
}: {
  endpoint: string;
  redirectTo?: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function onDelete() {
    setPending(true);

    const response = await fetch(endpoint, { method: "DELETE" });
    setPending(false);

    if (!response.ok) {
      toast.error("Delete failed");
      return;
    }

    toast.success("Record deleted");
    setConfirming(false);
    router.push(redirectTo);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-[#ef4444]">Are you sure?</span>
        <Button type="button" variant="danger" size="sm" onClick={onDelete} disabled={pending}>
          {pending ? "Deleting..." : "Confirm"}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => setConfirming(false)} aria-label="Cancel">
          <X size={14} />
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      onClick={() => setConfirming(true)}
      disabled={pending}
    >
      <Trash2 size={14} />
      {label}
    </Button>
  );
}
