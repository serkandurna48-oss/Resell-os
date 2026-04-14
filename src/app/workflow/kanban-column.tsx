"use client";

import { useDroppable } from "@dnd-kit/core";
import { ItemStatus } from "@prisma/client";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import KanbanCard, { type KanbanItem } from "./kanban-card";

export default function KanbanColumn({
  status,
  items,
}: {
  status: ItemStatus;
  items: KanbanItem[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex-shrink-0 w-56 flex flex-col gap-2">
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
          {STATUS_LABELS[status]}
        </span>
        {items.length > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={[
          "flex-1 min-h-24 rounded-xl p-2 flex flex-col gap-2 transition-colors",
          isOver ? "bg-muted ring-2 ring-ring/30" : "bg-muted/40",
        ].join(" ")}
      >
        {items.map((item) => (
          <KanbanCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
