"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ItemStatus } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";

export type KanbanItem = {
  id: string;
  title: string;
  brand: string | null;
  size: string | null;
  category: string;
  status: ItemStatus;
  purchasePrice: unknown;
  targetPrice: unknown;
  platform: { name: string } | null;
  storageLocation: { code: string } | null;
};

export default function KanbanCard({
  item,
  isOverlay = false,
}: {
  item: KanbanItem;
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
      className={[
        "rounded-lg border border-border bg-background p-3 space-y-1.5",
        "cursor-grab active:cursor-grabbing select-none touch-none",
        isDragging ? "opacity-40" : "hover:border-ring/40 transition-colors",
        isOverlay ? "shadow-xl rotate-1 opacity-95" : "",
      ].join(" ")}
    >
      <p className="text-sm font-medium leading-tight line-clamp-2">{item.title}</p>

      {(item.brand || item.size) && (
        <p className="text-xs text-muted-foreground">
          {[item.brand, item.size].filter(Boolean).join(" · ")}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="truncate">{item.category}</span>
        <span className="tabular-nums shrink-0 font-medium text-foreground">
          {formatCurrency(Number(item.purchasePrice))}
        </span>
      </div>

      {(item.platform || item.storageLocation) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {item.platform && <span>{item.platform.name}</span>}
          {item.platform && item.storageLocation && <span>·</span>}
          {item.storageLocation && <span>{item.storageLocation.code}</span>}
        </div>
      )}
    </div>
  );
}
