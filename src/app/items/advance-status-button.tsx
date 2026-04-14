"use client";

import { useTransition } from "react";
import { advanceStatus } from "@/actions/items";
import { ItemStatus } from "@prisma/client";
import { STATUS_FLOW } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export default function AdvanceStatusButton({
  itemId,
  currentStatus,
}: {
  itemId: string;
  currentStatus: ItemStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const nextStatus = STATUS_FLOW[currentStatus];

  if (!nextStatus) return null;

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => startTransition(() => { void advanceStatus(itemId); })}
    >
      {isPending ? "..." : "Weiter →"}
    </Button>
  );
}
