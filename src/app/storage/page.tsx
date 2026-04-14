import { prisma } from "@/lib/prisma";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

const TYPE_LABELS: Record<string, string> = {
  stange: "Kleiderstange",
  regal: "Regal",
  box: "Box",
  versandzone: "Versandzone",
  sonstiges: "Sonstiges",
};

const TYPE_COLORS: Record<string, string> = {
  stange: "bg-violet-100 text-violet-800",
  regal: "bg-blue-100 text-blue-800",
  box: "bg-amber-100 text-amber-800",
  versandzone: "bg-teal-100 text-teal-800",
  sonstiges: "bg-slate-100 text-slate-700",
};

export default async function StoragePage() {
  const locations = await prisma.storageLocation.findMany({
    where: { isActive: true },
    include: {
      items: {
        select: {
          id: true,
          title: true,
          brand: true,
          size: true,
          status: true,
          purchasePrice: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { code: "asc" },
  });

  const totalItems = locations.reduce((s, l) => s + l.items.length, 0);
  const totalValue = locations.reduce(
    (s, l) => s + l.items.reduce((s2, i) => s2 + Number(i.purchasePrice), 0),
    0
  );

  return (
    <main className="px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Lagerorte</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalItems} Items · EK-Wert {formatCurrency(totalValue)}
          </p>
        </div>
        <Link
          href="/settings"
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          Lagerorte verwalten →
        </Link>
      </div>

      {/* Locations */}
      {locations.length === 0 ? (
        <div className="rounded-xl border border-border bg-background px-5 py-12 text-center text-sm text-muted-foreground">
          Keine Lagerorte angelegt.{" "}
          <Link href="/settings" className="underline underline-offset-2">
            Jetzt erstellen
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {locations.map((loc) => (
            <div key={loc.id} className="space-y-2">
              {/* Location header */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold">{loc.code}</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    TYPE_COLORS[loc.type] ?? "bg-muted text-muted-foreground"
                  }`}
                >
                  {TYPE_LABELS[loc.type] ?? loc.type}
                </span>
                {loc.description && (
                  <span className="text-sm text-muted-foreground">{loc.description}</span>
                )}
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                  {loc.items.length} {loc.items.length === 1 ? "Item" : "Items"}
                </span>
              </div>

              {loc.items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border px-5 py-4 text-xs text-muted-foreground">
                  Leer
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-background overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-border">
                      {loc.items.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-2.5">
                            <Link
                              href={`/items/${item.id}`}
                              className="font-medium hover:underline underline-offset-2"
                            >
                              {item.title}
                            </Link>
                            {(item.brand || item.size) && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                {[item.brand, item.size].filter(Boolean).join(" · ")}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status]}`}
                            >
                              {STATUS_LABELS[item.status]}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums text-xs">
                            EK {formatCurrency(Number(item.purchasePrice))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
