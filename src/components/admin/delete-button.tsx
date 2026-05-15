"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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

  async function onDelete() {
    if (!window.confirm("Delete this record? This cannot be undone.")) return;
    setPending(true);

    const response = await fetch(endpoint, { method: "DELETE" });
    setPending(false);

    if (!response.ok) {
      toast.error("Delete failed");
      return;
    }

    toast.success("Record deleted");
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <Button type="button" variant="danger" onClick={onDelete} disabled={pending}>
      {pending ? "Deleting..." : label}
    </Button>
  );
}
