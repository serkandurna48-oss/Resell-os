import { Suspense } from "react";
import { getItems } from "@/actions/items";
import { prisma } from "@/lib/prisma";
import { ItemStatus } from "@prisma/client";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import ItemsFilters from "./items-filters";
import NewItemDialog from "./new-item-dialog";
import AdvanceStatusButton from "./advance-status-button";
import DeleteItemButton from "./delete-item-button";
import ItemRow from "./item-row";
import ActionsCell from "./actions-cell";

const CONDITION_LABELS: Record<string, string> = {
  neu: "Neu",
  sehr_gut: "Sehr gut",
  gut: "Gut",
  akzeptabel: "Akzeptabel",
};

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const { status, search } = await searchParams;

  const validStatus = status && status in STATUS_LABELS
    ? (status as ItemStatus)
    : undefined;

  const [items, rawPlatforms, storageLocations, categories] = await Promise.all([
    getItems({ status: validStatus, search }),
    prisma.platform.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.storageLocation.findMany({ where: { isActive: true }, orderBy: { code: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  const platforms = rawPlatforms.map((p) => ({
    ...p,
    defaultFeePct: p.defaultFeePct !== null ? Number(p.defaultFeePct) : null,
  }));

  return (
    <main className="px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Items</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{items.length} Einträge</p>
        </div>
        <NewItemDialog platforms={platforms} storageLocations={storageLocations} categories={categories} />
      </div>

      {/* Filter */}
      <Suspense fallback={null}>
        <ItemsFilters />
      </Suspense>

      {/* Tabelle */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-border bg-background px-5 py-12 text-center text-sm text-muted-foreground">
          Keine Items gefunden.
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-background overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Item</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Kategorie</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Zustand</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Status</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">EK</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Ziel</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Plattform</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground whitespace-nowrap">Lager</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <ItemRow key={item.id} itemId={item.id}>
                  <td className="px-4 py-3 max-w-[220px]">
                    <div className="font-medium truncate">{item.title}</div>
                    {(item.brand || item.size) && (
                      <div className="text-xs text-muted-foreground truncate">
                        {[item.brand, item.size].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{item.category}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {CONDITION_LABELS[item.condition] ?? item.condition}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status]}`}>
                      {STATUS_LABELS[item.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                    {formatCurrency(Number(item.purchasePrice))}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground whitespace-nowrap">
                    {item.targetPrice ? formatCurrency(Number(item.targetPrice)) : "–"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {item.platform?.name ?? "–"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {item.storageLocation?.code ?? "–"}
                  </td>
                  <ActionsCell>
                    <div className="flex items-center justify-end gap-1">
                      <AdvanceStatusButton itemId={item.id} currentStatus={item.status} />
                      <DeleteItemButton itemId={item.id} />
                    </div>
                  </ActionsCell>
                </ItemRow>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
