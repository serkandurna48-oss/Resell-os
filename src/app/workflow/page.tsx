import { prisma } from "@/lib/prisma";
import { WORKFLOW_COLUMNS } from "@/lib/constants";
import KanbanBoard from "./kanban-board";

export default async function WorkflowPage() {
  const items = await prisma.item.findMany({
    where: { status: { in: WORKFLOW_COLUMNS } },
    select: {
      id: true,
      title: true,
      brand: true,
      size: true,
      category: true,
      status: true,
      purchasePrice: true,
      targetPrice: true,
      platform: { select: { name: true } },
      storageLocation: { select: { code: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const serializedItems = items.map((item) => ({
    ...item,
    purchasePrice: Number(item.purchasePrice),
    targetPrice: item.targetPrice !== null ? Number(item.targetPrice) : null,
  }));

  return (
    <div className="flex flex-col h-full px-8 py-8 gap-6 overflow-hidden">
      <div>
        <h1 className="text-xl font-semibold">Workflow</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {serializedItems.length} aktive Items
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <KanbanBoard initialItems={serializedItems as Parameters<typeof KanbanBoard>[0]["initialItems"]} />
      </div>
    </div>
  );
}
