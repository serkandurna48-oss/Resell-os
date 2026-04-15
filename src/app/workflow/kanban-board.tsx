"use client";

import { useState, useTransition, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { ItemStatus } from "@prisma/client";
import { WORKFLOW_COLUMNS } from "@/lib/constants";
import { updateStatus } from "@/actions/items";
import KanbanColumn from "./kanban-column";
import KanbanCard, { type KanbanItem } from "./kanban-card";

export default function KanbanBoard({
  initialItems,
}: {
  initialItems: KanbanItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Sync server data into local state after revalidation / navigation
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const byStatus = WORKFLOW_COLUMNS.reduce<Record<ItemStatus, KanbanItem[]>>(
    (acc, status) => {
      acc[status] = items.filter((i) => i.status === status);
      return acc;
    },
    {} as Record<ItemStatus, KanbanItem[]>
  );

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over) return;

    const itemId = active.id as string;
    const newStatus = over.id as ItemStatus;
    const current = items.find((i) => i.id === itemId);
    if (!current || current.status === newStatus) return;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status: newStatus } : i))
    );

    startTransition(() => {
      void updateStatus(itemId, newStatus);
    });
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-3 h-full overflow-x-auto pb-4">
        {WORKFLOW_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            items={byStatus[status] ?? []}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
        {activeItem && <KanbanCard item={activeItem} isOverlay />}
      </DragOverlay>
    </DndContext>
  );
}
