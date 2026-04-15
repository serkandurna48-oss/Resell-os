"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteItem } from "@/actions/items";
import { Button } from "@/components/ui/button";

export default function DeleteItemButton({
  itemId,
  redirectAfter = false,
}: {
  itemId: string;
  redirectAfter?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  if (!confirming) {
    return (
      <Button
        size="sm"
        variant="ghost"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => setConfirming(true)}
      >
        Löschen
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Sicher?</span>
      <Button
        size="sm"
        variant="destructive"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await deleteItem(itemId);
            if (redirectAfter) router.push("/items");
          })
        }
      >
        {isPending ? "..." : "Ja, löschen"}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={isPending}
        onClick={() => setConfirming(false)}
      >
        Abbrechen
      </Button>
    </div>
  );
}
